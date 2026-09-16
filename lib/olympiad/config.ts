import type { OlympiadEvent } from './types';

export const N_ROUNDS = 11;
export const MAX_PICKS = 30;
export const LOW_SAMPLE_THRESHOLD = 200;

export interface OlympiadEventConfig {
  event: OlympiadEvent;
  slug: string;
  title: string;
  shortTitle: string;
  tnr: number;
  chessResultsUrl: string;
  description: string;
  format: string;
  startDate: string;
  endDate: string;
}

export const OLYMPIAD_EVENTS: Record<OlympiadEvent, OlympiadEventConfig> = {
  open: {
    event: 'open',
    slug: 'chess-olympiad-2026',
    title: '46th Chess Olympiad 2026 — Open',
    shortTitle: 'Chess Olympiad 2026',
    tnr: 1469895,
    chessResultsUrl: 'https://s1.chess-results.com/tnr1469895.aspx?lan=1',
    description:
      'Over 200 national teams battle 4v4 across 11 Swiss rounds in Samarkand, Uzbekistan, for Olympiad gold.',
    format: '11 rounds · 4 boards · Swiss',
    startDate: '2026-09-16',
    endDate: '2026-09-27',
  },
  women: {
    event: 'women',
    slug: 'womens-chess-olympiad-2026',
    title: "46th Chess Olympiad 2026 — Women",
    shortTitle: "Women's Chess Olympiad 2026",
    tnr: 1469896,
    chessResultsUrl: 'https://s1.chess-results.com/tnr1469896.aspx?lan=1',
    description:
      "Nearly 200 national teams battle 4v4 across 11 Swiss rounds in Samarkand, Uzbekistan, for Women's Olympiad gold.",
    format: '11 rounds · 4 boards · Swiss',
    startDate: '2026-09-16',
    endDate: '2026-09-27',
  },
};

export function isOlympiadEvent(value: unknown): value is OlympiadEvent {
  return value === 'open' || value === 'women';
}

export function eventHref(event: OlympiadEvent): string {
  return `/simulations/${OLYMPIAD_EVENTS[event].slug}`;
}
