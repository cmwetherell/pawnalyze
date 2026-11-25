import { token, type TokenName } from './css';

export type Tone =
  | 'ink' | 'context' | 'p1' | 'p2' | 'draw' | 'win' | 'loss' | 'level' | 'gold' | 'silver' | 'bronze'
  | 'positive' | 'negative' | 'brand' | 'cx-1' | 'cx-2' | 'cx-3' | 'cx-4' | `series-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

/** Class names are written out in full so Tailwind's scanner finds every one of them. */
export const fillClass: Record<Tone, string> = {
  ink: 'bg-ink', context: 'bg-context', p1: 'bg-p1', p2: 'bg-p2', draw: 'bg-draw',
  win: 'bg-ink', loss: 'border border-control bg-transparent', level: 'hatch',
  gold: 'bg-gold', silver: 'bg-silver', bronze: 'bg-bronze',
  positive: 'bg-positive', negative: 'bg-negative', brand: 'bg-brand-mark',
  'cx-1': 'bg-cx-1', 'cx-2': 'bg-cx-2', 'cx-3': 'bg-cx-3', 'cx-4': 'bg-cx-4',
  'series-1': 'bg-series-1', 'series-2': 'bg-series-2', 'series-3': 'bg-series-3', 'series-4': 'bg-series-4',
  'series-5': 'bg-series-5', 'series-6': 'bg-series-6', 'series-7': 'bg-series-7', 'series-8': 'bg-series-8',
};

/** Text colour that sits on `fillClass` of the same tone. Every pair passes 4.5:1 in both themes: check-theme.mjs reads this map. */
export const onClass: Record<Tone, string> = {
  ink: 'text-ink-inverse', context: 'text-on-mid', p1: 'text-on-p1', p2: 'text-on-p2', draw: 'text-on-draw',
  win: 'text-ink-inverse', loss: 'text-ink', level: 'text-ink',
  gold: 'text-on-gold', silver: 'text-on-silver', bronze: 'text-on-bronze',
  positive: 'text-ink-inverse', negative: 'text-ink-inverse', brand: 'text-on-mid',
  'cx-1': 'text-on-mid', 'cx-2': 'text-ink-inverse', 'cx-3': 'text-ink-inverse', 'cx-4': 'text-ink-inverse',
  'series-1': 'text-ink-inverse', 'series-2': 'text-on-p1', 'series-3': 'text-ink-inverse', 'series-4': 'text-on-mid',
  'series-5': 'text-on-mid', 'series-6': 'text-ink-inverse', 'series-7': 'text-on-mid', 'series-8': 'text-ink-inverse',
};

const MARK: Partial<Record<Tone, TokenName>> = { win: 'ink', loss: 'control', level: 'draw', brand: 'brand-mark' };

export const toneToken = (t: Tone): TokenName => MARK[t] ?? (t as TokenName);
export const strokeVar = (t: Tone): string => token(toneToken(t));

export const playerTone = (id: 1 | 2): 'p1' | 'p2' => (id === 1 ? 'p1' : 'p2');
export const medalTone = (rank: 1 | 2 | 3): 'gold' | 'silver' | 'bronze' => (['gold', 'silver', 'bronze'] as const)[rank - 1];

const complexityStep = (score: number): 0 | 1 | 2 | 3 => (score <= 25 ? 0 : score <= 50 ? 1 : score <= 75 ? 2 : 3);
/** 1-25, 26-50, 51-75, 76-100. */
export const complexityTone = (score: number): 'cx-1' | 'cx-2' | 'cx-3' | 'cx-4' => (['cx-1', 'cx-2', 'cx-3', 'cx-4'] as const)[complexityStep(score)];
export const complexityWord = (score: number): 'Simple' | 'Moderate' | 'Complex' | 'Extreme' => (['Simple', 'Moderate', 'Complex', 'Extreme'] as const)[complexityStep(score)];

/** 0 -> series-1 ... 7 -> series-8, then 'context'. */
export const seriesTone = (slot: number): Tone => (slot >= 0 && slot < 8 ? (`series-${slot + 1}` as Tone) : 'context');
