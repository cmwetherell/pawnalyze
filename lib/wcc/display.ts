import type { PlayerId } from './types';

/** What the interface shows about one player. */
export interface DisplayPlayer {
  id: PlayerId;
  name: string;
  shortName: string;
  fedCode: string;
  country: string;
  role: string;
  isChampion: boolean;
  fideId: number;
  ratings: { classical: number; rapid: number; blitz: number };
}
export type Players = Record<PlayerId, DisplayPlayer>;

/** "Wed, Nov 25", as the calendar in Geneva says it, month and day never apart; nothing for a game without a date. */
export const genevaDay = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short' }).replace(/ (\d+)$/, '\u00a0$1') : '';
