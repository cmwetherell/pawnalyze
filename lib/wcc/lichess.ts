/**
 * The official Lichess broadcast of the match: one round per classical game ("Game N"), with FIDE
 * ids and the result in each game's PGN headers. Keyless public API, polled by the sync cron.
 */
import { PLAYER_DEFAULTS } from './config';
import type { GameResult, PlayerId } from './types';

export const LICHESS_BROADCAST_ID = 'qfkdt8mn';
const API = 'https://lichess.org/api/broadcast';
const TIMEOUT_MS = 8000;
const HEADERS = { 'User-Agent': 'pawnalyze.com WCC sync' };

export interface BroadcastGame {
  /** Classical game number, from the round name "Game N". */
  gameNo: number;
  roundId: string;
  startsAt: string | null;
  /** Lichess marks a round finished once its game has ended. */
  roundFinished: boolean;
  white: PlayerId | null;
  /** Null while the game is unfinished ("*"). */
  result: GameResult | null;
  hasMoves: boolean;
  pgn: string;
}

interface RoundJson { id: string; name: string; startsAt?: number; finished?: boolean }

async function get(url: string, accept: string): Promise<Response> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { ...HEADERS, accept }, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res;
}

function playerByFideId(id: string | undefined): PlayerId | null {
  const n = Number(id);
  if (n === PLAYER_DEFAULTS[1].fideId) return 1;
  if (n === PLAYER_DEFAULTS[2].fideId) return 2;
  return null;
}

function headers(pgn: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of pgn.matchAll(/^\[(\w+) "((?:[^"\\]|\\.)*)"\]\s*$/gm)) out[m[1]] = m[2];
  return out;
}

/** Split a multi-game PGN export into games (each starts with its [Event] header). */
function splitPgn(all: string): string[] {
  return all.split(/\n\s*\n(?=\[Event )/).map(s => s.trim()).filter(Boolean);
}

/** All classical games the broadcast knows about. Tiebreak rounds are ignored (left to the pipeline). */
export async function fetchBroadcastGames(): Promise<BroadcastGame[]> {
  const tour = await (await get(`${API}/${LICHESS_BROADCAST_ID}`, 'application/json')).json() as { rounds?: RoundJson[] };
  const rounds = new Map<string, { gameNo: number; r: RoundJson }>();
  for (const r of tour.rounds ?? []) {
    const m = /^Game (\d{1,2})$/.exec(r.name.trim());
    if (m && Number(m[1]) >= 1 && Number(m[1]) <= 14) rounds.set(r.id, { gameNo: Number(m[1]), r });
  }
  const pgnAll = await (await get(`${API}/${LICHESS_BROADCAST_ID}.pgn`, 'application/x-chess-pgn')).text();

  const out: BroadcastGame[] = [];
  for (const pgn of splitPgn(pgnAll)) {
    const h = headers(pgn);
    const roundId = /\/([A-Za-z0-9]{8})(?:\/[A-Za-z0-9]{8})?$/.exec(h.GameURL ?? h.BroadcastURL ?? '')?.[1];
    const round = roundId ? rounds.get(roundId) : undefined;
    if (!round) continue;
    const white = playerByFideId(h.WhiteFideId);
    const black = playerByFideId(h.BlackFideId);
    // Only the match game itself: both players identified, on opposite sides.
    if (white === null || black === null || white === black) continue;
    const res = h.Result;
    const moves = pgn.replace(/^\[.*\]\s*$/gm, '').replace(/\{[^}]*\}/g, '').trim();
    out.push({
      gameNo: round.gameNo,
      roundId: round.r.id,
      startsAt: round.r.startsAt ? new Date(round.r.startsAt).toISOString() : null,
      roundFinished: Boolean(round.r.finished),
      white,
      result: res === '1-0' || res === '0-1' || res === '1/2-1/2' ? res : null,
      hasMoves: /\b1\.\s*\S/.test(moves),
      pgn,
    });
  }
  return out.sort((a, b) => a.gameNo - b.gameNo);
}
