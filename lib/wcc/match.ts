/**
 * Exact World Championship match odds (FIDE 2026 regulations), mirroring the pipeline's
 * chessSim/wccMatch.py `exact()`. Per-game W/D/L depends only on who has White and the ratings,
 * so the classical match is a small DP over (games played, P1 half-points, P1 wins), and the
 * tiebreak ladder has a closed form. Shared by the server (parity check) and the client
 * (instant scenarios). Everything is from player 1's (Gukesh's) point of view.
 */
import { CLINCH_HP, N_CLASSICAL, PRIZE, TB_STAGE_GAMES } from './config';
import type {
  ColorOdds, EndGameRow, HalfPoints, MatchOdds, PlayerId, PlayerKey, ScoreRow, Stage, StageOdds, TbStage, Triplet, WdlByWhite, WdlSet,
} from './types';

export interface FixedTbGame {
  stage: TbStage;
  stageGame: number;
  /** Who had White (known once the lot is drawn); null = unknown. */
  white: PlayerId | null;
  hp: HalfPoints;
}

export interface ExactInput {
  wdl: WdlSet;
  /** Classical game number (1..14) -> P1 half-points. */
  fixed?: ReadonlyMap<number, HalfPoints>;
  /** Game-1 White; null averages both color orders 50/50. */
  g1White: PlayerId | null;
  /** Tiebreak results already played, in play order. */
  tb?: FixedTbGame[];
}

/** P1 [win, draw, loss] for one game, given who has White. */
export function p1Probs(t: WdlByWhite, white: PlayerId): Triplet {
  if (white === 1) return [t['1'][0], t['1'][1], t['1'][2]];
  return [t['2'][2], t['2'][1], t['2'][0]];
}

export function other(p: PlayerId): PlayerId {
  return p === 1 ? 2 : 1;
}

/** Who has White in classical game g for a given Game-1 White. */
export function whiteInGame(g: number, g1White: PlayerId): PlayerId {
  return g % 2 === 1 ? g1White : other(g1White);
}

