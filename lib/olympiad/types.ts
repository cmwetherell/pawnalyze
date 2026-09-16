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
  /** Board game points (0..44), not half-points */
  expGp: number;
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
  nextRoundPublished: number | null;
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
