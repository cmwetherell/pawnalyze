import { validateFen } from 'chess.js';
import { NextRequest, NextResponse } from 'next/server';

/** Elocator sleeps when idle; a cold start takes around 20 s. */
export const maxDuration = 60;
const ELOCATOR = 'https://elocator.fly.dev/complexity/';
const TIMEOUT_MS = 50_000;

/**
 * GET /api/live/complexity?fen=… -> { complexity: 1..100 }
 *
 * A cacheable front for the Elocator API: the score is a pure function of the position (board, side
 * to move, castling, en passant), so the CDN keeps each one and a crowd watching a live game costs
 * Elocator one call per position. Failures are never cached.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('fen')?.trim() ?? '';
  const parts = raw.split(/\s+/);
  const fen = raw.length <= 100 && parts.length >= 4 ? `${parts.slice(0, 4).join(' ')} 0 1` : '';
  if (!fen || !validateFen(fen).ok) {
    return NextResponse.json({ error: 'invalid_fen' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const res = await fetch(ELOCATOR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { complexity_score: c } = await res.json() as { complexity_score?: unknown };
    if (typeof c !== 'number' || !Number.isFinite(c)) throw new Error('no score in response');
    return NextResponse.json({ complexity: c }, {
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=2592000' },
    });
  } catch (e: unknown) {
    console.error('[live] Elocator request failed:', e instanceof Error ? e.message : String(e));
    return NextResponse.json({ error: 'elocator_unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
