import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { TAGS } from '@/lib/wcc/config';
import { fetchLiveMarkets } from '@/lib/wcc/markets';
import { getLastMarketAt, getWccGames, insertMarketSnapshot } from '@/lib/wcc/queries';
import { matchState, snapshotAfterGame } from '@/lib/wcc/status';

/** Snapshots closer together than this are skipped, so the endpoint cannot flood the table. */
const MIN_GAP_MS = 20 * 60_000;

/**
 * Daily (vercel.json) snapshot of the Kalshi and Polymarket prices into wcc_2026_market, tagged
 * with the classical game it follows (raw.after_game), for the odds-over-time chart.
 * If CRON_SECRET is set, Vercel Cron sends it as a bearer token and nothing else may call this.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const now = new Date();
    const state = matchState(await getWccGames());
    const afterGame = snapshotAfterGame(state, now.getTime());
    if (afterGame === null) return NextResponse.json({ recorded: [], skipped: 'match decided, game in progress, or tiebreak day' });

    const live = await fetchLiveMarkets();
    const recorded: string[] = [];
    const skipped: Record<string, string> = {};
    for (const q of [live?.kalshi, live?.polymarket]) {
      if (!q) continue;
      const last = await getLastMarketAt(q.source);
      if (last && now.getTime() - last.getTime() < MIN_GAP_MS) { skipped[q.source] = 'recent snapshot exists'; continue; }
      await insertMarketSnapshot({
        source: q.source,
        asOf: now,
        pWin1: q.pWin1,
        url: q.url,
        raw: { after_game: afterGame, by: 'site-cron', players: q.players, volume: q.volume },
      });
      recorded.push(q.source);
    }
    for (const s of ['kalshi', 'polymarket']) if (!recorded.includes(s) && !skipped[s]) skipped[s] = 'price unavailable';
    if (recorded.length) revalidateTag(TAGS.ref, 'max');
    return NextResponse.json({ afterGame, recorded, skipped });
  } catch (e: unknown) {
    console.error('[wcc] market snapshot failed:', e instanceof Error ? e.stack : JSON.stringify(e));
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
