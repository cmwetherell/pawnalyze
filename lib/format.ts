/** 0..1 to "34.3%"; at any number of digits, very small and very large values never round to a false 0 or 100. */
export function formatPct(value: number, digits = 1): string {
  const pct = value * 100;
  const step = 10 ** -digits;
  if (pct > 0 && pct < step / 2) return `<${step.toFixed(digits)}%`;
  if (pct < 100 && pct >= 100 - step / 2) return `>${(100 - step).toFixed(digits)}%`;
  return `${pct.toFixed(digits)}%`;
}

/** Signed change in percentage points ("+3.2"), or null when it rounds to nothing. */
export function formatDelta(value: number, baseline: number): string | null {
  const d = (value - baseline) * 100;
  if (Math.abs(d) < 0.05) return null;
  return `${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}`;
}

export function fmtUsd(v: number, compact = true): string {
  if (compact) {
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2).replace(/0$/, '')}M`;
    if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`;
  }
  return `$${Math.round(v).toLocaleString('en-US')}`;
}

/** "about 85 in 100" style phrasing for a probability. */
export function inHundred(p: number): string {
  const n = Math.round(p * 100);
  if (n <= 0) return 'fewer than 1 in 100';
  if (n >= 100) return 'more than 99 in 100';
  return `about ${n} in 100`;
}

/**
 * Named formats, so a server component can hand one to a client chart (a function cannot cross that boundary).
 * `pct`: 0..1 to "34.3%". `pct0`: 0..1 to "34%". `percent`: 0..100 to "34.3%". `percent0`: 0..100 to "34%".
 * `plain`: a whole number with no thousands mark, for ratings.
 */
export type ValueFormat = 'pct' | 'pct0' | 'percent' | 'percent0' | 'int' | 'plain' | 'one' | 'signed';
export type Formatter = ValueFormat | ((v: number) => string);

const FORMATS: Record<ValueFormat, (v: number) => string> = {
  pct: v => formatPct(v),
  pct0: v => formatPct(v, 0),
  percent: v => formatPct(v / 100),
  percent0: v => formatPct(v / 100, 0),
  int: v => Math.round(v).toLocaleString('en-US'),
  plain: v => String(Math.round(v)),
  one: v => v.toFixed(1),
  signed: v => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '0'),
};

export const formatter = (f: Formatter): ((v: number) => string) => (typeof f === 'function' ? f : FORMATS[f]);
