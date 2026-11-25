'use client';

import type { ReactNode } from 'react';

import { Flag } from '@/components/ui/Flag';
import { Icon } from '@/components/ui/Icon';
import { SplitBar, type SplitSegment } from '@/components/ui/SplitBar';
import { goldLine, hoverGround, selectedGround } from '@/components/ui/styles';
import { formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface RaceRow {
  key?: string;
  rank: number;
  /** Federation code. */
  flag: string;
  name: string;
  seed?: ReactNode;
  segments: SplitSegment[];
  /** Headline figure. A plain zero ("0.0%") is quiet by itself. */
  value: ReactNode;
  /** Quiet headline figure, when `value` is not plain text. */
  muted?: boolean;
  sub?: ReactNode;
  /** 0..1 tick on the bar. */
  baseline?: number;
  delta?: ReactNode;
  selected?: boolean;
  ariaLabel?: string;
  onSelect?: () => void;
  onPrefetch?: () => void;
}

interface RaceRowsProps { rows: RaceRow[]; /** 0/25/50/75/100% header and ticks */ ruled?: boolean; ariaLabel?: string; className?: string }

const COLS = 'grid items-center gap-x-2 md:gap-x-6 grid-cols-[1.25rem_minmax(0,1fr)] md:grid-cols-[1.25rem_minmax(0,15rem)_minmax(0,1fr)_6.5rem]';
const COLS_OPEN = 'grid-cols-[1.25rem_minmax(0,1fr)_1rem] md:grid-cols-[1.25rem_minmax(0,15rem)_minmax(0,1fr)_6.5rem_1rem]';
const TICKS = [0, 25, 50, 75, 100];
const ZERO = formatPct(0);

/** Ranked bars on one 0 to 100% scale. Each row opens something when it has `onSelect`. */
export function RaceRows({ rows, ruled = true, ariaLabel, className }: RaceRowsProps) {
  const interactive = rows.some(r => r.onSelect);
  const cols = cn(COLS, interactive && COLS_OPEN);
  return (
    <div className={className}>
      {ruled && (
        <div aria-hidden className={cn(cols, 'hidden border-b border-control pb-2 md:grid')}>
          <span className="col-start-3 flex justify-between type-micro text-ink-3 tnum">
            {TICKS.map(t => <span key={t} className="relative w-0"><span className={cn('absolute bottom-0 whitespace-nowrap', t === 0 ? 'left-0' : t === 100 ? 'right-0' : '-translate-x-1/2')}>{t}{t === 100 && '%'}</span></span>)}
          </span>
        </div>
      )}
      <ol aria-label={ariaLabel}>
        {rows.map(r => {
          const any = r.segments.some(s => s.value > 0);
          const quiet = r.muted ?? (typeof r.value === 'string' ? r.value === ZERO : !any);
          const value = <span className={cn('type-data', quiet ? 'text-ink-3' : 'font-semibold text-ink')}>{r.value}</span>;
          const sub = r.sub && <span className="type-label text-ink-3">{r.sub}</span>;
          const inner = (
            <>
              <span className="type-data text-ink-3">{r.rank}</span>
              <span className="flex min-w-0 items-center gap-2 py-2 md:gap-3">
                <Flag code={r.flag} size="md" decorative />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn('line-clamp-2 min-w-0 type-ui text-ink md:line-clamp-1', r.onSelect && cn(goldLine, 'group-hover/row:underline'))}>{r.name}</span>
                    <span className="shrink-0 md:hidden">{value}</span>
                  </span>
                  {/* On phones the change joins the second line, so the name keeps the first. */}
                  <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                    {r.seed && <span className="min-w-0 truncate type-label text-ink-3">{r.seed}</span>}
                    {(r.delta || sub) && <span className="ml-auto flex shrink-0 items-baseline gap-2 whitespace-nowrap md:hidden">{r.delta}{sub}</span>}
                  </span>
                </span>
              </span>
              <span className="relative order-last col-span-full flex items-center self-stretch pb-3 md:order-none md:col-span-1 md:pb-0">
                {ruled && TICKS.map(t => <span key={t} aria-hidden className="absolute inset-y-0 hidden w-px bg-grid md:block" style={{ left: t === 100 ? 'calc(100% - 1px)' : `${t}%` }} />)}
                {any && <SplitBar className="relative w-full" height={12} segments={r.segments} tick={r.baseline} ariaLabel={`${r.name}: ${r.segments.map(s => s.label).join(', ')}`} />}
              </span>
              <span className="hidden py-2 text-right md:block">
                <span className="flex items-baseline justify-end gap-2">{r.delta}{value}</span>
                {sub && <span className="block">{sub}</span>}
              </span>
              {interactive && <Icon name="chevron-right" size={16} className={cn('text-ink-3 transition-transform duration-slide', r.selected && 'rotate-90 text-ink')} />}
            </>
          );
          // The tint runs past the words and the rule, not up to them.
          const cls = cn(cols, 'group/row -mx-3 min-h-16 w-[calc(100%+24px)] px-3 text-left transition-colors duration-in', r.selected && selectedGround);
          return (
            <li key={r.key ?? r.name} className="border-b border-line">
              {r.onSelect ? (
                <button
                  type="button" aria-pressed={r.selected ?? false} aria-label={r.ariaLabel} data-selected={r.selected || undefined} onClick={r.onSelect} onPointerEnter={r.onPrefetch} onFocus={r.onPrefetch}
                  className={cn(cls, hoverGround)}
                >
                  {inner}
                </button>
              ) : <div data-selected={r.selected || undefined} className={cls}>{inner}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
