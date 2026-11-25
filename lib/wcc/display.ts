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
