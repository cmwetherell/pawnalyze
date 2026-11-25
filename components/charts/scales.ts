import type { Formatter } from '@/lib/format';

/** Charts narrower than this use the phone height, short labels and fewer ticks. ChartFrame's container query says the same. */
export const PHONE_WIDTH = 560;

export const linear = (d0: number, d1: number, r0: number, r1: number) => {
  const span = d1 - d0 || 1;
  return (v: number): number => r0 + ((v - d0) / span) * (r1 - r0);
};

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Percent charts run to the next of 25, 50, 75, 100 above the maximum. Works in 0..1 and 0..100. */
export function percentMax(max: number, unit: 1 | 100 = 100): number {
  const step = unit / 4;
  return Math.min(unit, Math.max(step, Math.ceil((max - unit * 1e-9) / step) * step));
}

/** 1 for a 0..1 percent format, 100 for a 0..100 one, null when it is not a percentage. */
export function percentUnit(format: Formatter): 1 | 100 | null {
  if (typeof format === 'string') return format.startsWith('percent') ? 100 : format.startsWith('pct') ? 1 : null;
  const half = format(0.5);
  if (!half.endsWith('%')) return null;
  return parseFloat(half) > 5 ? 1 : 100;
}

/** 1, 2, 2.5, 4 or 5 times a power of ten, at or above `raw`. */
function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  return ([1, 2, 2.5, 4, 5, 10].find(k => k * p >= raw - 1e-12) ?? 10) * p;
}

const steps = (from: number, to: number, step: number): number[] => {
  const n = Math.round((to - from) / step);
  return Array.from({ length: n + 1 }, (_, i) => Number((from + i * step).toFixed(6)));
};

interface YDomain { min?: number; max?: number; ticks?: number[]; format: Formatter }

/** The y domain and its ticks. Percentages start at 0 and end on a quarter; other units get round ends around the data. */
export function domain(y: YDomain, values: number[]): { min: number; max: number; ticks: number[] } {
  const lo = values.length ? Math.min(...values) : 0;
  const hi = values.length ? Math.max(...values) : 1;
  const unit = percentUnit(y.format);
  if (unit) {
    const min = y.min ?? 0;
    const max = y.max ?? percentMax(Math.max(hi, min), unit);
    const share = (max - min) / unit;
    return { min, max, ticks: y.ticks ?? steps(min, max, unit * (share > 0.5 ? 0.25 : share > 0.25 ? 0.1 : share > 0.1 ? 0.05 : 0.02)) };
  }
  // Ratings and the like sit far from zero: give them room instead of a zero line.
  const far = lo > 0 && lo > hi * 0.4;
  const from = y.min ?? (far ? lo - Math.max((hi - lo) * 0.15, hi * 0.01) : Math.min(0, lo));
  const to = y.max ?? (far ? hi + Math.max((hi - lo) * 0.15, hi * 0.01) : Math.max(hi, from + 1));
  const step = niceStep((to - from) / (far ? 5 : 4));
  const first = Math.ceil(from / step - 1e-9) * step;
  const min = y.min ?? Math.min(from, Math.floor(from / step + 1e-9) * step);
  const max = y.max ?? Math.ceil(to / step - 1e-9) * step;
  return { min, max, ticks: y.ticks ?? steps(y.min === undefined ? min : first, Math.floor(max / step + 1e-9) * step, step) };
}

/** Tick text: no trailing ".0", and the unit on the top tick only ("100%", then 75, 50). */
export function tickLabels(ticks: number[], fmt: (v: number) => string): string[] {
  const text = ticks.map(t => fmt(t).replace(/\.0+(?=\D*$)/, ''));
  if (!text.every(t => t.endsWith('%'))) return text;
  const top = Math.max(...ticks);
  return text.map((t, i) => (ticks[i] === top ? t : t.slice(0, -1)));
}

/** Text width in Hanken Grotesk, near enough to reserve a margin. */
export function textWidth(text: string, size: number, semibold = false): number {
  let em = 0;
  for (const ch of text) {
    em += /[ilj.,:'’|!]/.test(ch) ? 0.27 : /[ tfr()-]/.test(ch) ? 0.36 : /[mwMW%@–]/.test(ch) ? 0.86 : /[A-Z½]/.test(ch) ? 0.67 : /[0-9<>+−]/.test(ch) ? 0.58 : 0.55;
  }
  return em * size * (semibold ? 1.05 : 1);
}

/** Cut to a width with an ellipsis. */
export function fitText(text: string, max: number, size: number, semibold = false): string {
  if (textWidth(text, size, semibold) <= max) return text;
  let cut = text;
  while (cut.length > 1 && textWidth(`${cut}…`, size, semibold) > max) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

/** Indices of the x labels to print: every nth, always the last (unless it is just the next number), none touching. */
export function xTicks(labels: string[], every: number, x: (i: number) => number): number[] {
  const last = labels.length - 1;
  const at = labels.flatMap((l, i) => (l && i % every === 0 ? [i] : []));
  if (!labels[last] || at[at.length - 1] === last) return at;
  const prev = at[at.length - 1];
  if (prev !== undefined && /^\d+$/.test(labels[last]) && last - prev < every / 2) return at;
  const room = prev === undefined ? Infinity : x(last) - x(prev);
  const need = prev === undefined ? 0 : (textWidth(labels[last], 12) + textWidth(labels[prev], 12)) / 2 + 12;
  return room >= need ? [...at, last] : [...at.slice(0, -1), last];
}

/** The smallest step that keeps the x labels apart. */
export function autoEvery(labels: string[], plotWidth: number): number {
  const widest = Math.max(...labels.map(l => textWidth(l, 12)), 1) + 14;
  const gap = plotWidth / Math.max(1, labels.length - 1);
  return [1, 2, 3, 4, 5, 10, 20, 40, 50].find(n => gap * n >= widest) ?? 100;
}
