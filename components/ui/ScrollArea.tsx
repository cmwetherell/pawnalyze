'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ScrollAreaProps {
  /** Names the region. */
  label: string;
  maxHeight: number | string;
  /** Keep this element (a CSS selector inside the area) in view by scrolling the area, never the page. */
  follow?: string;
  /** Changes when `follow` should be re-read. */
  followKey?: string | number;
  /** Focus stays on a control outside (the list of a combobox): no region and no tab stop. */
  passive?: boolean;
  className?: string;
  children: ReactNode;
}

export function ScrollArea({ label, maxHeight, follow, followKey, passive = false, className, children }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current;
    const el = follow ? box?.querySelector<HTMLElement>(follow) : null;
    if (!box || !el) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.top < b.top) box.scrollTop -= b.top - r.top;
    else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom;
  }, [follow, followKey]);
  return (
    <div
      ref={ref}
      {...(passive ? {} : { role: 'region', 'aria-label': label, tabIndex: 0 })}
      style={{ maxHeight }}
      className={cn('relative overflow-y-auto overflow-x-hidden overscroll-contain focus-visible:-outline-offset-2 [&_:focus-visible]:-outline-offset-2', className)}
    >
      {children}
    </div>
  );
}
