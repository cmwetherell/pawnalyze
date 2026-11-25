import type { GameResult, PlayerId, PlayerKey, RunRatings, Stage, TbStage, TimeControl } from './types';

export const WCC_SLUG = 'world-chess-championship-2026';
export const WCC_HREF = `/${WCC_SLUG}`;
export const WCC_TITLE = 'World Chess Championship 2026';

export const N_CLASSICAL = 14;
/** 7½ points, in half-points. */
export const CLINCH_HP = 15;
export const LIVE_REFRESH_MS = 5 * 60 * 1000;

export const TAGS = {
  ref: 'wcc-2026',
  sims: 'wcc-2026-sims',
  model: 'wcc-2026-model',
  markets: 'wcc-2026-markets',
} as const;

/** Fallbacks used before the players table is populated (and by the home feature / OG). */
export const PLAYER_DEFAULTS: Record<PlayerId, { name: string; shortName: string; fideId: number; fedCode: string; country: string; role: string }> = {
  1: { name: 'Gukesh D', shortName: 'Gukesh', fideId: 46616543, fedCode: 'IND', country: 'India', role: 'World Champion' },
  2: { name: 'Javokhir Sindarov', shortName: 'Sindarov', fideId: 14205483, fedCode: 'UZB', country: 'Uzbekistan', role: 'Challenger' },
};

export const EVENT = {
  city: 'Geneva',
  country: 'Switzerland',
  venue: 'Fondation Martin Bodmer',
  venueArea: 'Cologny, Geneva',
  ceremonyVenue: 'Palais des Nations',
  startDate: '2026-11-22',
  endDate: '2026-12-13',
  prizeFund: 2_500_000,
  regulationsUrl: 'https://doc.fide.com/docs/DOC/2026_2FC_decisions/CM2-2026_06.pdf',
  fideUrl: 'https://www.fide.com/',
  timeControl: '120 minutes for 40 moves, then 30 minutes with a 30-second increment from move 41',
  drawRule: 'No draw offers before Black’s 40th move',
};

/** Games start at 3:00 PM CET (2:00 PM UTC). */
const g = (day: string) => `${day}T14:00:00Z`;
export const CLASSICAL_SCHEDULE: { gameNo: number; startsAt: string }[] = [
  ['2026-11-24', 1], ['2026-11-25', 2], ['2026-11-26', 3],
  ['2026-11-28', 4], ['2026-11-29', 5], ['2026-11-30', 6],
  ['2026-12-02', 7], ['2026-12-03', 8], ['2026-12-04', 9],
  ['2026-12-06', 10], ['2026-12-07', 11], ['2026-12-08', 12],
  ['2026-12-10', 13], ['2026-12-11', 14],
].map(([d, n]) => ({ gameNo: n as number, startsAt: g(d as string) }));
export const TIEBREAK_START = g('2026-12-12');

/**
 * Ratings at the start of the match: FIDE's November 2026 list (Wikipedia's match article agrees).
 * The site's odds use these. A run computed from other ratings is re-based onto them (lib/wcc/rebase.ts)
 * until the pipeline stores a run with exactly these numbers.
 */
export const MATCH_RATINGS: Record<PlayerKey, RunRatings> = {
  '1': { c: 2710, r: 2686, b: 2659 },
  '2': { c: 2782, r: 2755, b: 2725 },
};
export const MATCH_RATING_SOURCE = 'FIDE rating list, November 2026 (in force at the start of the match)';

/** From the Nov 22 color draw: Sindarov has White in game 1, and so in every odd game. */
export const G1_WHITE: PlayerId = 2;

/**
 * Official classical results, for when the pipeline's games table has not caught up yet.
 * A final result in the DB always wins over these.
 */
export const KNOWN_RESULTS: Record<number, GameResult> = {
  1: '1/2-1/2',
};
export const OPENING_CEREMONY = '2026-11-22';

export type DayKind = 'ceremony' | 'game' | 'rest' | 'tiebreak' | 'free' | 'departure';
export interface ScheduleDay { date: string; kind: DayKind; label: string; gameNo?: number; startsAt?: string }

