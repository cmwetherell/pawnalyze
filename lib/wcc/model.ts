/**
 * Game-model helpers for the what-if lab: draw-odds calibration and bilinear lookup into the
 * pipeline's raw (θ = 1) W/D/L grid. Calibration: W' = W/z, D' = θD/z, B' = B/z, z = W + θD + B.
 */
import type { ModelGrid, PlayerKey, RunParams, TimeControl, Triplet, WdlByWhite, WdlSet } from './types';

export function calibrate([w, d, b]: Triplet, theta: number): Triplet {
  const z = w + theta * d + b;
  if (!(z > 0)) return [w, d, b];
  return [w / z, (theta * d) / z, b / z];
}

/** Inverse of calibrate: recover the raw triplet from a calibrated one. */
export function uncalibrate(t: Triplet, theta: number): Triplet {
  return calibrate(t, 1 / theta);
}

/** Bilinear interpolation into the raw grid; ratings are clamped to the grid range. */
export function lookup(grid: ModelGrid, whiteElo: number, blackElo: number): Triplet {
  const { eloMin, eloStep, n, wdl } = grid;
  const max = eloMin + eloStep * (n - 1);
  const pos = (e: number) => (Math.min(Math.max(e, eloMin), max) - eloMin) / eloStep;
  const x = pos(whiteElo);
  const y = pos(blackElo);
  const x0 = Math.min(Math.floor(x), n - 2);
  const y0 = Math.min(Math.floor(y), n - 2);
  const fx = x - x0;
  const fy = y - y0;
  const at = (wi: number, bi: number, k: number) => wdl[((wi * n) + bi) * 3 + k];
  const out: Triplet = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    out[k] = at(x0, y0, k) * (1 - fx) * (1 - fy)
      + at(x0 + 1, y0, k) * fx * (1 - fy)
      + at(x0, y0 + 1, k) * (1 - fx) * fy
      + at(x0 + 1, y0 + 1, k) * fx * fy;
  }
  const s = out[0] + out[1] + out[2];
  return s > 0 ? [out[0] / s, out[1] / s, out[2] / s] : out;
}

export interface RatingOffsets { g: number; s: number }
export const ZERO_OFFSETS: RatingOffsets = { g: 0, s: 0 };

const TC_KEY: Record<TimeControl, 'c' | 'r' | 'b'> = { classical: 'c', rapid: 'r', blitz: 'b' };

export function add(a: Triplet, b: Triplet, c: Triplet): Triplet {
  // a + (b - c), clipped and renormalised
  const raw = [0, 1, 2].map(k => Math.max(1e-9, a[k] + b[k] - c[k])) as Triplet;
  const s = raw[0] + raw[1] + raw[2];
  return [raw[0] / s, raw[1] / s, raw[2] / s];
}

/**
 * The run's stored W/D/L, shifted by rating offsets and re-calibrated with a new classical θ.
 * Offsets move the raw probabilities by the grid's difference (grid(r + Δ) − grid(r)), so zero
 * offsets reproduce the stored numbers exactly and interpolation error never shows as a delta.
 */
export function adjustedWdl(
  base: WdlSet,
  params: RunParams,
  grid: ModelGrid | null,
  offsets: RatingOffsets,
  thetaClassical: number,
): WdlSet {
  const out = {} as WdlSet;
  for (const tc of ['classical', 'rapid', 'blitz'] as TimeControl[]) {
    const runTheta = params.theta?.[tc] ?? 1;
    const theta = tc === 'classical' ? thetaClassical : runTheta;
    const byWhite = {} as WdlByWhite;
    for (const white of ['1', '2'] as PlayerKey[]) {
      let raw = uncalibrate(base[tc][white], runTheta);
      if (grid && (offsets.g !== 0 || offsets.s !== 0)) {
        const k = TC_KEY[tc];
        const r1 = params.ratings['1'][k];
        const r2 = params.ratings['2'][k];
        const [w0, b0] = white === '1' ? [r1, r2] : [r2, r1];
        const [w1, b1] = white === '1' ? [r1 + offsets.g, r2 + offsets.s] : [r2 + offsets.s, r1 + offsets.g];
        raw = add(raw, lookup(grid, w1, b1), lookup(grid, w0, b0));
      }
      byWhite[white] = calibrate(raw, theta);
    }
    out[tc] = byWhite;
  }
  return out;
}

export function isIdentity(offsets: RatingOffsets, theta: number, runTheta: number): boolean {
  return offsets.g === 0 && offsets.s === 0 && Math.abs(theta - runTheta) < 1e-9;
}

/** Expected share of draws in a classical game for a W/D/L set (colour-averaged). */
export function drawRate(wdl: WdlSet): number {
  return (wdl.classical['1'][1] + wdl.classical['2'][1]) / 2;
}
