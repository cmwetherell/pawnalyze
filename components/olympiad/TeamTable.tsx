'use client';

import { Fragment, useMemo, useState } from 'react';

import Flag from '@/components/ui/Flag';
import ProbBar from '@/components/ui/ProbBar';
import TeamDetail from './TeamDetail';
import { matchesTeam } from './TeamCombobox';
import { formatRank } from '@/lib/olympiad/odds';
import type { DerivedStanding, Match, OlympiadEvent, Player, Run, Team, TeamOdds } from '@/lib/olympiad/types';

type SortKey = 'pos' | 'seed' | 'name' | 'rating' | 'mp' | 'pGold' | 'pSilver' | 'pBronze' | 'pMedal' | 'pTop10' | 'expRank';

interface TeamTableProps {
  event: OlympiadEvent;
  run: Run;
  teams: Team[];                     // participants
  teamsById: Map<number, Team>;
  players: Player[];
  matches: Match[];
  standings: Map<number, DerivedStanding>;
  odds: Map<number, TeamOdds>;       // current
  baseline: Map<number, TeamOdds>;
  isScenario: boolean;
  filtersKey: string;
  anyPlayed: boolean;
  expandedTeamId: number | null;
  onToggle: (teamId: number) => void;
}

const PAGE = 25;

// `hide` is the Tailwind prefix below which the column is hidden; the left column is ~740px wide on desktop.
const HEADERS: { key: SortKey; label: string; title?: string; className?: string; hide?: 'md' | 'xl' | '2xl' }[] = [
  { key: 'pos', label: 'Pos', title: 'Current standing (unofficial: match points, then game points)', className: 'w-10 text-right' },
  { key: 'name', label: 'Team', className: 'text-left min-w-[140px]' },
  { key: 'rating', label: 'Rtg', title: 'Average rating', className: 'w-12 text-right', hide: 'md' },
  { key: 'mp', label: 'MP', title: 'Match points', className: 'w-12 text-right' },
  { key: 'pGold', label: 'Gold', title: 'Probability of winning the gold medal', className: 'w-36 text-chess-gold' },
  { key: 'pMedal', label: 'Podium', title: 'Probability of any medal', className: 'w-28' },
  { key: 'pTop10', label: 'Top 10', className: 'w-24', hide: '2xl' },
  { key: 'pSilver', label: 'Silver', className: 'w-24', hide: '2xl' },
  { key: 'pBronze', label: 'Bronze', className: 'w-24', hide: '2xl' },
  { key: 'expRank', label: 'Finish', title: 'Expected final position', className: 'w-14 text-right' },
];
const HIDE: Record<'md' | 'xl' | '2xl', string> = { md: 'hidden md:table-cell', xl: 'hidden xl:table-cell', '2xl': 'hidden 2xl:table-cell' };

export default function TeamTable({
  event, run, teams, teamsById, players, matches, standings, odds, baseline, isScenario, filtersKey, anyPlayed,
  expandedTeamId, onToggle,
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
            {isScenario ? 'Scenario odds with change vs. baseline · click a team for details' : 'Click a team for roster, results and finish distribution'}
          </p>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search teams…"
          className="rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-chess-gold/50 w-full sm:w-56"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-y border-[var(--border)] bg-[var(--bg-surface-2)]/60">
              {HEADERS.map(h => (
                <th
                  key={h.key}
                  title={h.title}
                  onClick={() => toggleSort(h.key)}
                  className={`px-2 sm:px-3 py-2 font-semibold cursor-pointer select-none whitespace-nowrap hover:text-[var(--text-secondary)] ${h.className ?? ''} ${h.hide ? HIDE[h.hide] : ''} ${
                    (h.key === 'mp' || h.key === 'pos') && !anyPlayed ? 'hidden' : ''
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
              const expanded = expandedTeamId === t.teamId;
              const expRank = o?.expRank ?? null;
              return (
                <Fragment key={t.teamId}>
                  <tr
                    onClick={() => onToggle(t.teamId)}
                    className={`cursor-pointer border-b border-[var(--border)]/60 transition-colors ${
                      expanded ? 'bg-[var(--bg-surface-2)]' : 'hover:bg-[var(--bg-surface-2)]/60'
                    }`}
                  >
                    {anyPlayed && (
                      <td className="px-2 sm:px-3 py-2 text-right tabular-nums text-[var(--text-muted)]">{s?.rank ?? '–'}</td>
                    )}
                    <td className="px-2 sm:px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Flag code={t.fedCode} size="sm" title={t.name} />
                        <span className="font-medium text-[var(--text-primary)] truncate">{t.name}</span>
                        <span className="text-[10px] text-[var(--text-muted)] tabular-nums shrink-0">#{t.teamId}</span>
                      </div>
                    </td>
                    <td className={`px-2 sm:px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] ${HIDE.md}`}>{t.avgRating}</td>
                    {anyPlayed && (
                      <td className="px-2 sm:px-3 py-2 text-right tabular-nums text-[var(--text-primary)] font-semibold">
                        {s?.mp ?? 0}
                        <span className="text-[10px] text-[var(--text-muted)] font-normal">/{(s?.played ?? 0) * 2}</span>
                      </td>
                    )}
                    <td className="px-2 sm:px-3 py-2"><ProbBar value={o?.pGold ?? 0} baseline={isScenario ? b?.pGold ?? 0 : null} tint="gold" emphasis /></td>
                    <td className="px-2 sm:px-3 py-2"><ProbBar value={o?.pMedal ?? 0} baseline={isScenario ? b?.pMedal ?? 0 : null} tint="green" /></td>
                    <td className={`px-2 sm:px-3 py-2 ${HIDE['2xl']}`}><ProbBar value={o?.pTop10 ?? 0} baseline={isScenario ? b?.pTop10 ?? 0 : null} tint="neutral" /></td>
                    <td className={`px-2 sm:px-3 py-2 ${HIDE['2xl']}`}><ProbBar value={o?.pSilver ?? 0} baseline={isScenario ? b?.pSilver ?? 0 : null} tint="silver" /></td>
                    <td className={`px-2 sm:px-3 py-2 ${HIDE['2xl']}`}><ProbBar value={o?.pBronze ?? 0} baseline={isScenario ? b?.pBronze ?? 0 : null} tint="bronze" /></td>
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
                  {expanded && (
                    <tr className="bg-[var(--bg-surface-2)]/50 border-b border-[var(--border)]">
                      <td colSpan={HEADERS.length}>
                        <TeamDetail
                          event={event}
                          run={run}
                          team={t}
                          players={players.filter(p => p.teamId === t.teamId)}
                          matches={matches}
                          teamsById={teamsById}
                          filtersKey={filtersKey}
                          odds={o ?? null}
                          baseline={b ?? null}
                          isScenario={isScenario}
                          expMp={o?.expMp ?? b?.expMp ?? null}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
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
