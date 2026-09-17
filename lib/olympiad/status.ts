import { N_ROUNDS } from './config';
import type { OlympiadStatus } from './types';

/** Header status pill shared by the odds and board-race pages. */
export function statusPillFor(status: OlympiadStatus, startDate: string): { text: string; live?: boolean } {
  const finished = status.lastFinalRound >= N_ROUNDS;
  if (finished) return { text: 'Final', live: false };
  if (status.anyLive) return { text: `Round ${status.lastFinalRound + 1} in progress`, live: true };
  if (status.lastFinalRound > 0) return { text: `After round ${status.lastFinalRound} of ${N_ROUNDS}`, live: false };
  const startLabel = new Date(startDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return { text: `Starts ${startLabel}`, live: false };
}
