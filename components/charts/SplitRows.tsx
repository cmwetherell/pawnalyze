import type { CSSProperties, ReactNode } from 'react';

import { SplitBar } from '@/components/ui/SplitBar';
import { TextLink } from '@/components/ui/TextLink';
import { formatter, type Formatter } from '@/lib/format';
import type { Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

export interface SplitRow {
  key: string;
  title: string;
  href?: string;
  meta?: ReactNode;
  /** 0..1; the right side is the rest. Null: not available, `meta` says why. */
  left: number | null;
  /** One per entry in `columns`, null where there is none. Under 1024 they follow the bar, each under its name. */
  cells?: ReactNode[];
  /** Our own row: gold wash and edge. */
  own?: boolean;
}

interface SplitRowsProps {
  label: string;
  /** Heads the first column. */
  head: string;
  names: [string, string];
  tones: [Tone, Tone];
  rows: SplitRow[];
  columns?: string[];
  format?: Formatter;
  className?: string;
}

/** Every row and the head keep 12px inside the rules, so our own row can carry a ground and the bars still line up. */
const GRID = 'grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-center gap-x-3 px-3 lg:grid-cols-[var(--cols)] lg:gap-x-4';

/** The same split from several sources, bars aligned so they can be compared. Three lines on a phone, one from 1024. */
export function SplitRows({ label, head, names, tones, rows, columns = [], format = 'pct', className }: SplitRowsProps) {
  const fmt = formatter(format);
  const cols = { '--n': Math.max(1, columns.length - 1), '--cols': `minmax(8.5rem,1fr) 5.5rem minmax(5rem,2fr) 5.5rem${columns.length ? ` repeat(${columns.length},7.5rem)` : ''}` } as CSSProperties;
  return (
    <div className={cn('min-w-0', className)} style={cols}>
      <div aria-hidden className={cn(GRID, 'border-b border-control pb-2 type-small text-ink-2')}>
        <span className="hidden lg:block">{head}</span>
        <span className="lg:text-right">{names[0]}</span>
        <span />
        <span className="text-right lg:text-left">{names[1]}</span>
        {columns.map(c => <span key={c} className="hidden lg:block">{c}</span>)}
      </div>
      <ul aria-label={label}>
        {rows.map(r => (
          <li key={r.key} className={cn('relative border-b border-line', r.own && 'bg-brand-wash')}>
            {r.own && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-brand-mark" />}
            <div className={cn(GRID, 'gap-y-2 py-4')}>
              <div className="col-span-3 min-w-0 lg:col-span-1">
                <p className="type-data font-medium text-ink">{r.href ? <TextLink href={r.href}>{r.title}</TextLink> : r.title}</p>
                {r.meta && <div className="type-label text-ink-2">{r.meta}</div>}
              </div>
              {r.left !== null && (
                <>
                  <p className="type-stat-sm text-ink lg:text-right"><span className="sr-only">{names[0]} </span>{fmt(r.left)}</p>
                  <SplitBar
                    height={20} ariaLabel={`${r.title}: ${names[0]} ${fmt(r.left)}, ${names[1]} ${fmt(1 - r.left)}`}
                    segments={[{ key: 'l', value: r.left, tone: tones[0], label: names[0] }, { key: 'r', value: 1 - r.left, tone: tones[1], label: names[1] }]}
                  />
                  <p className="text-right type-stat-sm text-ink lg:text-left"><span className="sr-only">{names[1]} </span>{fmt(1 - r.left)}</p>
                </>
              )}
              {r.left !== null && columns.length > 0 && (
                <dl className={cn('col-span-3 grid grid-cols-[minmax(8rem,1fr)_repeat(var(--n),minmax(0,1fr))] gap-x-3 lg:contents', !r.cells?.some(Boolean) && 'hidden')}>
                  {columns.map((c, i) => {
                    const cell = r.cells?.[i];
                    return (
                      <div key={c} className={cn('min-w-0 type-label tnum', !cell && 'max-lg:invisible')}>
                        <dt className="text-ink-3 lg:sr-only">{c}</dt>
                        <dd className="text-ink-2">{cell ?? <span className="text-ink-3">–</span>}</dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
