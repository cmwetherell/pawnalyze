import { CLASSICAL_SCHEDULE, CLINCH_HP, G1_WHITE, KNOWN_RESULTS, N_CLASSICAL, TB_STAGE_GAMES } from './config';
import { exact, resultToHp, whiteInGame, type FixedTbGame } from './match';
import type { HalfPoints, MatchOdds, PlayerId, Stage, TbStage, WccGame, WccRun, WccSummary } from './types';

export interface MatchState {
  /** Classical games 1..14, always 14 entries (falls back to the published schedule). */
  classical: WccGame[];
  tiebreak: WccGame[];
  fixed: Map<number, HalfPoints>;
  tbFixed: FixedTbGame[];
  score1: number; // P1 half-points in classical
  score2: number;
  lastFinal: number; // highest classical game with a result
  g1White: PlayerId | null;
  live: WccGame | null;
  winner: PlayerId | null;
  decidedStage: Stage | null;
  /** Classical game that clinched it, or null if decided in the tiebreak / not decided. */
  decidedAt: number | null;
  anyLive: boolean;
}

function placeholder(gameNo: number, startsAt: string): WccGame {
  return { gameNo, stage: 'classical', stageGame: gameNo, startsAt, whitePlayerId: null, result: null, status: 'scheduled', hasPgn: false };
}

/**
 * Fill in what the pipeline's games table may not have yet: who has White (from the colour draw)
 * and official classical results. Anything the table already has wins.
 */
function withKnown(g: WccGame): WccGame {
  const whitePlayerId = g.whitePlayerId ?? whiteInGame(g.gameNo, G1_WHITE);
  const known = KNOWN_RESULTS[g.gameNo];
  if (g.status === 'final' || !known) return { ...g, whitePlayerId };
  return { ...g, whitePlayerId, result: known, status: 'final' };
}

export function matchState(games: WccGame[], runG1White: PlayerId | null = null): MatchState {
  const byNo = new Map(games.filter(g => g.stage === 'classical').map(g => [g.gameNo, g]));
  const classical = CLASSICAL_SCHEDULE.map(s => withKnown(byNo.get(s.gameNo) ?? placeholder(s.gameNo, s.startsAt)));
  const tiebreak = games.filter(g => g.stage !== 'classical').sort((a, b) => a.gameNo - b.gameNo);

  const g1 = classical[0];
  const g1White: PlayerId | null = g1.whitePlayerId
    ?? (classical.find(g => g.whitePlayerId !== null) ? derivedG1(classical) : null)
    ?? runG1White;

  const fixed = new Map<number, HalfPoints>();
  let score1 = 0, score2 = 0, lastFinal = 0;
  let decidedAt: number | null = null;
  let winner: PlayerId | null = null;
  for (const g of classical) {
    if (g.status !== 'final') continue;
    const white = g.whitePlayerId ?? (g1White ? (g.gameNo % 2 === 1 ? g1White : (g1White === 1 ? 2 : 1)) : null);
    const hp = resultToHp(g.result, white);
    if (hp === null) continue;
    fixed.set(g.gameNo, hp);
    score1 += hp;
    score2 += 2 - hp;
    lastFinal = Math.max(lastFinal, g.gameNo);
    if (winner === null && (score1 >= CLINCH_HP || score2 >= CLINCH_HP)) {
      winner = score1 >= CLINCH_HP ? 1 : 2;
      decidedAt = g.gameNo;
    }
  }

  const tbFixed: FixedTbGame[] = [];
  let decidedStage: Stage | null = winner ? 'classical' : null;
  if (!winner && lastFinal === N_CLASSICAL && score1 === score2) {
    const stageTotals = new Map<TbStage, { p1: number; n: number }>();
    for (const g of tiebreak) {
      if (g.status !== 'final') continue;
      const hp = resultToHp(g.result, g.whitePlayerId);
      if (hp === null) continue;
      const stage = g.stage as TbStage;
      tbFixed.push({ stage, stageGame: g.stageGame, white: g.whitePlayerId, hp });
      if (winner) continue;
      if (stage === 'sd') {
        if (hp !== 1) { winner = hp === 2 ? 1 : 2; decidedStage = 'sd'; }
        continue;
      }
      const t = stageTotals.get(stage) ?? { p1: 0, n: 0 };
      t.p1 += hp;
      t.n += 1;
      stageTotals.set(stage, t);
      const n = TB_STAGE_GAMES[stage];
      // Decided once the leader cannot be caught in the remaining stage games.
      const remaining = 2 * (n - t.n);
      const lead = t.p1 - (2 * t.n - t.p1);
      if (Math.abs(lead) > remaining) { winner = lead > 0 ? 1 : 2; decidedStage = stage; }
    }
  }

  const live = [...classical, ...tiebreak].find(g => g.status === 'live') ?? null;
  return {
    classical, tiebreak, fixed, tbFixed, score1, score2, lastFinal, g1White, live,
    winner, decidedStage, decidedAt, anyLive: live !== null,
  };
}

/** True when results (or the colour draw) are newer than the run the stored odds come from. */
export function isLagging(run: WccRun, state: MatchState): boolean {
  if (state.winner !== null) return false;
  return state.lastFinal > run.afterGame
    || state.tbFixed.length > run.tbGames
    || ((run.params.g1_white ?? null) === null && state.g1White !== null);
}

/**
 * The odds as they stand now: the stored summary, or, when results have arrived since that run,
 * the same exact computation with them applied (identical to what the pipeline would store).
 */
export function currentOdds(summary: WccSummary, run: WccRun, state: MatchState): MatchOdds {
  if (!isLagging(run, state)) return summary;
  return exact({ wdl: summary.wdl, fixed: state.fixed, g1White: state.g1White, tb: state.tbFixed });
}

function derivedG1(classical: WccGame[]): PlayerId | null {
  const g = classical.find(x => x.whitePlayerId !== null);
  if (!g || g.whitePlayerId === null) return null;
  return g.gameNo % 2 === 1 ? g.whitePlayerId : (g.whitePlayerId === 1 ? 2 : 1);
}

/** "7½", "6", "½" */
export function fmtPoints(hp: number): string {
  const whole = Math.floor(hp / 2);
  const half = hp % 2 === 1;
  if (whole === 0 && half) return '½';
  return `${whole}${half ? '½' : ''}`;
}

export function fmtScore(h1: number, h2: number): string {
  return `${fmtPoints(h1)}–${fmtPoints(h2)}`;
}
