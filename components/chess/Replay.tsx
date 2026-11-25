'use client';

import type { KeyboardEvent, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ReplayProps {
  /** Names the region and says that the arrow keys work. */
  label: string;
  ply: number;
  last: number;
  onGo: (ply: number) => void;
  onFlip?: () => void;
  board: ReactNode;
  /** Beside the board; under it on a narrow screen. */
  aside?: ReactNode;
  /** Title line: over the board on a narrow screen, on top of the aside beside it. */
  head?: ReactNode;
  /** md: 440px board, in a row of a list. lg: up to 560px, and never taller than the first screen of a page. */
  size?: 'md' | 'lg';
  className?: string;
}

const COLS = {
  md: 'md:grid-cols-[minmax(0,440px)_minmax(11rem,1fr)]',
  lg: 'md:grid-cols-[minmax(0,596px)_minmax(16rem,1fr)] lg:gap-x-12 lg:grid-cols-[clamp(400px,100svh-400px,596px)_minmax(0,1fr)]',
} as const;

/** Every game that can be stepped through: board, what stands beside it, and the keys (arrows, Home, End, f). */
export function Replay({ label, ply, last, onGo, onFlip, board, aside, head, size = 'md', className }: ReplayProps) {
  const onKey = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement;
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    const to = e.key === 'ArrowLeft' ? ply - 1 : e.key === 'ArrowRight' ? ply + 1 : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (to !== null) { e.preventDefault(); onGo(Math.min(Math.max(to, 0), last)); }
    else if (e.key === 'f') onFlip?.();
  };
  const two = aside !== undefined;
  return (
    <div
      tabIndex={0} role="group" aria-label={label} onKeyDown={onKey}
      className={cn('grid min-w-0 grid-cols-1 gap-x-6 gap-y-4 rounded-sm outline-offset-4', two ? COLS[size] : 'max-w-[520px]', two && head && 'md:grid-rows-[auto_1fr]', className)}
    >
      {head && <div className={cn('min-w-0', two && 'md:col-start-2')}>{head}</div>}
      <div className={cn('min-w-0', two && 'md:col-start-1 md:row-span-2 md:row-start-1')}>{board}</div>
      {two && <div className="flex min-w-0 flex-col gap-4 md:col-start-2">{aside}</div>}
    </div>
  );
}
