/**
 * Shareable scenario state in the URL:
 *   ?s=3:1,5:d,9:2   classical game picks: 1 = Gukesh wins, 2 = Sindarov wins, d = draw
 *   ?c=1|2           who has White in game 1 (before the colour draw)
 *   ?r=g+20,s-15     rating offsets for the what-if lab (±100)
 *   ?t=2.4           classical draw-propensity θ for the what-if lab
 * Parsing is lenient: unknown or out-of-range tokens are dropped and counted.
 */
import { N_CLASSICAL } from './config';
import type { HalfPoints, PlayerId } from './types';
import type { RatingOffsets } from './model';

export type PickOutcome = '1' | 'd' | '2';

export const PICK_HP: Record<PickOutcome, HalfPoints> = { '1': 2, d: 1, '2': 0 };
export function hpToPick(hp: HalfPoints): PickOutcome {
  return hp === 2 ? '1' : hp === 1 ? 'd' : '2';
}

export const OFFSET_LIMIT = 100;
export const THETA_RANGE = { min: 1, max: 4 };

export interface Scenario {
  picks: Map<number, PickOutcome>;
  g1White: PlayerId | null;
  offsets: RatingOffsets;
  theta: number | null;
}

export function encodePicks(picks: Map<number, PickOutcome>): string {
  return Array.from(picks.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([g, o]) => `${g}:${o}`)
    .join(',');
}

export function parsePicks(param: string | null, blocked: (g: number) => boolean): { picks: Map<number, PickOutcome>; dropped: number } {
  const picks = new Map<number, PickOutcome>();
  let dropped = 0;
  if (!param) return { picks, dropped };
  for (const token of param.split(',').filter(Boolean)) {
    const m = /^(\d{1,2})[:.-]?([12dD])$/.exec(token.trim());
    const g = m ? Number(m[1]) : NaN;
    if (!m || g < 1 || g > N_CLASSICAL || blocked(g)) { dropped += 1; continue; }
    picks.set(g, m[2].toLowerCase() as PickOutcome);
  }
  return { picks, dropped };
}

export function parseColour(param: string | null): PlayerId | null {
  return param === '1' ? 1 : param === '2' ? 2 : null;
}

const clampOffset = (v: number) => Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, Math.round(v)));

export function parseOffsets(param: string | null): RatingOffsets {
  const out: RatingOffsets = { g: 0, s: 0 };
  if (!param) return out;
  for (const token of param.split(',')) {
    const m = /^\s*([gs])\s*([+-]?\s*\d{1,3})\s*$/i.exec(token.replace(/ /g, '+'));
    if (!m) continue;
    const v = Number(m[2].replace(/\s/g, ''));
    if (Number.isFinite(v)) out[m[1].toLowerCase() as 'g' | 's'] = clampOffset(v);
  }
  return out;
}

export function encodeOffsets(o: RatingOffsets): string {
  const fmt = (k: string, v: number) => `${k}${v >= 0 ? '+' : '-'}${Math.abs(v)}`;
  const parts: string[] = [];
  if (o.g !== 0) parts.push(fmt('g', o.g));
  if (o.s !== 0) parts.push(fmt('s', o.s));
  return parts.join(',');
}

export function parseTheta(param: string | null): number | null {
  if (!param) return null;
  const v = Number(param);
  if (!Number.isFinite(v)) return null;
  return Math.min(THETA_RANGE.max, Math.max(THETA_RANGE.min, Math.round(v * 20) / 20));
}

/** Apply a scenario to a URL (only non-default values are written). */
export function writeScenario(url: URL, s: Scenario, runTheta: number, colourKnown: boolean) {
  const set = (k: string, v: string) => { if (v) url.searchParams.set(k, v); else url.searchParams.delete(k); };
  set('s', encodePicks(s.picks));
  set('c', !colourKnown && s.g1White !== null ? String(s.g1White) : '');
  set('r', encodeOffsets(s.offsets));
  set('t', s.theta !== null && Math.abs(s.theta - runTheta) > 1e-9 ? String(s.theta) : '');
}