/** P1 [win, draw, loss] in classical game g; averaged over the color draw when unknown. */
export function gameOdds(wdl: WdlSet, g: number, g1White: PlayerId | null): Triplet {
  if (g1White !== null) return p1Probs(wdl.classical, whiteInGame(g, g1White));
  const a = p1Probs(wdl.classical, 1);
  const b = p1Probs(wdl.classical, 2);
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

export function resultToHp(result: string | null, whitePlayerId: PlayerId | null): HalfPoints | null {
  if (result === '1/2-1/2') return 1;
  if (whitePlayerId === null || (result !== '1-0' && result !== '0-1')) return null;
  const whiteWon = result === '1-0';
  return (whiteWon === (whitePlayerId === 1)) ? 2 : 0;
}

// ---- tiebreak ladder

interface StageOutcome { p1: number; p2: number; tie: number }

function stageWithLot(t: WdlByWhite, n: number, lot: PlayerId, known: Map<number, HalfPoints>): StageOutcome {
  // Distribution of P1 half-points over the n stage games; colors alternate from the lot.
  let dist = new Float64Array(2 * n + 1);
  dist[0] = 1;
  for (let k = 1; k <= n; k++) {
    const next = new Float64Array(2 * n + 1);
    const fixed = known.get(k);
    const q: Triplet = fixed !== undefined
      ? [fixed === 2 ? 1 : 0, fixed === 1 ? 1 : 0, fixed === 0 ? 1 : 0]
      : p1Probs(t, k % 2 === 1 ? lot : other(lot));
    for (let h = 0; h < dist.length; h++) {
      const p = dist[h];
      if (p === 0) continue;
      if (q[0]) next[h + 2] += p * q[0];
      if (q[1]) next[h + 1] += p * q[1];
      if (q[2]) next[h] += p * q[2];
    }
    dist = next;
  }
  let p1 = 0, p2 = 0, tie = 0;
  dist.forEach((p, h) => { if (h > n) p1 += p; else if (h < n) p2 += p; else tie += p; });
  return { p1, p2, tie };
}

function lotFromKnown(games: FixedTbGame[]): PlayerId | null {
  const g = games.find(x => x.white !== null);
  if (!g || g.white === null) return null;
  return g.stageGame % 2 === 1 ? g.white : other(g.white);
}

function stageOdds(t: WdlByWhite, n: number, games: FixedTbGame[]): StageOutcome {
  const known = new Map(games.map(x => [x.stageGame, x.hp]));
  const lot = lotFromKnown(games);
  if (lot !== null) return stageWithLot(t, n, lot, known);
  const a = stageWithLot(t, n, 1, known);
  const b = stageWithLot(t, n, 2, known);
  return { p1: (a.p1 + b.p1) / 2, p2: (a.p2 + b.p2) / 2, tie: (a.tie + b.tie) / 2 };
}

function suddenDeath(t: WdlByWhite, games: FixedTbGame[]): { p1: number; p2: number } {
  const decisive = games.find(x => x.hp !== 1);
  if (decisive) return decisive.hp === 2 ? { p1: 1, p2: 0 } : { p1: 0, p2: 1 };
  const a = p1Probs(t, 1); // P1 White
  const b = p1Probs(t, 2); // P1 Black
  const cycle = 1 - a[1] * b[1];
  if (cycle <= 0) return { p1: 0.5, p2: 0.5 };
  const firstWhite = (p1White: boolean) => {
    const p1 = p1White ? (a[0] + a[1] * b[0]) / cycle : (b[0] + b[1] * a[0]) / cycle;
    const p2 = p1White ? (a[2] + a[1] * b[2]) / cycle : (b[2] + b[1] * a[2]) / cycle;
    return { p1, p2 };
  };
  const nextGame = games.length + 1;
  const lot = lotFromKnown(games);
  if (lot !== null) return firstWhite((nextGame % 2 === 1 ? lot : other(lot)) === 1);
  const x = firstWhite(true);
  const y = firstWhite(false);
  return { p1: (x.p1 + y.p1) / 2, p2: (x.p2 + y.p2) / 2 };
}

export interface TiebreakOdds {
  p1: number;
  p2: number;
  /** Conditional on reaching the tiebreak. */
  stages: Record<TbStage, StageOdds>;
}

export function tiebreakOdds(wdl: WdlSet, tb: FixedTbGame[] = []): TiebreakOdds {
  const by = (s: TbStage) => tb.filter(x => x.stage === s);
  const r15 = stageOdds(wdl.rapid, TB_STAGE_GAMES.rapid15, by('rapid15'));
  const r10 = stageOdds(wdl.rapid, TB_STAGE_GAMES.rapid10, by('rapid10'));
  const bl = stageOdds(wdl.blitz, TB_STAGE_GAMES.blitz, by('blitz'));
  const sd = suddenDeath(wdl.blitz, by('sd'));
  const reach10 = r15.tie;
  const reachBl = reach10 * r10.tie;
  const reachSd = reachBl * bl.tie;
  return {
    p1: r15.p1 + reach10 * r10.p1 + reachBl * bl.p1 + reachSd * sd.p1,
    p2: r15.p2 + reach10 * r10.p2 + reachBl * bl.p2 + reachSd * sd.p2,
    stages: {
      rapid15: { reach: 1, p1: r15.p1, p2: r15.p2 },
      rapid10: { reach: reach10, p1: reach10 * r10.p1, p2: reach10 * r10.p2 },
      blitz: { reach: reachBl, p1: reachBl * bl.p1, p2: reachBl * bl.p2 },
      sd: { reach: reachSd, p1: reachSd * sd.p1, p2: reachSd * sd.p2 },
    },
  };
}

// ---- classical DP

interface ClassicalOutcome {
  clinch1: number[]; // index = game number
  clinch2: number[];
  pTb: number;
  scores: Map<string, ScoreRow>;
  gamePlayed: number[];
  prize1: number; // expected P1 payout from classical-decided matches
  prize2: number;
  pSplit: number; // P(fixed split) among classical-decided matches
}

const W_DIM = N_CLASSICAL + 1;
const H_DIM = 2 * N_CLASSICAL + 1;

function classical(wdl: WdlSet, g1White: PlayerId, fixed: ReadonlyMap<number, HalfPoints>): ClassicalOutcome {
  const clinch1 = new Array<number>(N_CLASSICAL + 1).fill(0);
  const clinch2 = new Array<number>(N_CLASSICAL + 1).fill(0);
  const scores = new Map<string, ScoreRow>();
  const gamePlayed: number[] = [];
  let prize1 = 0, prize2 = 0, pSplit = 0;
  const addScore = (h1: number, h2: number, games: number, p: number) => {
    const key = `${h1}-${h2}-${games}`;
    const row = scores.get(key);
    if (row) row.p += p; else scores.set(key, { p1_hp: h1, p2_hp: h2, games, p });
  };

  // state index = h * W_DIM + w1 (P1 half-points, P1 wins)
  let cur = new Float64Array(H_DIM * W_DIM);
  cur[0] = 1;
  for (let g = 1; g <= N_CLASSICAL; g++) {
    let mass = 0;
    for (let i = 0; i < cur.length; i++) mass += cur[i];
    gamePlayed.push(mass);
    const f = fixed.get(g);
    const q: Triplet = f !== undefined
      ? [f === 2 ? 1 : 0, f === 1 ? 1 : 0, f === 0 ? 1 : 0]
      : p1Probs(wdl.classical, whiteInGame(g, g1White));
    const next = new Float64Array(H_DIM * W_DIM);
    for (let h = 0; h < H_DIM; h++) {
      for (let w1 = 0; w1 < W_DIM; w1++) {
        const p = cur[h * W_DIM + w1];
        if (p === 0) continue;
        for (let k = 0; k < 3; k++) {
          const pk = p * q[k];
          if (pk === 0) continue;
          const nh = h + (k === 0 ? 2 : k === 1 ? 1 : 0);
          const nw1 = w1 + (k === 0 ? 1 : 0);
          const h2 = 2 * g - nh;
          if (nh >= CLINCH_HP || h2 >= CLINCH_HP) {
            const p1Won = nh >= CLINCH_HP;
            if (p1Won) clinch1[g] += pk; else clinch2[g] += pk;
            addScore(nh, h2, g, pk);
            const draws = nh - 2 * nw1;
            const w2 = g - nw1 - draws;
            const decisive = nw1 + w2;
            const win = Math.max(nh, h2);
            const lose = Math.min(nh, h2);
            const split = g === N_CLASSICAL && (
              (win === 15 && lose === 13 && decisive === 13) || (win === 16 && lose === 12 && decisive === 14)
            );
            if (split) {
              pSplit += pk;
              prize1 += pk * (p1Won ? PRIZE.splitWinner : PRIZE.splitLoser);
              prize2 += pk * (p1Won ? PRIZE.splitLoser : PRIZE.splitWinner);
            } else {
              const rest = (PRIZE.total - PRIZE.perWin * decisive) / 2;
              prize1 += pk * (PRIZE.perWin * nw1 + rest);
              prize2 += pk * (PRIZE.perWin * w2 + rest);
            }
          } else {
            next[nh * W_DIM + nw1] += pk;
          }
        }
      }
    }
    cur = next;
  }
  let pTb = 0;
  for (let i = 0; i < cur.length; i++) pTb += cur[i];
  if (pTb > 0) addScore(N_CLASSICAL, N_CLASSICAL, N_CLASSICAL, pTb);
  return { clinch1, clinch2, pTb, scores, gamePlayed, prize1, prize2, pSplit };
}

function endGameRows(c: ClassicalOutcome, tb: TiebreakOdds): EndGameRow[] {
  const rows: EndGameRow[] = [];
  for (let g = 8; g <= N_CLASSICAL; g++) rows.push({ g, p1: c.clinch1[g], p2: c.clinch2[g] });
  rows.push({ g: 'tb', p1: c.pTb * tb.p1, p2: c.pTb * tb.p2 });
  return rows;
}

function fromClassical(c: ClassicalOutcome, tb: TiebreakOdds): MatchOdds {
  const cl1 = c.clinch1.reduce((a, b) => a + b, 0);
  const cl2 = c.clinch2.reduce((a, b) => a + b, 0);
  const stages = {
    classical: { reach: 1, p1: cl1, p2: cl2 },
  } as Record<Stage, StageOdds>;
  for (const s of ['rapid15', 'rapid10', 'blitz', 'sd'] as TbStage[]) {
    const x = tb.stages[s];
    stages[s] = { reach: c.pTb * x.reach, p1: c.pTb * x.p1, p2: c.pTb * x.p2 };
  }
  const pWin1 = cl1 + c.pTb * tb.p1;
  const pWin2 = cl2 + c.pTb * tb.p2;
  const scoreDist = Array.from(c.scores.values()).sort((a, b) => a.games - b.games || b.p1_hp - a.p1_hp);
  return {
    pWin1,
    pWin2,
    pTb: c.pTb,
    stages,
    endGame: endGameRows(c, tb),
    scoreDist,
    prize: {
      exp1: c.prize1 + c.pTb * (tb.p1 * PRIZE.splitWinner + tb.p2 * PRIZE.splitLoser),
      exp2: c.prize2 + c.pTb * (tb.p2 * PRIZE.splitWinner + tb.p1 * PRIZE.splitLoser),
      p_split: c.pSplit + c.pTb,
    },
    gamePlayed: c.gamePlayed,
    byColor: {} as Record<PlayerKey, ColorOdds>,
  };
}

function averageOdds(a: MatchOdds, b: MatchOdds): MatchOdds {
  const avg = (x: number, y: number) => (x + y) / 2;
  const stages = {} as Record<Stage, StageOdds>;
  for (const s of Object.keys(a.stages) as Stage[]) {
    stages[s] = { reach: avg(a.stages[s].reach, b.stages[s].reach), p1: avg(a.stages[s].p1, b.stages[s].p1), p2: avg(a.stages[s].p2, b.stages[s].p2) };
  }
  const scores = new Map<string, ScoreRow>();
  for (const [src, w] of [[a.scoreDist, 0.5], [b.scoreDist, 0.5]] as const) {
    for (const r of src) {
      const key = `${r.p1_hp}-${r.p2_hp}-${r.games}`;
      const row = scores.get(key);
      if (row) row.p += r.p * w; else scores.set(key, { ...r, p: r.p * w });
    }
  }
  return {
    pWin1: avg(a.pWin1, b.pWin1),
    pWin2: avg(a.pWin2, b.pWin2),
    pTb: avg(a.pTb, b.pTb),
    stages,
    endGame: a.endGame.map((r, i) => ({ g: r.g, p1: avg(r.p1, b.endGame[i].p1), p2: avg(r.p2, b.endGame[i].p2) })),
    scoreDist: Array.from(scores.values()).sort((x, y) => x.games - y.games || y.p1_hp - x.p1_hp),
    prize: { exp1: avg(a.prize.exp1, b.prize.exp1), exp2: avg(a.prize.exp2, b.prize.exp2), p_split: avg(a.prize.p_split, b.prize.p_split) },
    gamePlayed: a.gamePlayed.map((v, i) => avg(v, b.gamePlayed[i])),
    byColor: a.byColor,
  };
}

const EMPTY_FIXED: ReadonlyMap<number, HalfPoints> = new Map();

/** Exact match odds, in the same shape as the stored summary. */
export function exact({ wdl, fixed = EMPTY_FIXED, g1White, tb = [] }: ExactInput): MatchOdds {
  const tbOdds = tiebreakOdds(wdl, tb);
  const one = fromClassical(classical(wdl, 1, fixed), tbOdds);
  const two = fromClassical(classical(wdl, 2, fixed), tbOdds);
  const byColor: Record<PlayerKey, ColorOdds> = {
    '1': { p_win1: one.pWin1, end_game: one.endGame },
    '2': { p_win1: two.pWin1, end_game: two.endGame },
  };
  const top = g1White === 1 ? one : g1White === 2 ? two : averageOdds(one, two);
  return { ...top, byColor };
}

/** Only P(P1 wins the match): cheaper, for bisection and per-game swings. */
export function pWin1Only(input: ExactInput): number {
  return exact(input).pWin1;
}
