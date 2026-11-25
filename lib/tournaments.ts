import type { OlympiadEvent } from './olympiad/types';
import type { EventTable } from './simulations';

/** A finished event outside the Olympiad tables: what the home page and the simulations index say about it. */
export interface Tournament {
  name: string;
  href: string;
  description: string;
  format: string;
  /** `key` is the name in the simulation tables, `flag` a federation code. */
  winner: { name: string; key?: string; flag: string };
  /** Its simulations, where a page needs them. */
  table?: EventTable;
}

/** The simulated events of one year, newest first. The Olympiads read their results from their own tables. */
export interface TournamentYear { year: number; olympiads: OlympiadEvent[]; events: Tournament[] }

export const CANDIDATES_2026: Tournament = {
  name: '2026 Candidates Tournament',
  href: '/simulations/candidates-2026',
  description: 'Determined the challenger for the World Chess Championship, who will face Gukesh D.',
  format: '8-player double round-robin',
  winner: { name: 'Javokhir Sindarov', key: 'Sindarov, Javokhir', flag: 'UZB' },
  table: 'candidates_2026',
};

export const WOMENS_CANDIDATES_2026: Tournament = {
  name: '2026 Women’s Candidates Tournament',
  href: '/simulations/womens-candidates-2026',
  description: 'Determined the challenger for the Women’s World Chess Championship, who will face Ju Wenjun.',
  format: '8-player double round-robin',
  winner: { name: 'Vaishali Rameshbabu', key: 'Rameshbabu, Vaishali', flag: 'IND' },
  table: 'womens_candidates_2026',
};

export const TOURNAMENT_YEARS: TournamentYear[] = [
  { year: 2026, olympiads: ['open', 'women'], events: [CANDIDATES_2026, WOMENS_CANDIDATES_2026] },
  {
    year: 2024,
    olympiads: [],
    events: [
      {
        name: 'FIDE World Championship 2024',
        href: '/simulations/fide-world-championship-singapore-2024',
        description: 'Ding Liren defends his title against Gukesh D.',
        format: '14 classical games',
        winner: { name: 'Gukesh D', flag: 'IND' },
      },
      {
        name: 'Chess Olympiad Budapest 2024',
        href: '/simulations/chess-olympiad-budapest-2024',
        description: 'Countries battle it out 4v4 to find the best chess nation.',
        format: '11 rounds of 4v4',
        winner: { name: 'India', flag: 'IND' },
      },
      {
        name: '2024 Candidates Tournament',
        href: '/simulations/candidates-2024',
        description: 'The Candidates Tournament to determine the challenger for the World Chess Championship.',
        format: '8-player double round-robin',
        winner: { name: 'Gukesh D', flag: 'IND' },
      },
      {
        name: '2024 Women’s Candidates',
        href: '/simulations/womens-candidates-2024',
        description: 'The Women’s Candidates Tournament to determine the challenger for the Women’s World Chess Championship.',
        format: '8-player double round-robin',
        winner: { name: 'Tan Zhongyi', flag: 'CHN' },
      },
    ],
  },
];

/** "Sindarov, Javokhir" to "Javokhir Sindarov". Family-name-first names ("Tan, Zhongyi") are written that way round in print. */
const FAMILY_FIRST = new Set(['CHN']);
export function personName(stored: string, flag?: string): string {
  const [family, given] = stored.split(',').map(s => s.trim());
  if (!given) return family;
  return flag && FAMILY_FIRST.has(flag) ? `${family} ${given}` : `${given} ${family}`;
}
