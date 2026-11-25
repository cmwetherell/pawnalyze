'use client';

import { useState } from 'react';

import { MatchRow } from '@/components/chess/MatchRow';
import { Button } from '@/components/ui/Button';
import type { Match, Team } from '@/lib/olympiad/types';
import { matchResult, matchSides } from './matchSides';
import { matchHasTeam } from './teams';

const PAGE = 20;

/** A round that is already in every simulation, by board. */
export function CompletedRoundList({ round, matches, teamsById, query }: { round: number; matches: Match[]; teamsById: Map<number, Team>; query: string }) {
  const [limit, setLimit] = useState(PAGE);
  const rows = matches.filter(m => m.round === round && matchHasTeam(m, teamsById, query)).sort((a, b) => a.boardNo - b.boardNo);
  const left = rows.length - limit;
  return (
    <>
      <p className="py-2 type-small text-ink-2">Round {round} results are part of every simulation.</p>
      <ul>
        {rows.slice(0, limit).map(m => {
          const home = teamsById.get(m.team1Id);
          if (!home) return null;
          const sides = matchSides(m, home, m.team2Id !== null ? teamsById.get(m.team2Id) ?? null : null);
          return <li key={m.boardNo}><MatchRow {...sides} home={{ ...sides.home, meta: `Match ${m.boardNo}` }} result={matchResult(m)} /></li>;
        })}
      </ul>
      {left > 0 && <Button size="sm" full variant="quiet" className="mt-2" onClick={() => setLimit(l => l + PAGE)}>Show {Math.min(PAGE, left)} more of {rows.length}</Button>}
    </>
  );
}
