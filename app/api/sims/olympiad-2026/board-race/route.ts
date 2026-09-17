import { NextRequest, NextResponse } from 'next/server';

import { N_PRIZE_BOARDS, isOlympiadEvent } from '@/lib/olympiad/config';
import { getOlympiadBoardRows } from '@/lib/olympiad/queries';

/** Rows change once per round; the client keys requests by the round it was rendered with. */
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const event = searchParams.get('event');
    if (!isOlympiadEvent(event)) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    const board = Number(searchParams.get('board'));
    if (!Number.isInteger(board) || board < 1 || board > N_PRIZE_BOARDS) {
      return NextResponse.json({ error: 'Invalid board' }, { status: 400 });
    }
    const rows = await getOlympiadBoardRows(event, board);
    return NextResponse.json(rows, { headers: CACHE_HEADERS });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error', details: e instanceof Error ? e.message : 'unknown' }, { status: 500 });
  }
}
