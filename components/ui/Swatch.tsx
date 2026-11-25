import type { ReactNode } from 'react';

import { fillClass, strokeVar, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

export type SwatchShape = 'square' | 'line' | 'circle' | 'triangle' | 'diamond';

/** The mark itself, beside its name. Identity never rides on colour alone. */
export function Swatch({ tone, shape = 'square', className }: { tone: Tone; shape?: SwatchShape; className?: string }) {
  if (shape === 'square') return <span aria-hidden className={cn('inline-block h-3 w-3 shrink-0 rounded-sm', fillClass[tone], className)} />;
  if (shape === 'line') return <span aria-hidden className={cn('inline-block h-[3px] w-4 shrink-0', fillClass[tone], className)} />;
  const c = strokeVar(tone);
  return (
    <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden className={cn('shrink-0', className)} fill="none" stroke={c} strokeWidth={1.75}>
      {shape === 'circle' && <circle cx={6} cy={6} r={4.500} />}
      {shape === 'triangle' && <path d="M6 1.500 11 10.500H1z" />}
      {shape === 'diamond' && <path d="M6 1 11 6 6 11 1 6z" />}
    </svg>
  );
}

export interface LegendItem { tone: Tone; label: ReactNode; shape?: SwatchShape }

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-6 gap-y-2 type-small text-ink-2', className)}>
      {items.map((i, n) => <li key={n} className="inline-flex items-center gap-2"><Swatch tone={i.tone} shape={i.shape} />{i.label}</li>)}
    </ul>
  );
}
