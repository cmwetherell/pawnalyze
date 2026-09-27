import { N_ROUNDS } from './config';
import type { OlympiadStatus } from './types';

/** The event is over: every round has a final result. */
export function isFinished(status: OlympiadStatus): boolean {
  return status.lastFinalRound >= N_ROUNDS;
}

/** Header status pill shared by the odds and board-race pages. */
export function statusPillFor(status: OlympiadStatus, startDate: string): { text: string; live?: boolean } {
  if (isFinished(status)) return { text: 'Final', live: false };
  if (status.anyLive) return { text: `Round ${status.lastFinalRound + 1} in progress`, live: true };
  if (status.lastFinalRound > 0) return { text: `After round ${status.lastFinalRound} of ${N_ROUNDS}`, live: false };
  const startLabel = new Date(startDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return { text: `Starts ${startLabel}`, live: false };
}
