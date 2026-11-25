import type { ReactNode } from 'react';

import { SplitBar, type SplitSegment } from '@/components/ui/SplitBar';
import { TableFallback } from '@/components/ui/TableFallback';
import { formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ChartTable } from './ChartFrame';

export interface LadderRung { label: string; sub?: string; rule?: ReactNode; /** 0..1 chance the stage is reached */ reach: number; segments: SplitSegment[] }

interface LadderChartProps { rungs: LadderRung[]; ariaLabel?: string; table?: ChartTable; className?: string }

/** Stages one under another: how often each is reached, and what happens there. Three columns when its own box is wide enough. */
export function LadderChart({ rungs, ariaLabel, table, className }: LadderChartProps) {
  return (
    <figure className={cn('min-w-0 [container-type:inline-size]', className)}>
      <ol aria-label={ariaLabel}>
        {rungs.map((r, i) => (
          <li
            key={r.label}
            className={cn(
              'grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-4 [@container_(min-width:40rem)]:grid-cols-[9rem_minmax(0,1fr)_5rem] [@container_(min-width:40rem)]:gap-x-6',
              i === 0 ? 'pt-0' : 'border-t border-line',
            )}
          >
            <div className="min-w-0">
              <p className="type-ui text-ink">{r.label}</p>
              {r.sub && <p className="type-small text-ink-2">{r.sub}</p>}
            </div>
            <div className="text-right [@container_(min-width:40rem)]:order-last">
              <p className={cn('type-data font-semibold', r.reach > 0 ? 'text-ink' : 'text-ink-3')}>{formatPct(r.reach)}</p>
              <p className="type-label text-ink-3">reach it</p>
            </div>
            <div className="col-span-2 min-w-0 [@container_(min-width:40rem)]:col-span-1">
              <SplitBar height={32} labels="inside" segments={r.segments} ariaLabel={`${r.label}: ${r.segments.map(s => `${s.label} ${formatPct(s.value)}`).join(', ')}`} />
              {r.rule && <p className="mt-2 type-small text-ink-2">{r.rule}</p>}
            </div>
          </li>
        ))}
      </ol>
      {table && <TableFallback className="mt-3" columns={table.columns} rows={table.rows} />}
    </figure>
  );
}
