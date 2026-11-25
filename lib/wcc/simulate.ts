/**
 * Browser-side match simulation from the exact model's per-game odds, conditioned on the results
 * already played. Replaces the pipeline's stored sims for the replay and its fun facts, so they
 * always match the real match so far. Same rules as match.ts: first to 7½ in classical, then the
 * tiebreak ladder (each stage played in full, colors by lot, alternating), then sudden death.
 * Seeded per simulation index, so "Simulation #k" is reproducible and server/client renders agree.
 */
import { CLINCH_HP, N_CLASSICAL, TB_STAGE_GAMES } from './config';
import { other, p1Probs, whiteInGame, type FixedTbGame } from './match';
import type { HalfPoints, PlayerId, SimRow, SimStats, Stage, TbStage, Triplet, WdlSet } from './types';

export const N_BROWSER_SIMS = 10_000;
const SD_CAP = 200;

export interface SimInput {
  wdl: WdlSet;
  /** Classical game number -> P1 half-points, for games already played. */
  fixed: ReadonlyMap<number, HalfPoints>;
  g1White: PlayerId | null;
  tb: FixedTbGame[];
}

/** mulberry32 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function draw(q: Triplet, r: number): HalfPoints {
  return r < q[0] ? 2 : r < q[0] + q[1] ? 1 : 0;
}

function lotOf(games: FixedTbGame[]): PlayerId | null {
  const g = games.find(x => x.white !== null);
  if (!g || g.white === null) return null;
  return g.stageGame % 2 === 1 ? g.white : other(g.white);
}

/** Simulation number `index` (0-based). */
export function simulateMatch(input: SimInput, index: number): SimRow {
  const rand = rng(0x5eed + index * 7919);
  const g1White: PlayerId = input.g1White ?? (rand() < 0.5 ? 1 : 2);
  const classical: (HalfPoints | null)[] = new Array(N_CLASSICAL).fill(null);
  let p1 = 0, p2 = 0, endGame = N_CLASSICAL;
  let winner: PlayerId | null = null;
  for (let g = 1; g <= N_CLASSICAL; g++) {
    const hp = input.fixed.get(g) ?? draw(p1Probs(input.wdl.classical, whiteInGame(g, g1White)), rand());
    classical[g - 1] = hp;
    p1 += hp;
    p2 += 2 - hp;
    if (p1 >= CLINCH_HP || p2 >= CLINCH_HP) { winner = p1 > p2 ? 1 : 2; endGame = g; break; }
  }

  const tb: HalfPoints[] = [];
  let decidedStage: Stage = 'classical';
  if (winner === null) {
    const by = (s: TbStage) => input.tb.filter(x => x.stage === s);
    const stages: [TbStage, number, 'rapid' | 'blitz'][] = [
      ['rapid15', TB_STAGE_GAMES.rapid15, 'rapid'],
      ['rapid10', TB_STAGE_GAMES.rapid10, 'rapid'],
      ['blitz', TB_STAGE_GAMES.blitz, 'blitz'],
    ];
    for (const [stage, n, tc] of stages) {
      const known = by(stage);
      const lot = lotOf(known) ?? (rand() < 0.5 ? 1 : 2);
      let s1 = 0;
      for (let k = 1; k <= n; k++) {
        const fixed = known.find(x => x.stageGame === k)?.hp;
        const hp = fixed ?? draw(p1Probs(input.wdl[tc], k % 2 === 1 ? lot : other(lot)), rand());
        tb.push(hp);
        s1 += hp;
      }
      if (s1 !== n) { winner = s1 > n ? 1 : 2; decidedStage = stage; break; }
    }
    if (winner === null) {
      decidedStage = 'sd';
      const known = by('sd');
      const lot = lotOf(known) ?? (rand() < 0.5 ? 1 : 2);
      for (let k = 1; k <= SD_CAP && winner === null; k++) {
        const fixed = known.find(x => x.stageGame === k)?.hp;
        const hp = fixed ?? draw(p1Probs(input.wdl.blitz, k % 2 === 1 ? lot : other(lot)), rand());
        tb.push(hp);
        if (hp !== 1) winner = hp === 2 ? 1 : 2;
      }
      winner ??= rand() < 0.5 ? 1 : 2;
    }
  }

  return { simId: index, g1White, classical, p1Hp: p1, p2Hp: p2, endGame, decidedStage, tb, winner };
}

/** Fun facts across N_BROWSER_SIMS simulations. */
export function simulateStats(input: SimInput, n = N_BROWSER_SIMS): SimStats {
  let longestSd = 0, maxMargin = -1, allDraws = 0, toSd = 0, shutouts = 0;
  let maxMarginScore: SimStats['maxMarginScore'] = null;
  for (let i = 0; i < n; i++) {
    const s = simulateMatch(input, i);
    const margin = Math.abs(s.p1Hp - s.p2Hp);
    if (margin > maxMargin || (margin === maxMargin && maxMarginScore && s.endGame < maxMarginScore.games)) {
      maxMargin = margin;
      maxMarginScore = { p1: s.p1Hp, p2: s.p2Hp, games: s.endGame };
    }
    if (s.endGame === N_CLASSICAL && s.classical.every(v => v === 1)) allDraws += 1;
    if (s.decidedStage === 'sd') { toSd += 1; longestSd = Math.max(longestSd, s.tb.length - 8); }
    if (Math.min(s.p1Hp, s.p2Hp) <= 1) shutouts += 1;
  }
  return { n, longestSd, maxMargin: Math.max(0, maxMargin), maxMarginScore, allDraws, toSd, shutouts };
}
