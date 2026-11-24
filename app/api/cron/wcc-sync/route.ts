import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse, connection } from 'next/server';

import { TAGS } from '@/lib/wcc/config';
import { fetchBroadcastGames, type BroadcastGame } from '@/lib/wcc/lichess';
import { fetchLiveMarkets } from '@/lib/wcc/markets';
import { getLastMarketAt, getWccGamesFresh, insertMarketSnapshot, upsertClassicalGame } from '@/lib/wcc/queries';
import { matchState, snapshotAfterGame } from '@/lib/wcc/status';

/** Snapshots closer together than this are skipped, so the endpoint cannot flood the table. */
const MIN_GAP_MS = 10 * 60_000;

type Row = Awaited<ReturnType<typeof getWccGamesFresh>>[number];

/** What the games table should say for a broadcast game, or null to leave it alone. */
function target(b: BroadcastGame, row: Row | undefined, nowMs: number) {
  if (row && row.status === 'final' && row.source !== 'lichess') return null; // the pipeline's word is final
  if (b.white === null) return null;
  if (b.result && b.roundFinished) {
    if (row?.status === 'final' && row.result === b.result && row.whitePlayerId === b.white) return null;
    return { status: 'final' as const, result: b.result };
  }
  const started = b.startsAt === null || new Date(b.startsAt).getTime() <= nowMs;
  if (b.hasMoves && started && row?.status !== 'live' && row?.status !== 'final') return { status: 'live' as const, result: null };
  return null;
}

/**
 * Every 15 minutes (vercel.json):
 * 1. Sync classical results from the official Lichess broadcast into wcc_2026_games (live while a
 *    game is on, final once Lichess marks the round finished).
 * 2. Once a game is over, save one Kalshi + Polymarket snapshot for it (raw.after_game = N), unless
 *    one has already been taken since that game started (e.g. by the pipeline's upload).
 * If CRON_SECRET is set, Vercel Cron sends it as a bearer token and nothing else may call this.
 */
export async function GET(req: NextRequest) {
  // Always run at request time: never prerender this at build (it reads the clock and writes rows).
  await connection();
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const now = new Date();
    const nowMs = now.getTime();
    let rows = await getWccGamesFresh();

    // 1. Results from Lichess.
    const games: { gameNo: number; status: string; result: string | null }[] = [];
    let lichessError: string | null = null;
    let broadcast: BroadcastGame[] = [];
    try {
      broadcast = await fetchBroadcastGames();
    } catch (err) {
      lichessError = err instanceof Error ? err.message : String(err);
      console.warn(`[wcc] Lichess broadcast fetch failed: ${lichessError}`);
    }
    for (const b of broadcast) {
      const row = rows.find(r => r.stage === 'classical' && r.gameNo === b.gameNo);
      const t = target(b, row, nowMs);
      if (!t || b.white === null) continue;
      const changed = await upsertClassicalGame({
        gameNo: b.gameNo, startsAt: b.startsAt, whitePlayerId: b.white, result: t.result, status: t.status, pgn: b.pgn,
      });
      if (changed) games.push({ gameNo: b.gameNo, status: t.status, result: t.result });
    }
    if (games.length) {
      revalidateTag(TAGS.ref, 'max');
      rows = await getWccGamesFresh();
    }

    // 2. One market snapshot per finished game.
    const state = matchState(rows);
    const afterGame = snapshotAfterGame(state, nowMs);
    const markets: Record<string, string> = {};
    if (afterGame === null) {
      markets.all = 'skipped: match decided, game in progress, or tiebreak day';
    } else {
      const since = afterGame > 0 ? state.classical[afterGame - 1]?.startsAt ?? null : null;
      const sinceMs = since ? new Date(since).getTime() : -Infinity;
      const sources = ['kalshi', 'polymarket'] as const;
      const last = await Promise.all(sources.map(s => getLastMarketAt(s)));
      const due = sources.filter((s, i) => {
        const t = last[i]?.getTime();
        if (t !== undefined && t >= sinceMs) { markets[s] = `have one for game ${afterGame}`; return false; }
        if (t !== undefined && nowMs - t < MIN_GAP_MS) { markets[s] = 'recent snapshot exists'; return false; }
        return true;
      });
      if (due.length) {
        const live = await fetchLiveMarkets();
        for (const s of due) {
          const q = live?.[s];
          if (!q) { markets[s] = 'price unavailable'; continue; }
          await insertMarketSnapshot({
            source: s, asOf: now, pWin1: q.pWin1, url: q.url,
            raw: { after_game: afterGame, by: 'site-cron', players: q.players, volume: q.volume },
          });
          markets[s] = `recorded after game ${afterGame}`;
        }
        if (Object.values(markets).some(v => v.startsWith('recorded'))) revalidateTag(TAGS.ref, 'max');
      }
    }

    return NextResponse.json({ afterGame, games, lichess: lichessError ?? `ok (${broadcast.length} games)`, markets });
  } catch (e: unknown) {
    console.error('[wcc] sync failed:', e instanceof Error ? e.stack : JSON.stringify(e));
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
