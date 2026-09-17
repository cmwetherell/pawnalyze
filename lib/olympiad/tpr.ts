import { N_ROUNDS } from './config';

/**
 * FIDE performance-rating maths for the Olympiad board prizes (Regulations 4.6.3):
 * medals go to the highest tournament performance rating (TPR) among players
 * listed on the same board, provided they play at least MIN_GAMES_FOR_PRIZE games.
 */

export const MIN_GAMES_FOR_PRIZE = 8;
/** Rating assumed for an unrated opponent (elo 0 in the broadcast headers). */
export const UNRATED_OPP_RATING = 1400;

/** FIDE table 8.1a: rating difference dp for a fractional score p = index / 100. */
export const DP_TABLE: readonly number[] = [
  -800, -677, -589, -538, -501, -470, -444, -422, -401, -383,
  -366, -351, -336, -322, -309, -296, -284, -273, -262, -251,
  -240, -230, -220, -211, -202, -193, -184, -175, -166, -158,
  -149, -141, -133, -125, -117, -110, -102, -95, -87, -80,
  -72, -65, -57, -50, -43, -36, -29, -21, -14, -7,
  0, 7, 14, 21, 29, 36, 43, 50, 57, 65,
  72, 80, 87, 95, 102, 110, 117, 125, 133, 141,
  149, 158, 166, 175, 184, 193, 202, 211, 220, 230,
  240, 251, 262, 273, 284, 296, 309, 322, 336, 351,
  366, 383, 401, 422, 444, 470, 501, 538, 589, 677,
  800,
];

export type GameScore = 0 | 0.5 | 1;

export interface RatedGame {
  oppRating: number;
  score: GameScore;
}

export interface Performance {
  tpr: number;
  avgOpp: number;
  score: number;
  games: number;
  /** Fractional score rounded to 0.01 */
  p: number;
}

export function dpFor(p: number): number {
  const idx = Math.min(100, Math.max(0, Math.round(p * 100)));
  return DP_TABLE[idx];
}

export function effectiveRating(rating: number | null | undefined): number {
  return rating && rating > 0 ? rating : UNRATED_OPP_RATING;
}

/** Rp = Ra + dp, with Ra the rounded average opponent rating (chess-results convention). */
export function performanceRating(games: RatedGame[]): Performance | null {
  if (games.length === 0) return null;
  const score = games.reduce((a, g) => a + g.score, 0);
  const avgOpp = Math.round(games.reduce((a, g) => a + effectiveRating(g.oppRating), 0) / games.length);
  const p = Math.round((score / games.length) * 100) / 100;
  return { tpr: avgOpp + dpFor(p), avgOpp, score, games: games.length, p };
}

export interface Eligibility {
  eligible: boolean;
  /** Games still needed to reach the minimum */
  needed: number;
  roundsLeft: number;
  /** Can still reach the minimum by playing every remaining round */
  canReach: boolean;
}

export function eligibility(gamesPlayed: number, lastFinalRound: number): Eligibility {
  const roundsLeft = Math.max(0, N_ROUNDS - lastFinalRound);
  const needed = Math.max(0, MIN_GAMES_FOR_PRIZE - gamesPlayed);
  return { eligible: needed === 0, needed, roundsLeft, canReach: needed <= roundsLeft };
}

const RESULT_TOKEN = /(1-0|0-1|1\/2-1\/2|\*)/g;

export interface ParsedPgn {
  /** SAN move text without the result token; empty for an unplayed game */
  moves: string;
  result: string | null;
}

/**
 * The pipeline's PGN exporter accumulates every earlier game of the round in front of
 * the real one (each game still ends with its own result token), so keep only the last
 * segment. Works unchanged once the pipeline stores clean per-game PGNs.
 */
export function parseGamePgn(raw: string | null | undefined): ParsedPgn {
  if (!raw) return { moves: '', result: null };
  const text = raw.trim();
  const tokens = [...text.matchAll(RESULT_TOKEN)];
  if (tokens.length === 0) return { moves: text.replace(/\s+/g, ' '), result: null };
  const last = tokens[tokens.length - 1];
  const prev = tokens.length >= 2 ? tokens[tokens.length - 2] : null;
  const start = prev ? (prev.index ?? 0) + prev[0].length : 0;
  const moves = text.slice(start, last.index).replace(/\s+/g, ' ').trim();
  return { moves, result: last[0] };
}

/** "Lastname, Firstname" → "Firstname Lastname"; names without a comma are left alone. */
export function displayName(name: string): string {
  const i = name.indexOf(',');
  if (i < 0) return name.trim();
  const last = name.slice(0, i).trim();
  const first = name.slice(i + 1).trim();
  return first ? `${first} ${last}` : last;
}

/** 4.5 of 6 → "4½/6" */
export function formatScore(score: number, games: number): string {
  const whole = Math.floor(score);
  const half = score - whole >= 0.5;
  const s = whole === 0 && half ? '½' : `${whole}${half ? '½' : ''}`;
  return `${s}/${games}`;
}
