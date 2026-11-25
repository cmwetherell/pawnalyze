/**
 * Sample data for the styleguide only: a snapshot of the site's own numbers on November 24, 2026
 * (World Championship after game 1, Chess Olympiad 2026 and Candidates 2026 as finished; pick previews are samples). Pages load live data.
 */
import { createElement } from 'react';

import type { GameCellView } from '@/components/chess/GameSheet';
import type { FaceOffSide } from '@/components/chess/FaceOff';
import type { OddsSide } from '@/components/chess/OddsChip';
import type { LadderRung } from '@/components/charts/LadderChart';
import type { LineSeries } from '@/components/charts/LineChart';
import { Delta } from '@/components/ui/Delta';
import type { PodiumPlace } from '@/components/ui/Podium';
import type { PodiumStripColumn, PodiumStripPlace } from '@/components/ui/PodiumStrip';
import { CLASSICAL_SCHEDULE, LADDER } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import type { Triplet, WccGame } from '@/lib/wcc/types';

export const PLAYERS: Players = {
  1: { id: 1, name: 'Gukesh Dommaraju', shortName: 'Gukesh', fedCode: 'IND', country: 'India', role: 'Champion', isChampion: true, fideId: 46616543, ratings: { classical: 2710, rapid: 2686, blitz: 2659 } },
  2: { id: 2, name: 'Javokhir Sindarov', shortName: 'Sindarov', fedCode: 'UZB', country: 'Uzbekistan', role: 'Challenger', isChampion: false, fideId: 14205483, ratings: { classical: 2782, rapid: 2755, blitz: 2725 } },
};

export const SIDES: [FaceOffSide, FaceOffSide] = [
  { id: 1, name: 'Gukesh', role: 'Champion', isChampion: true, rating: 2710, flag: 'IND', portrait: { src: '/players/wcc/gukesh-cut.webp', alt: 'Gukesh D at the board', cutout: true } },
  { id: 2, name: 'Sindarov', role: 'Challenger', isChampion: false, rating: 2782, flag: 'UZB', portrait: { src: '/players/wcc/sindarov-cut.webp', alt: 'Javokhir Sindarov', cutout: true } },
];

export const P1 = 0.155;
export const ODDS: [OddsSide, OddsSide] = [{ name: 'Gukesh', p: P1, tone: 'p1' }, { name: 'Sindarov', p: 1 - P1, tone: 'p2' }];

const PLAYED = [1, 1, 1, 1, 1, 1, 1, 0.999, 0.999, 0.997, 0.98, 0.89, 0.7, 0.41];
const DATE = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const label = (iso: string) => DATE.format(new Date(iso));

/** Games 1 final, 2 next; 9, 13 and 14 show the picked, live and unreachable states. */
export const gameCells = (picks: Record<number, '1' | 'd' | '2'>): GameCellView[] =>
  CLASSICAL_SCHEDULE.map(({ gameNo, startsAt }) => {
    const gukeshWhite = gameNo % 2 === 0;
    const odds: Triplet = gukeshWhite ? [0.11, 0.72, 0.17] : [0.08, 0.63, 0.29];
    return {
      gameNo, dateLabel: label(startsAt), whiteName: gukeshWhite ? 'Gukesh' : 'Sindarov', whiteAssumed: false, odds,
      pPlayed: PLAYED[gameNo - 1], result: gameNo === 1 ? 1 : null, live: false, next: gameNo === 2, unreachable: false,
      pick: picks[gameNo], swing: { '1': 0.343, d: 0.147, '2': 0.046 }, href: `/world-chess-championship-2026/live?game=${gameNo}`,
    };
  });

export const GAMES: WccGame[] = CLASSICAL_SCHEDULE.map(({ gameNo, startsAt }) => ({
  gameNo, stage: 'classical', stageGame: gameNo, startsAt, whitePlayerId: gameNo % 2 === 0 ? 1 : 2,
  result: gameNo === 1 ? '1/2-1/2' : null, status: gameNo === 1 ? 'final' : 'scheduled', hasPgn: gameNo === 1,
}));

