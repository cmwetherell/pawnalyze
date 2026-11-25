'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

import { TableFallback } from '@/components/ui/TableFallback';
import { cn } from '@/lib/utils';
import { PHONE_WIDTH } from './scales';
import { useSize } from './useSize';

export interface ChartSize { width: number; height: number; phone: boolean }
export interface ChartTable { columns: string[]; rows: (string | number)[][] }

interface ChartFrameProps {
  /** What the y axis is. */
  caption?: ReactNode;
  /** A control that changes the figure (a metric switch), at the right end of the caption line. */
  tools?: ReactNode;
  /** States the finding; names the plot for assistive tech. LineChart puts it on its own <svg role="img">. */
  ariaLabel: string;
  height: { desktop: number; phone: number };
  legend?: ReactNode;
  table?: ChartTable;
  /** Returns the contents of the plot box (an <svg role="img" aria-label> and any overlay). */
  children: (size: ChartSize) => ReactNode;
  empty?: ReactNode;
  /** From 1024 the plot takes the height that is left in its grid cell; `height` is the least. */
  fill?: boolean;
  className?: string;
}

// The box is tall by CSS in both cases, so measuring it never moves the page.
const BOX = 'h-[var(--h)] [@container_(max-width:559.98px)]:h-[var(--h-phone)]';
const FILL = 'min-h-[var(--h)] max-lg:h-[var(--h)] [@container_(max-width:559.98px)]:min-h-[var(--h-phone)] max-lg:[@container_(max-width:559.98px)]:h-[var(--h-phone)] lg:flex-1';

/** Caption, plot drawn at real pixels, legend, table. CSS alone sets the height of the box, so measuring it never moves the page. */
export function ChartFrame({ caption, tools, ariaLabel, height, legend, table, children, empty, fill = false, className }: ChartFrameProps) {
  const [ref, width, measured] = useSize<HTMLDivElement>();
  const phone = width > 0 && width < PHONE_WIDTH;
  // Opening the table makes the cell taller; the plot keeps the height it had.
  const [held, setHeld] = useState<number | null>(null);
  return (
    <figure
      aria-label={empty ? ariaLabel : undefined}
      className={cn('min-w-0', fill && 'lg:flex lg:flex-col', className)}
      onClickCapture={fill ? e => { const d = (e.target as Element).closest('summary')?.parentElement as HTMLDetailsElement | null | undefined; if (d) setHeld(d.open ? null : measured); } : undefined}
    >
      {tools ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <figcaption className="type-small text-ink-2">{caption}</figcaption>
          {tools}
        </div>
      ) : caption && <figcaption className="mb-3 type-small text-ink-2">{caption}</figcaption>}
      {empty ?? (
        <div className={cn('[container-type:inline-size]', fill && 'lg:flex lg:flex-1 lg:flex-col')} style={{ '--h': `${height.desktop}px`, '--h-phone': `${height.phone}px` } as CSSProperties}>
          <div ref={ref} style={held ? { minHeight: held } : undefined} className={cn('relative w-full', fill ? FILL : BOX)}>
            {width > 0 && children({ width, height: fill && measured > 0 ? measured : phone ? height.phone : height.desktop, phone })}
          </div>
        </div>
      )}
      {legend && <div className="mt-4">{legend}</div>}
      {table && <TableFallback className="mt-3" columns={table.columns} rows={table.rows} />}
    </figure>
  );
}
