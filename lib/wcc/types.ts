/**
 * World Chess Championship 2026 types. Everything is from player 1's (Gukesh's) point of view,
 * in half-points (2 = P1 win, 1 = draw, 0 = P1 loss). White-perspective WDL triplets are
 * ordered [white_win, draw, black_win]. See the DB contract in the pipeline repo's SCHEMA.md.
 */

export type PlayerId = 1 | 2;
export type PlayerKey = '1' | '2';
export type Stage = 'classical' | 'rapid15' | 'rapid10' | 'blitz' | 'sd';
export type TbStage = Exclude<Stage, 'classical'>;
export type TimeControl = 'classical' | 'rapid' | 'blitz';
export type GameResult = '1-0' | '0-1' | '1/2-1/2';
export type GameStatus = 'scheduled' | 'live' | 'final' | 'not_played';
/** P1 half-points for one game. */
export type HalfPoints = 0 | 1 | 2;
export type Triplet = [number, number, number];

export interface WccPlayer {
  playerId: PlayerId;
  name: string;
  shortName: string;
  title: string | null;
  fideId: number;
  fedCode: string;
  isChampion: boolean;
  ratings: { classical: number; rapid: number; blitz: number };
  ratingSource: string | null;
  updatedAt: string;
}

export interface WccGame {
  gameNo: number;
  stage: Stage;
  stageGame: number;
  startsAt: string | null;
  whitePlayerId: PlayerId | null;
  result: GameResult | null;
  status: GameStatus;
  hasPgn: boolean;
}

export interface RunRatings { c: number; r: number; b: number }

export interface RunParams {
  ratings: Record<PlayerKey, RunRatings>;
  rating_source?: string;
  g1_white: PlayerId | null;
  theta: { classical: number; rapid: number; blitz: number };
  seed?: number;
}

export interface WccRun {
  runId: number;
  afterGame: number;
  tbGames: number;
  nSims: number;
  headlineVariant: string;
  modelVersion: string;
  params: RunParams;
  source: 'pipeline' | 'synthetic';
  createdAt: string;
  notes: string | null;
  /** Set by the site when the stored odds were re-based onto MATCH_RATINGS: the ratings the run actually used. */
  rebasedFrom?: Record<PlayerKey, RunRatings> | null;
}

/** Key = player id who has White; white-perspective triplets. */
export type WdlByWhite = Record<PlayerKey, Triplet>;
export type WdlSet = Record<TimeControl, WdlByWhite>;

export interface StageOdds { reach: number; p1: number; p2: number }
export interface EndGameRow { g: number | 'tb'; p1: number; p2: number }
export interface ScoreRow { p1_hp: number; p2_hp: number; games: number; p: number }
export interface Prize { exp1: number; exp2: number; p_split: number }
export interface ColourOdds { p_win1: number; end_game: EndGameRow[] }
export interface McCheck { n: number; p_win1: number; p_tb: number; max_z: number }

/** The exact match odds: what match.ts computes and what the summary row stores. */
export interface MatchOdds {
  pWin1: number;
  pWin2: number;
  pTb: number;
  stages: Record<Stage, StageOdds>;
  endGame: EndGameRow[];
  scoreDist: ScoreRow[];
  prize: Prize;
  gamePlayed: number[];
  byColour: Record<PlayerKey, ColourOdds>;
}

export interface WccSummary extends MatchOdds {
  runId: number;
  variant: 'wcc' | 'model';
  wdl: WdlSet;
  mc: McCheck | null;
}

export interface HistoryPoint {
  runId: number;
  afterGame: number;
  tbGames: number;
  createdAt: string;
  pWin1: number;
  pTb: number;
}

export interface MarketRow {
  source: 'kalshi' | 'polymarket' | 'bet365' | string;
  asOf: string;
  pWin1: number;
  pWin2: number;
  url: string | null;
  raw: unknown;
}

export interface ModelGrid {
  modelVersion: string;
  eloMin: number;
  eloStep: number;
  n: number;
  /** RAW (θ = 1) white-perspective triplets, index ((wi * n) + bi) * 3 + k. */
  wdl: number[];
}

export interface SimRow {
  simId: number;
  g1White: PlayerId;
  classical: (HalfPoints | null)[];
  p1Hp: number;
  p2Hp: number;
  endGame: number;
  decidedStage: Stage;
  tb: HalfPoints[];
  winner: PlayerId;
}

export interface SimStats {
  n: number;
  longestSd: number;
  maxMargin: number;
  maxMarginScore: { p1: number; p2: number; games: number } | null;
  allDraws: number;
  toSd: number;
  shutouts: number;
}

export interface LiveQuote {
  source: 'kalshi' | 'polymarket';
  /** Normalised P(Gukesh) = mid1 / (mid1 + mid2). */
  pWin1: number;
  players: Record<PlayerKey, { bid: number | null; ask: number | null; last: number | null; mid: number | null }>;
  volume: number | null;
  url: string;
}

export interface LiveMarkets {
  fetchedAt: string;
  kalshi: LiveQuote | null;
  polymarket: LiveQuote | null;
}