export const SCHEDULE_DAYS: ScheduleDay[] = (() => {
  const byDate = new Map(CLASSICAL_SCHEDULE.map(s => [s.startsAt.slice(0, 10), s]));
  const out: ScheduleDay[] = [];
  const d = new Date('2026-11-22T12:00:00Z');
  const end = new Date('2026-12-13T12:00:00Z');
  while (d <= end) {
    const iso = d.toISOString().slice(0, 10);
    const game = byDate.get(iso);
    if (game) out.push({ date: iso, kind: 'game', label: `Game ${game.gameNo}`, gameNo: game.gameNo, startsAt: game.startsAt });
    else if (iso === OPENING_CEREMONY) out.push({ date: iso, kind: 'ceremony', label: 'Opening · color draw' });
    else if (iso === '2026-11-23') out.push({ date: iso, kind: 'free', label: 'No play' });
    else if (iso === '2026-12-12') out.push({ date: iso, kind: 'tiebreak', label: 'Tiebreaks · closing', startsAt: TIEBREAK_START });
    else if (iso === '2026-12-13') out.push({ date: iso, kind: 'departure', label: 'Departures' });
    else out.push({ date: iso, kind: 'rest', label: 'Rest day' });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
})();

export const STAGE_ORDER: Stage[] = ['classical', 'rapid15', 'rapid10', 'blitz', 'sd'];
export const TB_STAGES: TbStage[] = ['rapid15', 'rapid10', 'blitz', 'sd'];
/** Games per tiebreak stage (sudden death is open-ended). */
export const TB_STAGE_GAMES: Record<Exclude<TbStage, 'sd'>, number> = { rapid15: 4, rapid10: 2, blitz: 2 };
export const STAGE_TC: Record<Stage, TimeControl> = {
  classical: 'classical', rapid15: 'rapid', rapid10: 'rapid', blitz: 'blitz', sd: 'blitz',
};

export const LADDER: Record<Stage, { label: string; short: string; rule: string }> = {
  classical: { label: 'Classical', short: '14 games', rule: '14 games; first to 7½ points wins, and no further games are played.' },
  rapid15: { label: 'Rapid 15+10', short: '4 games', rule: 'At 7–7: four rapid games (15 min + 10 s), colors drawn by lot.' },
  rapid10: { label: 'Rapid 10+5', short: '2 games', rule: 'Still level: two faster rapid games (10 min + 5 s), new lot.' },
  blitz: { label: 'Blitz 3+2', short: '2 games', rule: 'Still level: two blitz games (3 min + 2 s), new lot.' },
  sd: { label: 'Sudden death', short: '3+2 until decisive', rule: 'Then 3+2 games with alternating colors until one is decisive. No Armageddon.' },
};

export const PRIZE = {
  total: 2_500_000,
  perWin: 200_000,
  splitWinner: 1_300_000,
  splitLoser: 1_200_000,
  rule: '$200,000 per game won; the rest is shared equally.',
  exception:
    'Fixed $1.3M / $1.2M split if the match goes to tiebreaks, ends 7½–6½ with 13 decisive games, or ends 8–6 with 14 decisive games.',
};

export interface H2HRecord {
  tc: 'Classical' | 'Rapid' | 'Blitz';
  wins1: number;
  draws: number;
  wins2: number;
  note: string;
}
export const HEAD_TO_HEAD: H2HRecord[] = [
  { tc: 'Classical', wins1: 0, draws: 2, wins2: 1, note: 'Sindarov won at Sharjah 2022; drew in round 1 of Tata Steel 2026' },
  { tc: 'Rapid', wins1: 1, draws: 0, wins2: 0, note: 'Gukesh won at Grand Chess Tour Poland 2026' },
  { tc: 'Blitz', wins1: 0, draws: 0, wins2: 2, note: 'Sindarov won both at Grand Chess Tour Poland 2026' },
];

export const MARKETS = {
  polymarket: {
    label: 'Polymarket',
    eventSlug: '2026-world-chess-championship-winner',
    api: 'https://gamma-api.polymarket.com/events?slug=2026-world-chess-championship-winner',
    url: 'https://polymarket.com/event/2026-world-chess-championship-winner',
    titles: { 1: 'Gukesh Dommaraju', 2: 'Javokhir Sindarov' } as Record<PlayerId, string>,
    slugs: {
      1: 'will-gukesh-dommaraju-win-the-2026-world-chess-championship',
      2: 'will-javokhir-sindarov-win-the-2026-world-chess-championship',
    } as Record<PlayerId, string>,
  },
  kalshi: {
    label: 'Kalshi',
    api: 'https://api.elections.kalshi.com/trade-api/v2/markets/',
    tickers: { 1: 'KXCHESSWORLDCHAMPION-CHESS26-GDOM', 2: 'KXCHESSWORLDCHAMPION-CHESS26-JSIN' } as Record<PlayerId, string>,
    url: 'https://kalshi.com/markets/kxchessworldchampion/world-chess-champion/kxchessworldchampion-chess26',
  },
  bet365: { label: 'bet365' },
};

export function polymarketEmbedUrl(slug: string, theme: 'dark' | 'light'): string {
  return `https://embed.polymarket.com/market?market=${slug}&theme=${theme}&features=volume`;
}

/** Olympiad 2026 (Open) FIDE ids for the form guide. */
export const OLYMPIAD_FORM_EVENT = 'open' as const;
