import { NextRequest, NextResponse } from 'next/server';

import { isOlympiadEvent } from '@/lib/olympiad/config';
import { parseFilters } from '@/lib/olympiad/filters';
import { getOlympiadRun, getOlympiadScenario, getOlympiadSummary } from '@/lib/olympiad/queries';

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

    const summary = await getOlympiadSummary(event, run.runId);
    const participantIds = new Set(summary.map(s => s.teamId));

    const parsed = parseFilters(searchParams.get('filters'), {
      roundsCompleted: run.roundsCompleted,
      nTeams: run.nTeams,
      participantIds,
    });
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    if (parsed.picks.length === 0) {
      return NextResponse.json({ error: 'At least one pick is required' }, { status: 400 });
    }

    // Expected rank / MP only for picked teams + explicitly requested teams (each id costs a pass).
    const teamIds = new Set<number>(parsed.picks.map(p => p.teamId));
    const extra = searchParams.get('teams');
    if (extra) {
      for (const raw of extra.split(',')) {
        const id = Number(raw);
        if (participantIds.has(id)) teamIds.add(id);
      }
    }

    const result = await getOlympiadScenario(
      event,
      run.runId,
      parsed.picks,
      Array.from(teamIds).sort((a, b) => a - b),
    );

    return NextResponse.json(result, { headers: CACHE_HEADERS });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}
