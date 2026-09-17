'use client';

import { useEffect, useMemo, useState } from 'react';

import Flag from '@/components/ui/Flag';
import ProbBar from '@/components/ui/ProbBar';
import { matchesTeam } from './TeamCombobox';
import { formatRank } from '@/lib/olympiad/odds';
import type { DerivedStanding, Team, TeamOdds } from '@/lib/olympiad/types';

type SortKey = 'pos' | 'seed' | 'name' | 'rating' | 'mp' | 'pGold' | 'pSilver' | 'pBronze' | 'pMedal' | 'pTop10' | 'expRank';

interface TeamTableProps {
  teams: Team[];                     // participants
  standings: Map<number, DerivedStanding>;
  odds: Map<number, TeamOdds>;       // current
  baseline: Map<number, TeamOdds>;
  isScenario: boolean;
  anyPlayed: boolean;
  selectedTeamId: number | null;
  onSelect: (teamId: number) => void;
  /** Reports the current sorted, filtered order so the parent can offer prev/next navigation. */
  onOrderChange?: (teamIds: number[]) => void;
}

const PAGE = 25;

// The table is fixed-layout at 100% width and never scrolls horizontally: columns appear by breakpoint.
// `hide` is the Tailwind prefix below which the column is hidden; the team column absorbs the remaining width.
type Hide = 'sm' | 'md' | 'xl' | '2xl';
const HEADERS: { key: SortKey; label: string; title?: string; className?: string; hide?: Hide }[] = [
  { key: 'pos', label: 'Pos', title: 'Current standing (unofficial: match points, then game points)', className: 'w-10 text-right', hide: 'md' },
  { key: 'name', label: 'Team', className: 'text-left' },
  { key: 'rating', label: 'Rtg', title: 'Average rating', className: 'w-12 text-right', hide: 'xl' },
  { key: 'mp', label: 'MP', title: 'Match points', className: 'w-12 text-right', hide: 'md' },
  { key: 'pGold', label: 'Gold', title: 'Probability of winning the gold medal', className: 'w-[7.5rem] sm:w-36 text-chess-gold' },
  { key: 'pMedal', label: 'Podium', title: 'Probability of any medal', className: 'w-32', hide: 'sm' },
  { key: 'expRank', label: 'Finish', title: 'Expected final position', className: 'w-14 text-right' },
];
const HIDE: Record<Hide, string> = {
  sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', xl: 'hidden xl:table-cell', '2xl': 'hidden 2xl:table-cell',
};

