import { N_ROUNDS } from './config';
import type { Match, Run } from './types';

/**
 * complete  – results baked into the current run (round <= rounds_completed)
 * paired    – pairings published (maybe even played) but not yet in the run; picks allowed
 * projected – pairings not published, but the engine's next-round pairing is fixed; picks allowed
 * unpaired  – no pairings yet; only team-path picks
 */
export type RoundState = 'complete' | 'paired' | 'projected' | 'unpaired';

export function roundState(round: number, run: Run | null, matches: Match[]): RoundState {
  const completed = run?.roundsCompleted ?? 0;
  if (round <= completed) return 'complete';
  const inRound = matches.filter(m => m.round === round);
  if (inRound.length === 0) return 'unpaired';
  return inRound.every(m => m.projected) ? 'projected' : 'paired';
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
