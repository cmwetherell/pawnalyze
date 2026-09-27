import type { ReactNode } from 'react';

import { formatPct } from '@/components/ui/ProbBar';
import type { PlayerId } from '@/lib/wcc/types';

export { formatPct };

export const P_COLOR: Record<PlayerId, string> = { 1: 'var(--wcc-p1)', 2: 'var(--wcc-p2)' };
export const DRAW_COLOR = 'var(--wcc-draw)';

export interface DisplayPlayer {
  id: PlayerId;
  name: string;
  shortName: string;
  fedCode: string;
  country: string;
  role: string;
  isChampion: boolean;
  fideId: number;
  ratings: { classical: number; rapid: number; blitz: number };
}
export type Players = Record<PlayerId, DisplayPlayer>;

export function fmtUsd(v: number, compact = true): string {
  if (compact) {
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2).replace(/0$/, '')}M`;
    if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`;
  }
  return `$${Math.round(v).toLocaleString('en-US')}`;
}

/** "about 85 in 100" style phrasing for a probability. */
export function inHundred(p: number): string {
  const n = Math.round(p * 100);
  if (n <= 0) return 'fewer than 1 in 100';
  if (n >= 100) return 'more than 99 in 100';
  return `about ${n} in 100`;
}

export function Section({
  id, eyebrow, title, description, action, children, className = '',
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={`surface-card p-4 sm:p-6 scroll-mt-32 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0 max-w-2xl">
          {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1">{eyebrow}</p>}
          <h2 id={id ? `${id}-title` : undefined} className="font-heading text-xl sm:text-2xl text-[var(--text-primary)] leading-tight">{title}</h2>
          {description && <div className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">{description}</div>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Colour swatch + name: identity never rides on colour alone. */
export function Swatch({ player, className = '' }: { player: PlayerId | 'draw' | 'level'; className?: string }) {
  if (player === 'level') return <span aria-hidden className={`inline-block w-2.5 h-2.5 rounded-sm wcc-hatch ring-1 ring-[var(--wcc-draw)] ${className}`} />;
  const bg = player === 'draw' ? DRAW_COLOR : P_COLOR[player];
  return <span aria-hidden className={`inline-block w-2.5 h-2.5 rounded-sm shrink-0 ${className}`} style={{ background: bg }} />;
}

export function TableFallback({ summary = 'Show as a table', children }: { summary?: string; children: ReactNode }) {
  return (
    <details className="mt-3 text-xs text-[var(--text-muted)]">
      <summary className="cursor-pointer hover:text-[var(--text-secondary)] inline-flex items-center h-8">{summary}</summary>
      <div className="mt-2 overflow-x-auto">{children}</div>
    </details>
  );
}

export const thCls = 'py-1.5 pr-3 font-medium text-left text-[var(--text-muted)] whitespace-nowrap';
export const tdCls = 'py-1.5 pr-3 tabular-nums text-[var(--text-primary)] whitespace-nowrap';

/** "+3.2 pts" chip for a scenario change relative to the baseline. */
export function DeltaChip({ value, base, className = '' }: { value: number; base: number; className?: string }) {
  const d = (value - base) * 100;
  if (Math.abs(d) < 0.05) return null;
  const up = d > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums bg-[var(--bg-surface-3)] text-[var(--text-primary)] ${className}`}>
      <span aria-hidden>{up ? '▲' : '▼'}</span>
      <span className="sr-only">{up ? 'up' : 'down'} </span>
      {Math.abs(d).toFixed(1)} pts
    </span>
  );
}

/** Crown for the reigning champion (gold is reserved for this and the title). */
export function Crown({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 7.5l4.5 3.5L12 4l4.5 7L21 7.5 19 18H5L3 7.5zM5 19.5h14V21H5z" />
    </svg>
  );
}
