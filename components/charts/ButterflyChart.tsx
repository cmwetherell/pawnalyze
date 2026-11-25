import { hoverGround } from '@/components/ui/styles';
import { TableFallback } from '@/components/ui/TableFallback';
import { formatter, type Formatter } from '@/lib/format';
import { fillClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';
import type { ChartTable } from './ChartFrame';

export interface ButterflyRow { key: string; label: string; sub?: string; left: number; right: number; /** Hairline under this row. */ divider?: boolean }

interface ButterflyChartProps {
  rows: ButterflyRow[];
  leftTone: Tone;
  rightTone: Tone;
  /** Names the two sides for assistive tech. */
  names?: [string, string];
  format: Formatter;
  ariaLabel?: string;
  table?: ChartTable;
  className?: string;
}

/** Shares below this print no number; their hairline bar stays. */
const SMALLEST = 0.0005;

/** One list of outcomes, two sides, one scale. */
export function ButterflyChart({ rows, leftTone, rightTone, names = ['Left', 'Right'], format, ariaLabel, table, className }: ButterflyChartProps) {
  const fmt = formatter(format);
  const top = Math.max(...rows.flatMap(r => [r.left, r.right]), 1e-9);
  const side = (v: number, tone: Tone, rtl: boolean) => (
    <span className={cn('flex min-w-0 items-center gap-2', rtl && 'flex-row-reverse')}>
      {v > 0 && (
        <span
          className={cn('h-6 min-w-px shrink-0 transition-[width] duration-data', fillClass[tone], rtl ? 'rounded-l-sm' : 'rounded-r-sm')}
          style={{ width: `calc((100% - 3.25rem) * ${(v / top).toFixed(5)})` }}
        />
      )}
      <span className={cn('type-data', v === top ? 'font-semibold text-ink' : 'text-ink-2')}>{v >= SMALLEST ? fmt(v) : ''}</span>
    </span>
  );
  return (
    <figure className={cn('min-w-0', className)}>
      <ul aria-label={ariaLabel} className="space-y-1">
        {rows.map(r => (
          <li key={r.key} className={cn('rounded-sm transition-colors duration-in', hoverGround, r.divider && 'mb-2 border-b border-line pb-3')}>
            <span className="sr-only">{r.label}{r.sub ? ` ${r.sub}` : ''}: {names[0]} {fmt(r.left)}, {names[1]} {fmt(r.right)}</span>
            <span aria-hidden className="grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] items-center gap-x-3 sm:grid-cols-[minmax(0,1fr)_7.5rem_minmax(0,1fr)]">
              {side(r.left, leftTone, true)}
              <span className="flex flex-col items-center whitespace-nowrap py-0.5 sm:flex-row sm:items-baseline sm:justify-center sm:gap-2 sm:py-0">
                <span className="type-data font-medium text-ink">{r.label}</span>
                {r.sub && <span className="type-label text-ink-3">{r.sub}</span>}
              </span>
              {side(r.right, rightTone, false)}
            </span>
          </li>
        ))}
      </ul>
      {table && <TableFallback className="mt-3" columns={table.columns} rows={table.rows} />}
    </figure>
  );
}
