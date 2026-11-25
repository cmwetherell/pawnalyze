import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  kind: 'lines' | 'bars' | 'histogram' | 'rounds' | 'chart' | 'cells';
  rows?: number;
  height?: number;
  /** Spoken while it stands in; without one the region around it should carry `aria-busy`. */
  label?: string;
  className?: string;
}

const block = 'block rounded-sm bg-sunken';
const HISTOGRAM = [88, 62, 44, 32, 22, 16, 12, 10, 8, 6, 5, 4, 4, 3, 3, 8];
const WIDTHS = ['w-3/4', 'w-full', 'w-2/3', 'w-5/6', 'w-1/2'];
const BAR = [92, 74, 58, 46, 35, 27, 20, 14, 10, 7];
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const each = (n: number, f: (i: number) => ReactNode) => range(n).map(f);

/** Placeholder with the shape of what replaces it. */
export function Skeleton({ kind, rows, height, label, className }: SkeletonProps) {
  return (
    <div role={label ? 'status' : undefined} className={cn('relative w-full', className)}>
      {label && <span className="sr-only">{label}</span>}
      <div aria-hidden className="w-full animate-skeleton" style={height && kind !== 'histogram' && kind !== 'chart' ? { height } : undefined}>
        {kind === 'lines' && <div className="space-y-3">{each(rows ?? 4, i => <span key={i} className={cn(block, 'h-4', WIDTHS[i % WIDTHS.length])} />)}</div>}
        {kind === 'bars' && each(rows ?? 6, i => (
          <div key={i} className="flex h-12 items-center gap-4 border-b border-line">
            <span className={cn(block, 'h-4 w-6')} />
            <span className={cn(block, 'h-4 w-24')} />
            <span className="min-w-0 flex-1"><span className={cn(block, 'h-3')} style={{ width: `${BAR[i % BAR.length]}%` }} /></span>
            <span className={cn(block, 'h-4 w-12')} />
          </div>
        ))}
        {kind === 'histogram' && (
          <div className="flex items-end gap-1 border-b border-line" style={{ height: height ?? 112 }}>
            {HISTOGRAM.slice(0, rows ?? 16).map((h, i) => <span key={i} className={cn(block, 'flex-1')} style={{ height: `${h}%` }} />)}
          </div>
        )}
        {kind === 'rounds' && each(rows ?? 9, i => (
          <div key={i} className="flex h-10 items-center gap-4 border-b border-line">
            <span className={cn(block, 'h-4 w-8 shrink-0')} />
            <span className={cn(block, 'h-4', WIDTHS[(i + 3) % WIDTHS.length])} />
            <span className={cn(block, 'ml-auto h-4 w-12 shrink-0')} />
          </div>
        ))}
        {kind === 'chart' && (
          <div className="relative w-full overflow-hidden" style={{ height: height ?? 320 }}>
            {each(5, i => <span key={i} className={cn('absolute inset-x-0 h-px', i === 4 ? 'bg-control' : 'bg-line')} style={{ top: `${i * 25}%`, marginTop: i === 4 ? -1 : undefined }} />)}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full fill-none stroke-sunken" strokeWidth={4}>
              <path vectorEffect="non-scaling-stroke" d="M0 78 10 74 20 76 30 66 40 69 50 54 60 48 70 50 80 34 90 28 100 22" />
            </svg>
          </div>
        )}
        {kind === 'cells' && (
          <div className="overflow-hidden border-y border-line">
            <div className="-mb-px -ml-[17px] grid grid-cols-2 lg:grid-cols-4">
              {each(rows ?? 4, i => (
                <div key={i} className="space-y-2 border-b border-l border-line px-4 py-4">
                  <span className={cn(block, 'h-4 w-16')} />
                  <span className={cn(block, 'h-6 w-24')} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Names used by pages not yet migrated. Delete with them.
export const SkeletonBars = ({ rows }: { rows?: number }) => <Skeleton kind="bars" rows={rows} />;
export const SkeletonHistogram = ({ bars }: { bars?: number }) => <Skeleton kind="histogram" rows={bars} />;
export const SkeletonRounds = ({ rows }: { rows?: number }) => <Skeleton kind="rounds" rows={rows} />;
