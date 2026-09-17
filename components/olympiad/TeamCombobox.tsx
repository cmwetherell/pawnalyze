'use client';

import Combobox from '@/components/ui/Combobox';
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
  return (
    <Combobox
      items={teams}
      getKey={t => t.teamId}
      match={matchesTeam}
      onSelect={onSelect}
      placeholder={placeholder}
      keepQuery={keepQuery ? t => t.name : undefined}
      autoFocus={autoFocus}
      className={className}
      renderOption={t => (
        <>
          <Flag code={t.fedCode} size="xs" aria-hidden />
          <span className="truncate flex-1">{t.name}</span>
          <span className="text-[11px] text-[var(--text-muted)] tabular-nums">#{t.teamId} · {t.avgRating}</span>
        </>
      )}
    />
  );
}
