import { N_ROUNDS } from './config';
import type { Match, Run } from './types';

/**
 * complete – results baked into the current run (round <= rounds_completed)
 * paired   – pairings published (maybe even played) but not yet in the run; picks allowed
 * unpaired – no pairings yet; only team-path picks
 */
export type RoundState = 'complete' | 'paired' | 'unpaired';

export function roundState(round: number, run: Run | null, matches: Match[]): RoundState {
  const completed = run?.roundsCompleted ?? 0;
  if (round <= completed) return 'complete';
  return matches.some(m => m.round === round) ? 'paired' : 'unpaired';
}

export function allRounds(): number[] {
  return Array.from({ length: N_ROUNDS }, (_, i) => i + 1);
}

/** The first round a user can pick in (rounds_completed + 1), or null when the event is over. */
export function firstOpenRound(run: Run | null): number | null {
  const next = (run?.roundsCompleted ?? 0) + 1;
  return next > N_ROUNDS ? null : next;
}

export function roundLabel(round: number): string {
  return `R${round}`;
}