export const CLINCH = [
  ['G8', 'Thu, Dec 3', 0, 0.0005], ['G9', 'Fri, Dec 4', 0, 0.002], ['G10', 'Sun, Dec 6', 0, 0.019], ['G11', 'Mon, Dec 7', 0.002, 0.092],
  ['G12', 'Tue, Dec 8', 0.011, 0.172], ['G13', 'Thu, Dec 10', 0.031, 0.258], ['G14', 'Fri, Dec 11', 0.078, 0.199], ['TB', 'Sat, Dec 12', 0.033, 0.102],
] as const;

export const SCORES = [
  ['7–7', 'tiebreak', 0.033, 0.102], ['7½–6½', 'G14', 0.07, 0.165], ['8–6', 'G14', 0.008, 0.034], ['7½–5½', 'G13', 0.028, 0.196], ['8–5', 'G13', 0.003, 0.062],
  ['7½–4½', 'G12', 0.01, 0.146], ['8–4', 'G12', 0.001, 0.026], ['7½–3½', 'G11', 0.002, 0.075], ['8–3', 'G11', 0, 0.017], ['7½–2½', 'G10', 0, 0.017],
] as const;

const rung = (stage: keyof typeof LADDER, reach: number, p1: number, p2: number): LadderRung => ({
  label: LADDER[stage].label, sub: LADDER[stage].short, rule: LADDER[stage].rule, reach,
  segments: [
    { key: 'p1', value: p1, tone: 'p1', label: 'Gukesh wins here' },
    { key: 'p2', value: p2, tone: 'p2', label: 'Sindarov wins here' },
    ...(p1 + p2 < 0.995 ? [{ key: 'level', value: 1 - p1 - p2, tone: 'level' as const, label: 'Still level' }] : []),
  ],
});
export const RUNGS: LadderRung[] = [
  rung('classical', 1, 0.12, 0.744), rung('rapid15', 0.136, 0.17, 0.59), rung('rapid10', 0.032, 0.18, 0.47), rung('blitz', 0.011, 0.2, 0.43), rung('sd', 0.004, 0.35, 0.65),
];

export const CAND_ROUNDS = ['Pre', ...Array.from({ length: 13 }, (_, i) => String(i + 1))];
const CAND: [string, string, number[]][] = [
  ['Sindarov', 'sindarov', [8.19, 12.54, 11.71, 18.67, 34.5, 47.72, 70.85, 72.09, 81.22, 83.17, 94.11, 97.93, 99.26, 100]],
  ['Caruana', 'caruana', [27.03, 41.54, 44.92, 56.97, 36.55, 40.13, 22.82, 23.91, 11.85, 3.03, 0.71, 0, 0, 0]],
  ['Nakamura', 'nakamura', [31.79, 17.17, 14.91, 10.16, 11.35, 2.28, 1.09, 0.54, 1.19, 0.49, 0.07, 0, 0, 0]],
  ['Giri', 'giri', [11.26, 5.13, 4.68, 4.06, 8.63, 5.54, 3.01, 1.68, 4.82, 12.88, 5.08, 2.07, 0.74, 0]],
  ['Wei Yi', 'wei-yi', [12.26, 10.54, 9.58, 3.88, 3.57, 2.11, 0.41, 0.65, 0.52, 0.3, 0.03, 0, 0, 0]],
  ['Praggnanandhaa', 'praggnanandhaa', [7.14, 11.67, 12.75, 5.31, 4.6, 2.04, 1.71, 1.06, 0.29, 0.13, 0, 0, 0, 0]],
  ['Bluebaum', 'bluebaum', [1.17, 0.93, 0.85, 0.54, 0.66, 0.11, 0.06, 0.07, 0.11, 0, 0, 0, 0, 0]],
  ['Esipenko', 'esipenko', [1.16, 0.48, 0.6, 0.41, 0.14, 0.07, 0.05, 0, 0, 0, 0, 0, 0, 0]],
];
const LABEL_AT: Record<string, number> = { Caruana: 3, Nakamura: 0, Giri: 9 };
export const CAND_SERIES: LineSeries[] = CAND.map(([name, , values], i) => ({
  id: name, label: name, values, tone: i === 0 ? 'series-1' : 'context', emphasis: i === 0 ? 'strong' : 'context', labelAt: i === 0 ? 'end' : LABEL_AT[name] ?? 'none',
}));
export const CAND_PEOPLE = CAND.map(([name, file]) => ({ name, src: `/players/${file}.webp` }));
export const CAND_TABLE = { columns: ['Round', ...CAND.map(c => c[0])], rows: CAND_ROUNDS.map((r, i) => [r, ...CAND.map(c => `${c[2][i].toFixed(1)}%`)]) };

