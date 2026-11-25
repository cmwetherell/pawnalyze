import type { ReactNode } from 'react';

import { formatter, type Formatter } from '@/lib/format';
import { fillClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';
import { trackGround } from './styles';

interface MeterProps {
  /** 0..max */
  value: number;
  /** Tick at the pre-scenario value. */
  baseline?: number | null;
  /** The value that fills the track. Scales the bar only: the label is still `value`. */
  max?: number;
  tone?: Tone;
  label?: 'right' | 'none';
  /** How the label reads; a probability by default. */
  format?: Formatter;
  /** Change against the baseline, under the label. */
  delta?: ReactNode;
  /** sm: phones show the number alone. */
  bar?: 'always' | 'sm';
  /** Faint ticks at each quarter. */
  ruled?: boolean;
  className?: string;
}

/** One value on a track. At zero there is no fill and no track, just the number. Decorative: the number is always in words too. */
export function Meter({ value, baseline = null, max = 1, tone = 'ink', label = 'none', format = 'pct', delta, bar = 'always', ruled = false, className }: MeterProps) {
  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / max) * 100))}%`;
  const on = value > 0;
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <div aria-hidden className={cn('relative h-1.5 min-w-8 flex-1 rounded-sm', bar === 'sm' && 'hidden sm:block', on && trackGround)}>
        {on && <div className={cn('absolute inset-y-0 left-0 min-w-0.5 rounded-sm transition-[width] duration-data', fillClass[tone])} style={{ width: pct(value) }} />}
        {ruled && on && [25, 50, 75].map(t => <span key={t} className="absolute -inset-y-1 w-px bg-line" style={{ left: `${t}%` }} />)}
        {baseline !== null && Math.abs(baseline - value) > 1e-9 && <span className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-ink-3 transition-[left] duration-data" style={{ left: pct(baseline) }} />}
      </div>
      {label === 'right' && (
        <span className={cn('min-w-14 shrink-0 text-right type-data', on ? 'text-ink' : 'text-ink-3', bar === 'sm' && 'max-sm:flex-1')}>
          {formatter(format)(value)}
          {delta && <span className="block leading-tight">{delta}</span>}
        </span>
      )}
    </div>
  );
}
