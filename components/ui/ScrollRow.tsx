'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

interface ScrollRowProps {
  label: string;
  /** Previous and next buttons from 768, when there is something to scroll to. */
  arrows?: boolean;
  /** Mouse drag. */
  drag?: boolean;
  snap?: boolean;
  /** Runs to the page edge on phones. */
  bleed?: boolean;
  /** Children touch and are equally tall; from 1024 they share the width, so nothing scrolls. */
  stretch?: boolean;
  /** Keep this element (a CSS selector inside the row) in view by scrolling the row, never the page. */
  follow?: string;
  /** Changes when `follow` should be re-read. */
  followKey?: string | number;
  className?: string;
  children: ReactNode;
}

/** The only sideways scroller. Always position: relative, so sr-only text inside cannot widen the page. */
export function ScrollRow({ label, arrows = false, drag = false, snap = false, bleed = false, stretch = false, follow, followKey, className, children }: ScrollRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const from = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const swallow = useRef(false);
  const followed = useRef(false);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const start = el.scrollLeft <= 1;
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setEdge(e => (e.start === start && e.end === end ? e : { start, end }));
    };
    const ro = new ResizeObserver(read);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    el.addEventListener('scroll', read, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', read);
    };
  }, []);

  useEffect(() => {
    const box = ref.current;
    const el = follow ? box?.querySelector<HTMLElement>(follow) : null;
    if (!box || !el) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    // Centered, so its neighbors on both sides show that there is more. Straight there the first time.
    const left = box.scrollLeft + r.left + r.width / 2 - (b.left + b.width / 2);
    box.scrollTo({ left, behavior: followed.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
    followed.current = true;
  }, [follow, followKey]);

  const by = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    swallow.current = false;
    if (drag && e.pointerType === 'mouse' && e.button === 0 && ref.current) from.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const f = from.current;
    if (!f || !ref.current) return;
    if (Math.abs(e.clientX - f.x) > 4) f.moved = true;
    if (f.moved) ref.current.scrollLeft = f.left - (e.clientX - f.x);
  };
  const onEnd = () => {
    swallow.current = from.current?.moved ?? false;
    from.current = null;
  };

  const more = !(edge.start && edge.end);
  return (
    <div className={cn('relative flex min-w-0 items-center gap-1', className)}>
      <div
        ref={ref}
        role="group"
        aria-label={label}
        data-scroll-row=""
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onEnd}
        onPointerLeave={onEnd}
        onDragStart={drag ? e => e.preventDefault() : undefined}
        onClickCapture={e => { if (swallow.current) { swallow.current = false; e.preventDefault(); e.stopPropagation(); } }}
        // 4px of padding on every side (taken back by the margin) so focus rings are not cut off.
        className={cn(
          'relative -m-1 min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain p-1 scrollbar-none',
          snap && 'snap-x snap-proximity scroll-px-1',
          bleed && '-mx-gutter px-gutter md:-mx-1 md:px-1',
          bleed && snap && 'scroll-px-gutter md:scroll-px-1',
          drag && more && 'md:cursor-grab md:active:cursor-grabbing',
        )}
      >
        <div className={cn('flex w-max min-w-full', stretch ? 'items-stretch lg:w-full lg:[&>*]:w-auto lg:[&>*]:min-w-0 lg:[&>*]:flex-1 lg:[&>*]:basis-0' : 'items-center gap-2', snap && '[&>*]:snap-start')}>{children}</div>
      </div>
      {/* Both at the end, so the row still starts on the page edge. */}
      {arrows && more && (
        <span className="-mr-3 ml-2 hidden shrink-0 md:flex">
          <IconButton icon="chevron-left" label={`${label}: back`} disabled={edge.start} onClick={() => by(-1)} />
          <IconButton icon="chevron-right" label={`${label}: forward`} disabled={edge.end} onClick={() => by(1)} />
        </span>
      )}
    </div>
  );
}
