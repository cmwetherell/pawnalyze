'use client';

import { useMemo, useState } from 'react';

import Flag from '@/components/ui/Flag';
import { formatMatchScore, outcomeFromScores } from '@/lib/olympiad/standings';
import type { Match, Team } from '@/lib/olympiad/types';
import { matchesTeam } from './TeamCombobox';

interface CompletedRoundListProps {
  round: number;
  matches: Match[];
  teamsById: Map<number, Team>;
}

const PAGE = 20;

export default function CompletedRoundList({ round, matches, teamsById }: CompletedRoundListProps) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const rows = useMemo(() => {
    const inRound = matches.filter(m => m.round === round).sort((a, b) => a.boardNo - b.boardNo);
    if (!query.trim()) return inRound;
    return inRound.filter(m => {
      const t1 = teamsById.get(m.team1Id);
      const t2 = m.team2Id !== null ? teamsById.get(m.team2Id) : undefined;
      return (t1 && matchesTeam(t1, query)) || (t2 && matchesTeam(t2, query));
    });
  }, [matches, round, query, teamsById]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--text-muted)]">
          Round {round} results are baked into every simulation.
        </p>
      </div>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setLimit(PAGE); }}
        placeholder="Filter by team…"
        className="w-full rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-chess-gold/50"
      />
      <ul className="space-y-0.5">
        {rows.slice(0, limit).map(m => {
          const t1 = teamsById.get(m.team1Id);
          const t2 = m.team2Id !== null ? teamsById.get(m.team2Id) : null;
          const o = outcomeFromScores(m.team1Score, m.team2Score);
          return (
            <li key={m.boardNo} className="flex items-center text-xs py-1 text-[var(--text-muted)] gap-1.5">
              <span className="w-6 text-[10px] tabular-nums text-right shrink-0">{m.boardNo}</span>
              <span className={`flex-1 flex items-center justify-end gap-1.5 min-w-0 ${o === 'w' ? 'text-chess-gold font-semibold' : ''}`}>
                <span className="truncate">{t1?.name ?? m.team1Id}</span>
                {t1 && <Flag code={t1.fedCode} size="xs" />}
              </span>
              <span className="px-1.5 font-mono text-[11px] text-[var(--text-secondary)] shrink-0 w-14 text-center">
                {t2 ? formatMatchScore(m.team1Score, m.team2Score) : 'bye'}
              </span>
              <span className={`flex-1 flex items-center gap-1.5 min-w-0 ${o === 'l' ? 'text-chess-gold font-semibold' : ''}`}>
                {t2 && <Flag code={t2.fedCode} size="xs" />}
                <span className="truncate">{t2?.name ?? ''}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setLimit(l => l + PAGE)}
          className="w-full text-xs text-chess-gold hover:text-chess-gold-light py-1.5"
        >
          Show {Math.min(PAGE, rows.length - limit)} more of {rows.length}
        </button>
      )}
    </div>
  );
}