export const PODIUM: PodiumPlace[] = [
  { rank: 1, name: 'Uzbekistan', flag: 'UZB', stats: [{ label: 'Match points', value: '20' }, { label: 'Game points', value: '32.5' }, { label: 'Sonneborn-Berger', value: '455.5' }], pre: '18.0% before round 1' },
  { rank: 2, name: 'India', flag: 'IND', stats: [{ label: 'Match points', value: '18' }, { label: 'Game points', value: '28.5' }, { label: 'Sonneborn-Berger', value: '405.5' }], note: 'Level with Germany on match points and game points, ahead by 19.0 on Sonneborn-Berger.', pre: '23.4% before round 1' },
  { rank: 3, name: 'Germany', flag: 'GER', stats: [{ label: 'Match points', value: '18' }, { label: 'Game points', value: '28.5' }, { label: 'Sonneborn-Berger', value: '386.5' }], pre: '3.2% before round 1' },
];

/** Name, federation; gold, silver, bronze odds going into round 11; gold odds before round 1; seed. */
export const RACE = [
  ['Uzbekistan', 'UZB', 0.9282, 0.0718, 0, 0.18, 3], ['India', 'IND', 0.0718, 0.7739, 0.0515, 0.2342, 2], ['Germany', 'GER', 0, 0.0601, 0.3802, 0.0324, 5],
  ['United States of America', 'USA', 0, 0, 0.3765, 0.3585, 1], ['Hungary', 'HUN', 0, 0.082, 0.0641, 0.0092, 8], ['Azerbaijan', 'AZE', 0, 0, 0.0236, 0.0204, 7],
] as const;

/** Name, federation, performance, score, rank, rank after round 10. Chess Olympiad 2026, after round 11. */
const board = (key: string, label: string, meta: string, places: [string, string, number, string, number, number][]): PodiumStripColumn => ({
  key, label, meta,
  places: places.map(([name, flag, value, score, rank, was]): PodiumStripPlace => ({ name, flag, value, title: `${name} (${flag}), ${score}`, delta: createElement(Delta, { value: rank, base: was, unit: 'places', better: 'down', short: true }) })),
});
export const BOARD_RACES: PodiumStripColumn[] = [
  board('1', 'Board 1', '206 ranked', [['Nodirbek Abdusattorov', 'UZB', 2869, '8½/11', 1, 1], ['Yagiz Kaan Erdogmus', 'TUR', 2839, '8/10', 2, 2], ['R Praggnanandhaa', 'IND', 2772, '6½/10', 3, 3]]),
  board('2', 'Board 2', '206 ranked', [['Jorden Van Foreest', 'NED', 2817, '8/10', 1, 1], ['Yi Wei', 'CHN', 2798, '7½/10', 2, 3], ['Javokhir Sindarov', 'UZB', 2797, '7/10', 3, 2]]),
  board('3', 'Board 3', '206 ranked', [['Frederik Svane', 'GER', 2796, '8½/11', 1, 1], ['Nodirbek Yakubboev', 'UZB', 2774, '7½/10', 2, 2], ['Shant Sargsyan', 'ARM', 2745, '8/11', 3, 3]]),
  board('4', 'Board 4', 'New leader', [['Ihor Samunenkov', 'UKR', 2720, '8/10', 1, 2], ['D Gukesh', 'IND', 2718, '8½/11', 2, 1], ['Levon Aronian', 'USA', 2699, '6/8', 3, 5]]),
  board('5', 'Reserve', 'New leader', [['Vepaly Halynyazov', 'TKM', 2966, '4/4', 1, 2], ['Hoang Nam Nguyen', 'VIE', 2777, '1/1', 2, 3], ['Gleb Dudin', 'HUN', 2738, '8/10', 3, 5]]),
];

export const PRESS = {
  nyt: { src: '/img/nyt-logo.svg', alt: 'The New York Times', width: 114, height: 18 },
  row: [
    { src: '/img/japantimes-logo.svg', alt: 'The Japan Times', width: 138, height: 20 },
    { src: '/img/gulfnews-logo.svg', alt: 'Gulf News', width: 152, height: 18 },
    { src: '/img/deccanherald-logo.svg', alt: 'Deccan Herald', width: 112, height: 14 },
  ],
};
