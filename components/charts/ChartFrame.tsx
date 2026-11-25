'use client';

import type { CSSProperties, ReactNode } from 'react';

import { TableFallback } from '@/components/ui/TableFallback';
import { cn } from '@/lib/utils';
import { PHONE_WIDTH } from './scales';
import { useSize } from './useSize';

export interface ChartSize { width: number; height: number; phone: boolean }
export interface ChartTable { columns: string[]; rows: (string | number)[][] }

interface ChartFrameProps {
  /** What the y axis is. */
  caption?: ReactNode;
  /** States the finding; names the plot for assistive tech. LineChart puts it on its own <svg role="img">. */
  ariaLabel: string;
  height: { desktop: number; phone: number };
  legend?: ReactNode;
  table?: ChartTable;
  /** Returns the contents of the plot box (an <svg role="img" aria-label> and any overlay). */
  children: (size: ChartSize) => ReactNode;
  empty?: ReactNode;
  className?: string;
}

/** Caption, plot drawn at real pixels, legend, table. CSS alone sets the height of the box, so measuring it never moves the page. */
export function ChartFrame({ caption, ariaLabel, height, legend, table, children, empty, className }: ChartFrameProps) {
  const [ref, width] = useSize<HTMLDivElement>();
  const phone = width > 0 && width < PHONE_WIDTH;
  return (
    <figure aria-label={empty ? ariaLabel : undefined} className={cn('min-w-0', className)}>
      {caption && <figcaption className="mb-3 type-small text-ink-2">{caption}</figcaption>}
      {empty ?? (
        <div className="[container-type:inline-size]" style={{ '--h': `${height.desktop}px`, '--h-phone': `${height.phone}px` } as CSSProperties}>
          <div ref={ref} className="relative h-[var(--h)] w-full [@container_(max-width:559.98px)]:h-[var(--h-phone)]">
            {width > 0 && children({ width, height: phone ? height.phone : height.desktop, phone })}
          </div>
        </div>
      )}
      {legend && <div className="mt-4">{legend}</div>}
      {table && <TableFallback className="mt-3" columns={table.columns} rows={table.rows} />}
    </figure>
  );
}
