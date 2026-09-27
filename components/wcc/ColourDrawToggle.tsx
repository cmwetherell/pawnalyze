'use client';

import type { PlayerId } from '@/lib/wcc/types';
import { formatPct, type Players } from './ui';

interface Props {
  value: PlayerId | null;
  onChange: (v: PlayerId | null) => void;
  players: Players;
  /** P(Gukesh wins) for each Game-1 White, from the exact computation. */
  byColour: Record<'1' | '2', number>;
}

/** Before the 22 Nov draw: who has White in game 1 (and so in every odd game)? */
export default function ColourDrawToggle({ value, onChange, players, byColour }: Props) {
  const opts: { v: PlayerId | null; label: string; hint: string }[] = [
    { v: null, label: 'Not drawn yet', hint: '50/50 average' },
    { v: 1, label: players[1].shortName, hint: `${players[1].shortName} ${formatPct(byColour['1'])}` },
    { v: 2, label: players[2].shortName, hint: `${players[1].shortName} ${formatPct(byColour['2'])}` },
  ];
  return (
    <fieldset className="min-w-0">
      <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">
        White in game 1
      </legend>
      <div className="inline-flex flex-wrap rounded-lg bg-[var(--bg-surface-2)] p-1 gap-1">
        {opts.map(o => {
          const active = value === o.v;
          return (
            <button
              key={String(o.v)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.v)}
              className={`min-h-[44px] rounded-md px-3 text-left transition-colors ${
                active ? 'bg-[var(--bg-surface-1)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                {o.v !== null && <span aria-hidden className="w-2.5 h-2.5 rounded-full bg-white ring-1 ring-black/40" />}
                {o.label}
              </span>
              <span className="block text-[10px] tabular-nums text-[var(--text-muted)]">{o.hint}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
