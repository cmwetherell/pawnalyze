'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

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
  /** In a flex column, from 768: takes the height that is left instead of `maxHeight`. */
  fill?: boolean;
  /** The last line fades while there is more below. */
  fade?: boolean;
  className?: string;
  children: ReactNode;
}

export function ScrollArea({ label, maxHeight, follow, followKey, passive = false, fill = false, fade = false, className, children }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const box = ref.current;
    if (!box || !fade) return;
    const read = () => setMore(getComputedStyle(box).overflowY !== 'visible' && box.scrollTop + box.clientHeight < box.scrollHeight - 1);
    const ro = new ResizeObserver(read);
    const watch = () => { ro.disconnect(); ro.observe(box); for (const el of box.children) ro.observe(el); };
    const mo = new MutationObserver(watch);
    watch();
    mo.observe(box, { childList: true });
    box.addEventListener('scroll', read, { passive: true });
    return () => { ro.disconnect(); mo.disconnect(); box.removeEventListener('scroll', read); };
  }, [fade]);
  useEffect(() => {
    const box = ref.current;
    if (!box || !follow) return;
    const off = () => {
      const r = box.querySelector(follow)?.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      return !r ? null : r.top < b.top - 1 ? r.top - b.top : r.bottom > b.bottom + 1 ? r.bottom - b.bottom : 0;
    };
    const bring = () => { box.scrollTop += off() ?? 0; };
    bring();
    // A box that changes height (something over it loaded) keeps the element in view, unless the reader had scrolled it away.
    let held = true;
    const onScroll = () => { held = off() === 0; };
    const ro = new ResizeObserver(() => { if (held) bring(); });
    ro.observe(box);
    box.addEventListener('scroll', onScroll, { passive: true });
    return () => { ro.disconnect(); box.removeEventListener('scroll', onScroll); };
  }, [follow, followKey]);
  return (
    <div
      ref={ref}
      {...(passive ? {} : { role: 'region', 'aria-label': label, tabIndex: 0 })}
      style={fill ? { '--max-h': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } as CSSProperties : { maxHeight }}
      className={cn('relative overflow-y-auto overflow-x-hidden overscroll-contain focus-visible:-outline-offset-2 [&_:focus-visible]:-outline-offset-2', fill && 'max-h-[var(--max-h)] md:max-h-none md:min-h-48 md:shrink md:grow md:basis-0', more && '[mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)]', className)}
    >
      {children}
    </div>
  );
}
