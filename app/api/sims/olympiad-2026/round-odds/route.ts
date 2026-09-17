import { NextRequest, NextResponse } from 'next/server';

import { N_ROUNDS, isOlympiadEvent } from '@/lib/olympiad/config';
import { parseFilters } from '@/lib/olympiad/filters';
import { getOlympiadRoundOdds, getOlympiadRun, getOlympiadSummary } from '@/lib/olympiad/queries';

const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const event = searchParams.get('event');
    if (!isOlympiadEvent(event)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const run = await getOlympiadRun(event);
    if (!run) return NextResponse.json({ error: 'no_run' }, { status: 404 });

    const requestedRun = Number(searchParams.get('run'));
    if (!Number.isInteger(requestedRun) || requestedRun !== run.runId) {
      return NextResponse.json({ error: 'stale_run', currentRun: run.runId }, { status: 410 });
    }

    const round = Number(searchParams.get('round'));
    if (!Number.isInteger(round) || round <= run.roundsCompleted || round > N_ROUNDS) {
      return NextResponse.json({ error: 'Round must be after the last simulated round' }, { status: 400 });
    }

    const summary = await getOlympiadSummary(event, run.runId);
    const participantIds = new Set(summary.map(s => s.teamId));
    const parsed = parseFilters(searchParams.get('filters'), {
      roundsCompleted: run.roundsCompleted,
      nTeams: run.nTeams,
      participantIds,
    });
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const odds = await getOlympiadRoundOdds(event, run.runId, round, run.nTeams, parsed.picks);
    for (const id of Object.keys(odds.teams)) {
      if (!participantIds.has(Number(id))) delete odds.teams[Number(id)];
    }
    return NextResponse.json(odds, { headers: CACHE_HEADERS });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}
