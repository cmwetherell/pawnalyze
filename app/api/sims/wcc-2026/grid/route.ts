import { NextRequest, NextResponse } from 'next/server';

import { getWccGrid } from '@/lib/wcc/queries';

/** The raw model W/D/L grid for the what-if lab; keyed by model version, so it never changes. */
export async function GET(req: NextRequest) {
  try {
    const version = req.nextUrl.searchParams.get('v');
    if (!version || version.length > 64) return NextResponse.json({ error: 'Missing model version' }, { status: 400 });
    const grid = await getWccGrid(version);
    if (!grid) {
      return NextResponse.json({ error: 'not_found' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=300' } });
    }
    // Round to 5 decimals: plenty for interpolation, and about a third smaller on the wire.
    const body = { ...grid, wdl: grid.wdl.map(v => Math.round(v * 1e5) / 1e5) };
    return NextResponse.json(body, {
      headers: { 'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable' },
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