export default function TeamTable({
  teams, standings, odds, baseline, isScenario, anyPlayed,
  selectedTeamId, onSelect, onOrderChange,
}: TeamTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('pGold');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const value = (t: Team, k: SortKey): number | string => {
      const o = odds.get(t.teamId);
      const s = standings.get(t.teamId);
      switch (k) {
        case 'pos': return s?.rank ?? 9999;
        case 'seed': return t.teamId;
        case 'name': return t.name;
        case 'rating': return t.avgRating;
        case 'mp': return s?.mp ?? 0;
        case 'pGold': return o?.pGold ?? 0;
        case 'pSilver': return o?.pSilver ?? 0;
        case 'pBronze': return o?.pBronze ?? 0;
        case 'pMedal': return o?.pMedal ?? 0;
        case 'pTop10': return o?.pTop10 ?? 0;
        case 'expRank': return o?.expRank ?? baseline.get(t.teamId)?.expRank ?? 9999;
      }
    };
    const filtered = query.trim() ? teams.filter(t => matchesTeam(t, query)) : teams;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = value(a, sortKey);
      const vb = value(b, sortKey);
      let cmp = typeof va === 'string' && typeof vb === 'string' ? va.localeCompare(vb) : (va as number) - (vb as number);
      if (cmp === 0) {
        const oa = odds.get(a.teamId)?.pGold ?? 0;
        const ob = odds.get(b.teamId)?.pGold ?? 0;
        cmp = (ob - oa) * dir; // keep gold odds as the secondary order regardless of direction
        if (cmp === 0) cmp = (a.teamId - b.teamId) * dir;
      }
      return cmp * dir;
    });
  }, [teams, odds, standings, baseline, query, sortKey, sortDir]);

  const visible = showAll || query.trim() ? rows : rows.slice(0, PAGE);

  useEffect(() => {
    onOrderChange?.(rows.map(t => t.teamId));
  }, [rows, onOrderChange]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'pos' || key === 'seed' || key === 'expRank' ? 'asc' : 'desc');
    }
  };

  const arrow = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-3">
        <div>
          <h2 className="text-xl font-heading text-[var(--text-primary)]">Team Odds</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {isScenario ? 'Scenario odds with change vs. baseline · select a team to open its spotlight' : 'Select a team to open its spotlight: roster, results, finish odds, likely opponents'}
          </p>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search teams…"
          className="rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-chess-gold/50 w-full sm:w-56"
        />
      </div>

      <div>
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-y border-[var(--border)] bg-[var(--bg-surface-2)]/60">
              {HEADERS.map(h => (
                <th
                  key={h.key}
                  title={h.title}
                  onClick={() => toggleSort(h.key)}
                  className={`px-2 sm:px-3 py-2 font-semibold cursor-pointer select-none whitespace-nowrap hover:text-[var(--text-secondary)] ${h.className ?? ''} ${
                    (h.key === 'mp' || h.key === 'pos') && !anyPlayed ? 'hidden' : h.hide ? HIDE[h.hide] : ''
                  }`}
                >
                  {h.label}{arrow(h.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(t => {
              const o = odds.get(t.teamId);
              const b = baseline.get(t.teamId);
              const s = standings.get(t.teamId);
              const selected = selectedTeamId === t.teamId;
              const expRank = o?.expRank ?? null;
              return (
                <tr
                  key={t.teamId}
                  onClick={() => onSelect(t.teamId)}
                  aria-selected={selected}
                  className={`cursor-pointer border-b border-[var(--border)]/60 transition-colors ${
                    selected ? 'bg-chess-gold/10 ring-1 ring-inset ring-chess-gold/40' : 'hover:bg-[var(--bg-surface-2)]/60'
                  }`}
                >
                  {anyPlayed && (
                    <td className={`px-2 sm:px-3 py-2 text-right tabular-nums text-[var(--text-muted)] ${HIDE.md}`}>{s?.rank ?? '–'}</td>
                  )}
                  <td className="px-2 sm:px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Flag code={t.fedCode} size="sm" title={t.name} />
                      <span className={`font-medium truncate ${selected ? 'text-chess-gold' : 'text-[var(--text-primary)]'}`}>{t.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] tabular-nums shrink-0 hidden sm:inline">#{t.teamId}</span>
                    </div>
                  </td>
                  <td className={`px-2 sm:px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] ${HIDE.xl}`}>{t.avgRating}</td>
                  {anyPlayed && (
                    <td className={`px-2 sm:px-3 py-2 text-right tabular-nums text-[var(--text-primary)] font-semibold ${HIDE.md}`}>
                      {s?.mp ?? 0}
                      <span className="text-[10px] text-[var(--text-muted)] font-normal">/{(s?.played ?? 0) * 2}</span>
                    </td>
                  )}
                  <td className="px-2 sm:px-3 py-2"><ProbBar value={o?.pGold ?? 0} baseline={isScenario ? b?.pGold ?? 0 : null} tint="gold" emphasis /></td>
                  <td className={`px-2 sm:px-3 py-2 ${HIDE.sm}`}><ProbBar value={o?.pMedal ?? 0} baseline={isScenario ? b?.pMedal ?? 0 : null} tint="green" /></td>
                  <td className={`px-2 sm:px-3 py-2 text-right tabular-nums ${isScenario && expRank === null ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}
                      title={isScenario && expRank === null ? 'Baseline value — expected finish is recomputed only for picked teams' : undefined}>
                    {formatRank(expRank ?? b?.expRank ?? null)}
                    {isScenario && expRank !== null && b?.expRank != null && Math.abs(expRank - b.expRank) >= 0.05 && (
                      <span className={`block text-[10px] ${expRank < b.expRank ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {expRank < b.expRank ? '▲' : '▼'} {Math.abs(expRank - b.expRank).toFixed(1)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
        <span>
          {query.trim() ? `${rows.length} match${rows.length === 1 ? '' : 'es'}` : `Showing ${visible.length} of ${rows.length} teams`}
          {isScenario && ' · bars show scenario vs. ghost baseline'}
        </span>
        {!query.trim() && rows.length > PAGE && (
          <button type="button" onClick={() => setShowAll(v => !v)} className="text-chess-gold hover:text-chess-gold-light">
            {showAll ? 'Show top 25' : `Show all ${rows.length}`}
          </button>
        )}
      </div>
    </div>
  );
}
