'use client';

import { useSyncExternalStore } from 'react';

import { N_ROUNDS } from '@/lib/olympiad/config';
import type { Run } from '@/lib/olympiad/types';

interface StatusBarProps {
  run: Run;
  participants: number;
  lastFinalRound: number;
  anyLive: boolean;
}

function subscribeMinute(cb: () => void) {
  const id = setInterval(cb, 60000);
  return () => clearInterval(id);
}
function minuteSnapshot(): number {
  return Math.floor(Date.now() / 60000) * 60000;
}

function relative(iso: string, now: number): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

export default function StatusBar({ run, participants, lastFinalRound, anyLive }: StatusBarProps) {
  const now = useSyncExternalStore(subscribeMinute, minuteSnapshot, () => null);

  const tiles: { label: string; value: string; sub?: string; live?: boolean }[] = [
    { label: 'Teams', value: participants.toLocaleString(), sub: 'playing' },
    {
      label: 'Rounds',
      value: `${lastFinalRound} / ${N_ROUNDS}`,
      sub: anyLive ? 'in progress' : lastFinalRound === 0 ? 'starts Sept 16' : 'complete',
      live: anyLive,
    },
    { label: 'Simulations', value: run.nSims.toLocaleString(), sub: `after round ${run.roundsCompleted}` },
    { label: 'Updated', value: now ? relative(run.createdAt, now) : '—', sub: new Date(run.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tiles.map(t => (
        <div key={t.label} className="surface-card px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            {t.live && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />}
            {t.label}
          </div>
          <div className="text-lg font-heading text-[var(--text-primary)] tabular-nums leading-tight mt-0.5">{t.value}</div>
          {t.sub && <div className="text-[11px] text-[var(--text-muted)]">{t.sub}</div>}
        </div>
      ))}
    </div>
  );
}
