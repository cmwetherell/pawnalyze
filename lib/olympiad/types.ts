export type OlympiadEvent = 'open' | 'women';

export type Outcome = 'w' | 'd' | 'l';

export type MatchStatus = 'scheduled' | 'live' | 'final';

export interface Team {
  teamId: number;
  fedCode: string;
  name: string;
  avgRating: number;
  captain: string | null;
}

export interface Player {
  teamId: number;
  board: number;
  name: string;
  title: string | null;
  rating: number;
  fideId: number | null;
}

export interface Match {
  round: number;
  boardNo: number;
  team1Id: number;
  team2Id: number | null;
  /** Half-points 0..8, null until known */
  team1Score: number | null;
  team2Score: number | null;
  status: MatchStatus;
  /** True when the pairing comes from the simulation engine, not chess-results */
  projected?: boolean;
}

export interface Run {
  runId: number;
  event: OlympiadEvent;
  roundsCompleted: number;
  nSims: number;
  nTeams: number;
  source: 'pipeline' | 'synthetic';
  /** ISO string */
  createdAt: string;
  notes: string | null;
}

export interface TeamSummary {
  teamId: number;
  pGold: number;
  pSilver: number;
  pBronze: number;
  pMedal: number;
  pTop10: number;
  expRank: number;
  expMp: number;
}

export interface HistoryPoint {
  runId: number;
  roundsCompleted: number;
  teamId: number;
  pGold: number;
  pMedal: number;
  pTop10: number;
}

export interface Pick {
  round: number;
  teamId: number;
  outcome: Outcome;
}

export interface ScenarioRank {
  teamId: number;
  rank: number;
  n: number;
}

export interface ScenarioTeam {
  teamId: number;
  expRank: number;
  expMp: number;
}

export interface ScenarioResult {
  runId: number;
  matched: number;
  ranks: ScenarioRank[];
  teams: ScenarioTeam[];
}

export interface TeamDetail {
  total: number;
  rankDist: { rank: number; n: number }[];
  roundOdds: { round: number; w: number; d: number; l: number }[];
}

export interface OpponentShare {
  teamId: number;
  n: number;
}

export interface TeamOpponents {
  /** False when the current run has no round_opps data */
  available: boolean;
  total: number;
  nextRound: number | null;
  /** Opponent distribution in nextRound (deterministic once pairings are fixed) */
  next: OpponentShare[];
  followingRound: number | null;
  /** Opponent distribution in followingRound, overall and split by the team's result in nextRound */
  following: { all: OpponentShare[]; w: OpponentShare[]; d: OpponentShare[]; l: OpponentShare[] };
  /** How many matched sims fall in each nextRound outcome */
  outcomeCounts: { w: number; d: number; l: number };
}

export interface DerivedStanding {
  teamId: number;
  mp: number;
  /** Game points in half-points */
  gpHalf: number;
  played: number;
  rank: number;
}

export interface OlympiadStatus {
  run: Run | null;
  lastFinalRound: number;
  anyLive: boolean;
}

export interface WdlCounts {
  w: number;
  d: number;
  l: number;
}

/** Model win/draw/loss counts for every team in one round (before any result is known). */
export interface RoundOdds {
  round: number;
  total: number;
  teams: Record<number, WdlCounts>;
}

export interface Mover {
  teamId: number;
  from: number;
  to: number;
  delta: number;
}

/** Per-team odds row used by the dashboard (baseline or scenario). */
export interface TeamOdds {
  teamId: number;
  pGold: number;
  pSilver: number;
  pBronze: number;
  pMedal: number;
  pTop10: number;
  expRank: number | null;
  expMp: number | null;
}

// ---- Board-prize race (individual medals by performance rating)

export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';
export type Colour = 'w' | 'b';

/** One board game from the broadcast (no moves; see PlayerGame). Team ids are omitted on purpose: they go stale on renumbering. */
export interface Game {
  round: number;
  boardNo: number;
  board: number;
  whiteFideId: number | null;
  blackFideId: number | null;
  whiteName: string;
  blackName: string;
  whiteElo: number;
  blackElo: number;
  result: GameResult;
}

export interface FormEntry {
  round: number;
  colour: Colour;
  score: 0 | 0.5 | 1;
  oppFideId: number | null;
  oppName: string;
  oppFedCode: string | null;
  oppTeamId: number | null;
  oppRating: number;
}

export interface PlayerRaceRow {
  fideId: number;
  name: string;
  title: string | null;
  teamId: number;
  teamName: string;
  fedCode: string;
  /** Prize board: the roster board (1-4, 5 = reserve) */
  board: number;
  /** Official list rating (0 = unrated) */
  rating: number;
  tpr: number | null;
  avgOpp: number | null;
  score: number;
  games: number;
  eligible: boolean;
  needed: number;
  canReach: boolean;
  /** 1-based rank on the board among players with at least one game; null without games */
  rank: number | null;
  /** Rank after the previous round, for movers */
  prevRank: number | null;
  form: FormEntry[];
  /** TPR after each round (index 0 = after round 1); null until the player has played */
  tprByRound: (number | null)[];
  rankByRound: (number | null)[];
}

export interface BoardRace {
  event: OlympiadEvent;
  /** Latest round with games ingested */
  lastRound: number;
  /** Latest round final on chess-results (drives eligibility maths) */
  lastFinalRound: number;
  roundsLeft: number;
  /** Rows per prize board (index 0 = board 1), ranked */
  boards: PlayerRaceRow[][];
  /** Number of players with at least one game, per board */
  ranked: number[];
}

export interface PlayerGame {
  round: number;
  boardNo: number;
  colour: Colour;
  ownRating: number;
  oppFideId: number | null;
  oppName: string;
  oppRating: number;
  result: GameResult;
  score: 0 | 0.5 | 1 | null;
  /** SAN moves without the result token; empty when unplayed */
  moves: string;
}
