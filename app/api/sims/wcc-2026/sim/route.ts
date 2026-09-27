import { NextRequest, NextResponse } from 'next/server';

import { getWccRun, getWccSim } from '@/lib/wcc/queries';

/** One stored simulation of the current run, by position (0..n_sims-1). Immutable per run. */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const run = await getWccRun();
    if (!run) return NextResponse.json({ error: 'no_run' }, { status: 404 });
    const requested = Number(searchParams.get('run'));
    if (!Number.isInteger(requested) || requested !== run.runId) {
      return NextResponse.json({ error: 'stale_run', currentRun: run.runId }, { status: 410 });
    }
    const id = Number(searchParams.get('id'));
    if (!Number.isInteger(id) || id < 0 || id >= run.nSims) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const sim = await getWccSim(run.runId, id);
    if (!sim) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(sim, {
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable' },
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
