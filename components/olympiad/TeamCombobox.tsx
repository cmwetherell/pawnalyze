'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

import Flag from '@/components/ui/Flag';
import type { Team } from '@/lib/olympiad/types';

interface TeamComboboxProps {
  teams: Team[];
  onSelect: (team: Team) => void;
  placeholder?: string;
  /** Keep the query after selecting (default clears it). */
  keepQuery?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function matchesTeam(team: Team, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return team.name.toLowerCase().includes(q) || team.fedCode.toLowerCase() === q || team.fedCode.toLowerCase().startsWith(q);
}

export default function TeamCombobox({ teams, onSelect, placeholder = 'Search teams…', keepQuery, autoFocus, className = '' }: TeamComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = useMemo(
    () => teams.filter(t => matchesTeam(t, query)).slice(0, 8),
    [teams, query],
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (team: Team) => {
    onSelect(team);
    setOpen(false);
    setQuery(keepQuery ? team.name : '');
    setActive(0);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          value={query}
          autoFocus={autoFocus}
          onChange={e => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); setOpen(true); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); choose(results[active]); }
            else if (e.key === 'Escape') setOpen(false);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border)] pl-8 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && results[active] ? `${listId}-opt-${results[active].teamId}` : undefined}
          aria-autocomplete="list"
        />
      </div>
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg-surface-1)] shadow-lg py-1"
        >
          {results.map((t, i) => (
            <li
              key={t.teamId}
              id={`${listId}-opt-${t.teamId}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={e => { e.preventDefault(); choose(t); }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer ${
                i === active ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <Flag code={t.fedCode} size="xs" />
              <span className="truncate flex-1">{t.name}</span>
              <span className="text-[10px] text-[var(--text-muted)] tabular-nums">#{t.teamId} · {t.avgRating}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
