'use client';

import { useMemo, useState } from 'react';

import { MatchRow } from '@/components/chess/MatchRow';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/Input';
import { LiveDot } from '@/components/ui/LiveDot';
import { formatPct } from '@/lib/format';
import { formatMatchScore, sortMatchesForPicker } from '@/lib/olympiad/standings';
import type { DerivedStanding, Match, RoundOdds, Run, Team, TeamOdds } from '@/lib/olympiad/types';
import { matchResult, matchSegments, matchSides } from './matchSides';
import { matchHasTeam, toProbs } from './teams';

export interface ApplyResults { count: number; onApply: () => void; applied: boolean }

interface RoundResultsProps {
  run: Run;
  matches: Match[];
  teamsById: Map<number, Team>;
  standings: Map<number, DerivedStanding>;
  odds: Map<number, TeamOdds>;
  /** Latest round with any final or live match, or null. */
  resultsRound: number | null;
  /** Model odds for the next round, used when nothing has started yet. */
  roundOdds: RoundOdds | null;
  nextRound: number;
  onSelect: (teamId: number) => void;
  applyResults: ApplyResults | null;
}

const PAGE = 16;

/** One round, every match: results, or the pairings with the model's odds before it starts. */
export function RoundResults({ run, matches, teamsById, standings, odds, resultsRound, roundOdds, nextRound, onSelect, applyResults }: RoundResultsProps) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const round = resultsRound ?? (matches.some(m => m.round === nextRound) ? nextRound : null);
  const preview = resultsRound === null;
  const all = useMemo(
    () => sortMatchesForPicker(matches.filter(m => m.round === round && m.team2Id !== null), standings, teamsById),
    [matches, round, standings, teamsById],
  );

  if (round === null) return <EmptyState level={3} title={`Round ${nextRound} has no pairings yet`} body={`Pairings for round ${nextRound} haven’t been published yet.`} />;

  const rows = all.filter(m => matchHasTeam(m, teamsById, query));
  const finals = all.filter(m => m.status === 'final').length;
  const lives = all.filter(m => m.status === 'live').length;
  const projected = all.length > 0 && all.every(m => m.projected);
  const left = rows.length - limit;
  const meta = (t: Team) => {
    const gold = odds.get(t.teamId)?.pGold ?? 0;
    return `#${t.teamId}${gold >= 0.001 ? `, gold ${formatPct(gold)}` : ''}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {!preview && round > run.roundsCompleted && (
        <Callout
          icon="info"
          action={applyResults && applyResults.count > 0 && (
            <Button size="sm" onClick={applyResults.onApply} disabled={applyResults.applied}>
              {applyResults.applied ? 'Results applied' : `Apply ${applyResults.count} result${applyResults.count === 1 ? '' : 's'} as a scenario`}
            </Button>
          )}
        >
          <p>Medal odds still reflect round {run.roundsCompleted}; the next simulation run will fold these results in.</p>
        </Callout>
      )}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="flex items-center gap-2 type-small text-ink-2">
          {preview ? `${projected ? 'Projected pairings' : 'Pairings'} with model win odds` : `${finals} of ${all.length} matches final`}
          {lives > 0 && <LiveDot label={`${lives} in play`} />}
        </p>
        <SearchInput
          className="w-full sm:w-64" placeholder="Find a team" aria-label="Filter matches by team"
          value={query} onChange={e => { setQuery(e.target.value); setLimit(PAGE); }} onClear={() => setQuery('')}
        />
      </div>
      {rows.length === 0 && <EmptyState level={3} title="No match with that team" />}
      <ul className="grid gap-x-12 border-t border-line lg:grid-cols-2">
        {rows.slice(0, limit).map(m => {
          const home = teamsById.get(m.team1Id);
          const away = m.team2Id !== null ? teamsById.get(m.team2Id) : undefined;
          if (!home || !away) return null;
          const p = preview && roundOdds?.round === round ? toProbs(roundOdds.teams[home.teamId]) : null;
          return (
            <li key={m.boardNo}>
              <MatchRow
                {...matchSides(m, home, away, meta, onSelect)}
                result={preview ? undefined : m.status === 'final' ? matchResult(m) : m.status === 'live'
                  ? <LiveDot label={m.team1Score !== null && m.team2Score !== null ? formatMatchScore(m.team1Score, m.team2Score) : 'live'} />
                  : 'not started'}
                probs={p ? matchSegments(p, home, away) : undefined}
              />
            </li>
          );
        })}
      </ul>
      {left > 0 && <div><Button size="sm" onClick={() => setLimit(l => l + PAGE)}>Show {Math.min(PAGE, left)} more of {rows.length}</Button></div>}
    </div>
  );
}
