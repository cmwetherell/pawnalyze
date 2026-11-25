import type { ReactNode } from 'react';

import { formatter, type Formatter } from '@/lib/format';
import { fillClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

export interface BarRow { key?: string; label: string; /** Under 640. */ short?: string; value: number; tone: Tone; /** Flag or Avatar. */ lead?: ReactNode }

interface BarRowsProps { rows: BarRow[]; format: Formatter; /** Full width of a bar; default the largest value. */ max?: number; /** sm: for a narrow column. */ size?: 'md' | 'sm'; ariaLabel?: string; className?: string }

const SIZE = {
  md: 'min-h-12 grid-cols-[minmax(0,9rem)_minmax(0,1fr)_3.75rem] sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_4rem]',
  sm: 'min-h-10 grid-cols-[minmax(0,8rem)_minmax(0,1fr)_3.5rem]',
} as const;

/** Horizontal bars from zero. A zero has no bar and no track. */
export function BarRows({ rows, format, max, size = 'md', ariaLabel, className }: BarRowsProps) {
  const fmt = formatter(format);
  const top = max ?? Math.max(...rows.map(r => r.value), 1e-9);
  return (
    <ul aria-label={ariaLabel} className={cn('border-t border-line', className)}>
      {rows.map(r => (
        <li key={r.key ?? r.label} className={cn('grid items-center gap-x-3 border-b border-line py-1', SIZE[size])}>
          <span className="flex min-w-0 items-center gap-2 type-ui text-ink">{r.lead}{r.short && <span className="truncate sm:hidden">{r.short}</span>}<span className={cn('truncate', r.short && 'hidden sm:inline')}>{r.label}</span></span>
          <span aria-hidden className="block h-3">
            {r.value > 0 && <span className={cn('block h-full min-w-px rounded-r-sm transition-[width] duration-data', fillClass[r.tone])} style={{ width: `${Math.min(100, (r.value / top) * 100)}%` }} />}
          </span>
          <span className={cn('text-right type-data', r.value > 0 ? 'text-ink' : 'text-ink-3')}>{fmt(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}
