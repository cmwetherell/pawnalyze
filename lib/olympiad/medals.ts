import { N_ROUNDS } from './config';
import { MIN_GAMES_FOR_PRIZE } from './tpr';
import type { PlayerRaceRow } from './types';

interface RaceRow { fideId: number; tpr: number | null; canReach: boolean }
export type MedalPlace = 1 | 2 | 3;

/** Players who can win a board medal, best first: a performance rating, and the eight games played or still within reach. */
export function contenders<R extends RaceRow>(rows: readonly R[]): R[] {
  return rows.filter(r => r.tpr !== null && r.canReach);
}

/** Who holds gold, silver and bronze on one board, by FIDE id. `rows` is the whole board, ranked. */
export function medalPlaces(rows: readonly RaceRow[]): Map<number, MedalPlace> {
  return new Map(contenders(rows).slice(0, 3).map((r, i) => [r.fideId, (i + 1) as MedalPlace]));
}

/** The gold place changed hands in the last round. */
export function hasNewLeader(rows: readonly PlayerRaceRow[], lastRound: number): boolean {
  const leader = contenders(rows)[0];
  if (!leader || lastRound < 2) return false;
  // Out of reach after the previous round: fewer games than the rounds that were left could make up.
  const before = lastRound - 1;
  const then = rows
    .filter(r => (r.rankByRound[before - 1] ?? null) !== null && MIN_GAMES_FOR_PRIZE - r.form.filter(f => f.round <= before).length <= N_ROUNDS - before)
    .sort((a, b) => (a.rankByRound[before - 1] ?? 0) - (b.rankByRound[before - 1] ?? 0));
  return then.length > 0 && then[0].fideId !== leader.fideId;
}
