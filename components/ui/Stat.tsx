import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** Flag or avatar before the value: on its first line, and the sub lines up with the words. */
  lead?: ReactNode;
  sub?: ReactNode;
  delta?: ReactNode;
  /** lg and md are standalone serif figures; sm is the text face, for hairline cells and figures in a row. */
  size?: 'lg' | 'md' | 'sm';
  /** Bar, pips or sparkline under the figure. */
  visual?: ReactNode;
  hint?: string;
  className?: string;
}

const SIZE = { lg: 'type-stat', md: 'type-stat-sm', sm: 'type-lead font-medium leading-snug tnum' } as const;

/** Label over a standalone figure. */
export function Stat({ label, value, lead, sub, delta, size = 'md', visual, hint, className }: StatProps) {
  return (
    <dl title={hint} className={cn('relative flex min-w-0 flex-col gap-1', className)}>
      <dt className="type-label text-ink-2">{label}</dt>
      <dd className={cn('flex gap-y-1', lead ? cn('items-start gap-x-2', SIZE[size]) : 'flex-wrap items-baseline gap-x-3')}>
        {lead && <span className="flex h-[1lh] shrink-0 items-center">{lead}</span>}
        {lead ? (
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex flex-wrap items-baseline gap-x-3"><span className="text-ink">{value}</span>{delta}</span>
            {sub && <span className="type-label text-ink-3">{sub}</span>}
          </span>
        ) : <><span className={cn(SIZE[size], 'text-ink')}>{value}</span>{delta}</>}
      </dd>
      {visual && <dd className="mt-1">{visual}</dd>}
      {sub && !lead && <dd className="type-label text-ink-3">{sub}</dd>}
    </dl>
  );
}
