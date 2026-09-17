'use client';

import { useMemo, useState } from 'react';

import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import { shortTeamName } from './MatchPickerCard';
import { matchesTeam } from './TeamCombobox';
import { formatMatchScore, outcomeFromScores, sortMatchesForPicker } from '@/lib/olympiad/standings';
import type { DerivedStanding, Match, RoundOdds, Run, Team, TeamOdds } from '@/lib/olympiad/types';

interface RoundResultsProps {
  run: Run;
  matches: Match[];
  teamsById: Map<number, Team>;
  standings: Map<number, DerivedStanding>;
  odds: Map<number, TeamOdds>;
  /** Latest round with any final/live match, or null */
  resultsRound: number | null;
  /** Baseline model odds for the next round (used when nothing has started yet) */
  roundOdds: RoundOdds | null;
  nextRound: number;
  onSelect?: (teamId: number) => void;
  applyResults?: { count: number; onApply: () => void; applied: boolean } | null;
}

const PAGE = 16;

function Side({ team, gold, align, onSelect, won }: {
  team: Team; gold: number | undefined; align: 'left' | 'right'; onSelect?: (id: number) => void; won: boolean;
}) {
  const right = align === 'right';
  return (
    <button
      type="button"
      onClick={() => onSelect?.(team.teamId)}
      className={`flex items-center gap-2 min-w-0 flex-1 rounded-md px-1 py-0.5 hover:bg-[var(--bg-surface-3)] transition-colors ${right ? 'flex-row-reverse text-right' : 'text-left'}`}
      title={`${team.name} · seed #${team.teamId}${gold !== undefined ? ` · gold ${formatPct(gold)}` : ''}`}
    >
      <Flag code={team.fedCode} size="sm" className="!ring-0" />
      <span className="min-w-0">
        <span className={`block text-sm truncate ${won ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{shortTeamName(team.name)}</span>
        {gold !== undefined && gold >= 0.001 && (
          <span className="block text-[10px] text-gold-ink tabular-nums">gold {formatPct(gold)}</span>
        )}
      </span>
    </button>
  );
}

export default function RoundResults({
  run, matches, teamsById, standings, odds, resultsRound, roundOdds, nextRound, onSelect, applyResults,
}: RoundResultsProps) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const showingRound = resultsRound ?? (matches.some(m => m.round === nextRound) ? nextRound : null);
  const isPreview = resultsRound === null && showingRound !== null;

  const rows = useMemo(() => {
    if (showingRound === null) return [];
    const inRound = matches.filter(m => m.round === showingRound && m.team2Id !== null);
    const sorted = sortMatchesForPicker(inRound, standings, teamsById);
    if (!query.trim()) return sorted;
    return sorted.filter(m => {
      const t1 = teamsById.get(m.team1Id);
      const t2 = m.team2Id !== null ? teamsById.get(m.team2Id) : undefined;
      return (t1 && matchesTeam(t1, query)) || (t2 && matchesTeam(t2, query));
    });
  }, [matches, showingRound, standings, teamsById, query]);

  if (showingRound === null) {
    return <p className="text-sm text-[var(--text-muted)]">Pairings for round {nextRound} haven&apos;t been published yet.</p>;
  }

  const all = matches.filter(m => m.round === showingRound && m.team2Id !== null);
  const finals = all.filter(m => m.status === 'final').length;
  const lives = all.filter(m => m.status === 'live').length;
  const projected = all.length > 0 && all.every(m => m.projected);
  const beyondRun = showingRound > run.roundsCompleted;

  const prob = (teamId: number) => {
    const c = roundOdds && roundOdds.round === showingRound ? roundOdds.teams[teamId] : undefined;
    if (!c) return null;
    const n = Math.max(1, c.w + c.d + c.l);
    return { w: c.w / n, d: c.d / n, l: c.l / n };
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-secondary)]">Round {showingRound}</span>
          {isPreview ? (
            <> · {projected ? 'projected pairings' : 'pairings'} with model win odds</>
          ) : (
            <> · {finals} of {all.length} final{lives > 0 && <span className="text-red-400"> · {lives} in play</span>}</>
          )}
          {!isPreview && beyondRun && (
            <span className="block mt-0.5">Medal odds still reflect round {run.roundsCompleted}; the next simulation run will fold these results in.</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {applyResults && applyResults.count > 0 && (
            <button
              type="button"
              onClick={applyResults.onApply}
              disabled={applyResults.applied}
              className="h-8 px-3 rounded-md text-xs font-semibold bg-chess-gold text-chess-dark hover:bg-chess-gold-light disabled:opacity-50 disabled:cursor-default"
            >
              {applyResults.applied ? 'Results applied' : `Apply ${applyResults.count} result${applyResults.count === 1 ? '' : 's'} as a scenario`}
            </button>
          )}
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setLimit(PAGE); }}
            placeholder="Find a team…"
            aria-label="Filter matches by team"
            className="h-8 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-40"
          />
        </div>
      </div>

      <ul className="divide-y divide-[var(--border)]/60">
        {rows.slice(0, limit).map(m => {
          const t1 = teamsById.get(m.team1Id);
          const t2 = m.team2Id !== null ? teamsById.get(m.team2Id) : undefined;
          if (!t1 || !t2) return null;
          const o = outcomeFromScores(m.team1Score, m.team2Score);
          const p = isPreview ? prob(m.team1Id) : null;
          return (
            <li key={m.boardNo} className="flex items-center gap-2 py-1.5">
              <Side team={t1} gold={odds.get(t1.teamId)?.pGold} align="right" onSelect={onSelect} won={o === 'w'} />
              <div className="shrink-0 w-24 text-center">
                {isPreview ? (
                  p ? (
                    <div>
                      <div className="text-[11px] tabular-nums text-[var(--text-secondary)]">
                        <span className={p.w >= p.l ? 'text-emerald-500 font-semibold' : ''}>{Math.round(p.w * 100)}</span>
                        <span className="text-[var(--text-muted)]"> · {Math.round(p.d * 100)} · </span>
                        <span className={p.l > p.w ? 'text-emerald-500 font-semibold' : ''}>{Math.round(p.l * 100)}</span>
                      </div>
                      <div className="mt-0.5 h-1 rounded-full overflow-hidden flex bg-[var(--bg-surface-3)]">
                        <div className="h-full bg-emerald-500" style={{ width: `${p.w * 100}%` }} />
                        <div className="h-full bg-chess-gold" style={{ width: `${p.d * 100}%` }} />
                        <div className="h-full bg-rose-400" style={{ width: `${p.l * 100}%` }} />
                      </div>
                    </div>
                  ) : <span className="text-[10px] text-[var(--text-muted)]">vs</span>
                ) : m.status === 'final' ? (
                  <span className="font-mono text-sm text-[var(--text-primary)]">{formatMatchScore(m.team1Score, m.team2Score)}</span>
                ) : m.status === 'live' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />
                    {m.team1Score !== null && m.team2Score !== null ? formatMatchScore(m.team1Score, m.team2Score) : 'live'}
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)]">not started</span>
                )}
              </div>
              <Side team={t2} gold={odds.get(t2.teamId)?.pGold} align="left" onSelect={onSelect} won={o === 'l'} />
            </li>
          );
        })}
      </ul>
      {rows.length > limit && (
        <button type="button" onClick={() => setLimit(l => l + PAGE)} className="w-full text-xs text-gold-ink hover:text-chess-gold-light py-2">
          Show {Math.min(PAGE, rows.length - limit)} more of {rows.length}
        </button>
      )}
    </div>
  );
}
