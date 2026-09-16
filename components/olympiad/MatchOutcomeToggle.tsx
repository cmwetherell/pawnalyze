'use client';

import type { Outcome } from '@/lib/olympiad/types';

interface MatchOutcomeToggleProps {
  selected: Outcome | null;
  onChange: (outcome: Outcome | null) => void;
  /** Accessible names, e.g. "United States wins" */
  labels?: { w: string; d: string; l: string };
  disabled?: boolean;
  compact?: boolean;
}

export default function MatchOutcomeToggle({ selected, onChange, labels, disabled, compact }: MatchOutcomeToggleProps) {
  const handle = (value: Outcome) => {
    if (disabled) return;
    onChange(selected === value ? null : value);
  };

  const base = `flex-1 flex items-center justify-center font-bold transition-all duration-150 select-none ${
    compact ? 'h-7 text-[11px]' : 'h-8 text-xs'
  } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`;
  const idle = 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-secondary)]';

  return (
    <div
      className={`inline-flex rounded-lg overflow-hidden shrink-0 bg-[var(--bg-surface-1)] border border-[var(--border)] ${
        compact ? 'w-[84px]' : 'w-[96px] sm:w-[108px]'
      }`}
      role="group"
    >
      <button
        type="button"
        onClick={() => handle('w')}
        className={`${base} rounded-l-md ${selected === 'w' ? 'bg-emerald-500/20 text-emerald-500' : idle}`}
        title={labels?.w ?? 'Win'}
        aria-label={labels?.w ?? 'Win'}
        aria-pressed={selected === 'w'}
      >
        W
      </button>
      <button
        type="button"
        onClick={() => handle('d')}
        className={`${base} border-x border-[var(--border)] ${selected === 'd' ? 'bg-chess-gold/20 text-chess-gold' : idle}`}
        title={labels?.d ?? 'Draw'}
        aria-label={labels?.d ?? 'Draw'}
        aria-pressed={selected === 'd'}
      >
        D
      </button>
      <button
        type="button"
        onClick={() => handle('l')}
        className={`${base} rounded-r-md ${selected === 'l' ? 'bg-rose-500/20 text-rose-400' : idle}`}
        title={labels?.l ?? 'Loss'}
        aria-label={labels?.l ?? 'Loss'}
        aria-pressed={selected === 'l'}
      >
        L
      </button>
    </div>
  );
}
