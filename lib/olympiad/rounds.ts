import { N_ROUNDS } from './config';
import type { Match, Run } from './types';

/**
 * complete  – results baked into the current run (round <= rounds_completed)
 * played    – every match is final but the run predates it; picks are locked, "apply results" is offered
 * paired    – pairings published (maybe partly played); picks allowed
 * projected – pairings not published, but the engine's next-round pairing is fixed; picks allowed
 * unpaired  – no pairings yet; only team-path picks
 */
export type RoundState = 'complete' | 'played' | 'paired' | 'projected' | 'unpaired';

export function roundState(round: number, run: Run | null, matches: Match[]): RoundState {
  const completed = run?.roundsCompleted ?? 0;
  if (round <= completed) return 'complete';
  const inRound = matches.filter(m => m.round === round);
  if (inRound.length === 0) return 'unpaired';
  if (inRound.every(m => m.projected)) return 'projected';
  if (inRound.every(m => m.status === 'final')) return 'played';
  return 'paired';
}

export function allRounds(): number[] {
  return Array.from({ length: N_ROUNDS }, (_, i) => i + 1);
}

/** The first round a user can pick in (rounds_completed + 1), or null when the event is over. */
export function firstOpenRound(run: Run | null): number | null {
  const next = (run?.roundsCompleted ?? 0) + 1;
  return next > N_ROUNDS ? null : next;
}

/** The latest round with any played or in-progress match, or null before round 1 starts. */
export function latestActiveRound(matches: Match[]): number | null {
  let best: number | null = null;
  for (const m of matches) {
    if ((m.status === 'final' || m.status === 'live') && (best === null || m.round > best)) best = m.round;
  }
  return best;
}
