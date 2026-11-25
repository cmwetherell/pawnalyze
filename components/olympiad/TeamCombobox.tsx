'use client';

import { Combobox } from '@/components/ui/Combobox';
import { Flag } from '@/components/ui/Flag';
import type { Team } from '@/lib/olympiad/types';
import { matchesTeam } from './teams';

interface TeamComboboxProps {
  teams: Team[];
  onSelect: (team: Team) => void;
  placeholder?: string;
  /** Keep the name in the field after selecting (default clears it). */
  keepQuery?: boolean;
}

export function TeamCombobox({ teams, onSelect, placeholder = 'Search teams', keepQuery }: TeamComboboxProps) {
  return (
    <Combobox
      items={teams}
      getKey={t => t.teamId}
      match={matchesTeam}
      onSelect={onSelect}
      placeholder={placeholder}
      keepQuery={keepQuery ? t => t.name : undefined}
      empty="No team matches"
      renderOption={t => (
        <>
          <Flag code={t.fedCode} size="xs" decorative />
          <span className="min-w-0 flex-1 truncate">{t.name}</span>
          <span className="type-label text-ink-3">#{t.teamId}, {t.avgRating}</span>
        </>
      )}
    />
  );
}
