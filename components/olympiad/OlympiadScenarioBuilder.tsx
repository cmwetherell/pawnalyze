'use client';

import { useMemo, useState } from 'react';

import { MatchRow } from '@/components/chess/MatchRow';
import { PieceDot } from '@/components/chess/PieceDot';
import { ScenarioPanel, type ScenarioRound } from '@/components/chess/ScenarioPanel';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Flag } from '@/components/ui/Flag';
import { SearchInput } from '@/components/ui/Input';
import { LiveDot } from '@/components/ui/LiveDot';
import { PickToggle } from '@/components/ui/PickToggle';
import { Row, Rows } from '@/components/ui/Rows';
import { Segmented } from '@/components/ui/Segmented';
import { MAX_PICKS } from '@/lib/olympiad/config';
import { outcomeFor, pickKey } from '@/lib/olympiad/filters';
import { allRounds, firstOpenRound, roundState, type RoundState } from '@/lib/olympiad/rounds';
import { formatMatchScore, sortMatchesForPicker, teamRoundHistory } from '@/lib/olympiad/standings';
import type { DerivedStanding, Match, Outcome, Pick, RoundOdds, Run, Team } from '@/lib/olympiad/types';
import { CompletedRoundList } from './CompletedRoundList';
import { matchPicks, matchResult, matchSegments, matchSides, teamPicks } from './matchSides';
import type { ApplyResults } from './RoundResults';
import { TeamCombobox } from './TeamCombobox';
import { matchHasTeam, shortTeamName, toProbs, type WinProbs } from './teams';

export interface ScenarioBuilderProps {
  run: Run;
  /** Participants only. */
  teams: Team[];
  teamsById: Map<number, Team>;
  matches: Match[];
  standings: Map<number, DerivedStanding>;
  picks: Map<string, Pick>;
  onSetPick: (round: number, teamId: number, outcome: Outcome | null) => void;
  onSimulate: () => void;
  onReset: () => void;
  loading: boolean;
  dirty: boolean;
  /** Model win, draw and loss for the next round, baseline or under the scenario. */
  roundOdds: RoundOdds | null;
  applyResults: ApplyResults | null;
  /** Inside the phone sheet, which has the title, the buttons and the scrolling. */
  bare?: boolean;
}

const INITIAL_MATCHES = 12;
const MORE_MATCHES = 20;
type SortMode = 'strength' | 'closest';
type View = 'round' | 'team';

const STATE: Record<RoundState, ScenarioRound['state']> = { complete: 'simulated', played: 'played', paired: 'pairings', projected: 'projected', unpaired: 'unpaired' };

/** What the Simulate button says, and whether it can be pressed. */
export function simulateState(picks: number, dirty: boolean, loading: boolean): { label: string; disabled: boolean } {
  return {
    label: loading ? 'Simulating' : picks === 0 ? 'Pick a result to simulate' : dirty ? `Simulate ${picks} pick${picks === 1 ? '' : 's'}` : 'Up to date',
    disabled: !loading && !(dirty && picks > 0),
  };
}

/** "3 of 30 picks, not yet simulated" */
export function PickNote({ picks, dirty }: { picks: number; dirty: boolean }) {
  return <p aria-live="polite">{picks > 0 && `${picks} of ${MAX_PICKS} picks, ${dirty ? 'not yet simulated' : 'simulated'}`}</p>;
}

export function OlympiadScenarioBuilder({
  run, teams, teamsById, matches, standings, picks, onSetPick, onSimulate, onReset, loading, dirty, roundOdds, applyResults, bare = false,
}: ScenarioBuilderProps) {
  const [view, setView] = useState<View>('round');
  const [round, setRound] = useState<number>(() => firstOpenRound(run) ?? 1);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(INITIAL_MATCHES);
  const [sortMode, setSortMode] = useState<SortMode>('strength');
  const [pathTeam, setPathTeam] = useState<Team | null>(null);

  const states = useMemo(() => new Map(allRounds().map(r => [r, roundState(r, run, matches)])), [run, matches]);
  const state = states.get(round) ?? 'unpaired';
  const anyPlayed = useMemo(() => matches.some(m => m.status === 'final'), [matches]);
  const oddsHere = roundOdds?.round === round ? roundOdds : null;
  const probsFor = (m: Match): WinProbs | null => (roundOdds?.round === m.round ? toProbs(roundOdds.teams[m.team1Id]) : null);

  const all = matches.filter(m => m.round === round);
  const gap = (m: Match) => { const p = probsFor(m); return p ? Math.abs(p.w - p.l) : 2; };
  const byStrength = sortMatchesForPicker(all, standings, teamsById);
  const sorted = (sortMode === 'closest' && oddsHere ? [...byStrength].sort((a, b) => gap(a) - gap(b)) : byStrength).filter(m => matchHasTeam(m, teamsById, query));
  const left = sorted.length - limit;

  const rounds = allRounds().map((r): ScenarioRound => ({
    key: String(r), label: String(r), state: STATE[states.get(r) ?? 'unpaired'],
    dot: matches.some(m => m.round === r && m.status === 'live') ? 'live' : [...picks.values()].some(p => p.round === r) ? 'pick' : null,
  }));
  const goTo = (r: number) => { setRound(r); setLimit(INITIAL_MATCHES); setQuery(''); };

  const meta = (t: Team) => [`#${t.teamId}`, t.avgRating, ...(anyPlayed ? [`${standings.get(t.teamId)?.mp ?? 0} MP`] : [])].join(', ');
  const search = (
    <SearchInput
      className="basis-36" aria-label="Filter matches by team" placeholder="Find team" value={query}
      onChange={e => { setQuery(e.target.value); setLimit(INITIAL_MATCHES); }} onClear={() => setQuery('')}
    />
  );
  const addTeam = (t: Team) => { if (!picks.has(pickKey(round, t.teamId))) onSetPick(round, t.teamId, 'w'); };

  const tools = view === 'team'
    ? <TeamCombobox teams={teams} placeholder="Choose a team" onSelect={setPathTeam} keepQuery />
    : state === 'unpaired' ? <TeamCombobox teams={teams} placeholder="Add a team" onSelect={addTeam} />
    : state === 'paired' || state === 'projected' ? (
      <>
        {search}
        <Segmented
          size="sm" role="tablist" ariaLabel="Sort matches" value={oddsHere ? sortMode : 'strength'} onChange={m => { setSortMode(m); setLimit(INITIAL_MATCHES); }}
          items={[{ value: 'strength', label: anyPlayed ? 'Top boards' : 'Top seeds' }, { value: 'closest', label: 'Closest', disabled: !oddsHere }]}
        />
      </>
    ) : search;

  const matchList = (pickable: boolean) => (
    <>
      <ul>
        {sorted.slice(0, limit).map(m => {
          const home = teamsById.get(m.team1Id);
          const away = m.team2Id !== null ? teamsById.get(m.team2Id) ?? null : null;
          if (!home) return null;
          const locked = !pickable || m.status === 'final';
          const pick = locked ? null : outcomeFor(picks, m.round, m.team1Id, matches);
          const p = probsFor(m);
          const open = !locked && away !== null;
          return (
            <li key={m.boardNo}>
              <MatchRow
                {...matchSides(m, home, away, meta, undefined, pick)}
                legend={away ? `${home.name} against ${away.name}` : undefined}
                result={away === null ? 'bye' : m.status === 'final' ? matchResult(m) : undefined}
                options={open ? matchPicks(home, away, p) : undefined} pick={pick} onPick={open ? o => onSetPick(m.round, m.team1Id, o) : undefined}
                probs={open && p ? matchSegments(p, home, away) : undefined}
                status={m.projected ? 'Projected pairing'
                  : m.status === 'live' ? <span className="inline-flex items-center gap-2"><LiveDot label="In progress" />{formatMatchScore(m.team1Score, m.team2Score)}. Match {m.boardNo}</span>
                  : m.status === 'final' ? `Final, not yet in the simulations. Match ${m.boardNo}`
                  : undefined}
              />
            </li>
          );
        })}
      </ul>
      {sorted.length === 0 && <p className="py-4 type-small text-ink-3">No match with that team in this round.</p>}
      {left > 0 && <Button size="sm" full variant="quiet" className="mt-2" onClick={() => setLimit(l => l + MORE_MATCHES)}>Show {Math.min(MORE_MATCHES, left)} more of {sorted.length}</Button>}
    </>
  );

  const pathPicks = [...picks.values()].filter(p => p.round === round).sort((a, b) => a.teamId - b.teamId);
  const history = pathTeam ? teamRoundHistory(matches, pathTeam.teamId) : [];

  const body = view === 'team' ? (
    pathTeam ? (
      <>
        <div className="flex items-center gap-3 py-2">
          <Flag code={pathTeam.fedCode} size="md" decorative />
          <div className="min-w-0">
            <p className="truncate type-ui text-ink">{pathTeam.name}</p>
            <p className="type-label text-ink-3">Seed #{pathTeam.teamId}, average {pathTeam.avgRating}</p>
          </div>
        </div>
        <Rows label={`${pathTeam.name}, round by round`}>
          {allRounds().map(r => {
            const s = states.get(r) ?? 'unpaired';
            const entry = history.find(h => h.round === r);
            const opp = entry?.opponentId != null ? teamsById.get(entry.opponentId) : null;
            const locked = s === 'complete' || s === 'played' || entry?.status === 'final';
            return (
              <Row
                key={r} size="sm" lead={<span className="type-data text-ink-3">{r}</span>}
                title={opp ? <span className="inline-flex items-center gap-2"><Flag code={opp.fedCode} size="xs" decorative />{shortTeamName(opp.name)}</span> : <span className="text-ink-3">{entry && entry.opponentId === null ? 'Bye' : 'Opponent not known yet'}</span>}
                meta={entry?.projected ? 'projected' : undefined}
                value={locked
                  ? entry ? formatMatchScore(entry.score, entry.oppScore) : '–'
                  : <PickToggle className="w-32" size="sm" legend={`Round ${r}`} options={teamPicks(pathTeam)} value={outcomeFor(picks, r, pathTeam.teamId, matches)} onChange={o => onSetPick(r, pathTeam.teamId, o)} />}
              />
            );
          })}
        </Rows>
      </>
    ) : <p className="py-4 type-small text-ink-2">Choose a team to set its result in each remaining round, for example &ldquo;What if India wins out?&rdquo;</p>
  ) : state === 'complete' ? (
    <CompletedRoundList key={round} round={round} matches={matches} teamsById={teamsById} query={query} />
  ) : state === 'played' ? (
    <>
      <Callout
        className="my-2"
        action={applyResults && applyResults.count > 0 && (
          <Button size="sm" onClick={applyResults.onApply} disabled={applyResults.applied}>
            {applyResults.applied ? 'Results applied as a scenario' : `Apply ${applyResults.count} result${applyResults.count === 1 ? '' : 's'} as a scenario now`}
          </Button>
        )}
      >
        <p className="type-small"><strong>Round {round} has been played.</strong> The medal odds still reflect round {run.roundsCompleted}; the next simulation run will fold these results in.</p>
      </Callout>
      {matchList(false)}
    </>
  ) : state === 'unpaired' ? (
    <>
      <p className="py-2 type-small text-ink-2">Round {round} pairings aren&rsquo;t published yet. Pick how a team does regardless of opponent.</p>
      {pathPicks.length === 0 ? <p className="py-2 type-small text-ink-3">No picks for this round yet.</p> : (
        <Rows label={`Picks for round ${round}`}>
          {pathPicks.map(p => {
            const t = teamsById.get(p.teamId);
            return t && (
              <Row
                key={p.teamId} size="sm" lead={<Flag code={t.fedCode} size="sm" decorative />} title={shortTeamName(t.name)}
                value={<PickToggle className="w-32" size="sm" legend={`Round ${p.round}`} options={teamPicks(t)} value={p.outcome} onChange={o => onSetPick(p.round, p.teamId, o)} />}
              />
            );
          })}
        </Rows>
      )}
    </>
  ) : (
    <>
      {state === 'projected' && (
        <Callout className="my-2"><p className="type-small"><strong>Projected pairings.</strong> Official round {round} pairings aren&rsquo;t out yet; these come from our Swiss pairing engine and may differ slightly.</p></Callout>
      )}
      <p className="py-2 type-small text-ink-2">
        <strong className="text-ink">Pick the team you think wins</strong>, or = for a drawn match. <span className="whitespace-nowrap"><PieceDot side="white" className="align-[-1px]" /> The first</span> team has White on board 1.
        {oddsHere && ' Percentages are the model’s odds.'}
      </p>
      {matchList(true)}
    </>
  );

  const { label, disabled } = simulateState(picks.size, dirty, loading);
  return (
    <ScenarioPanel
      title="Scenario builder" fit bare={bare}
      summary={(
        <>
          <p>Pick winners and see the gold odds shift.</p>
          <Segmented className="mt-3" full size="sm" role="tablist" ariaLabel="Builder view" value={view} onChange={setView} items={[{ value: 'round', label: 'By round' }, { value: 'team', label: 'Team path' }]} />
        </>
      )}
      rounds={view === 'round' ? rounds : []} round={String(round)} onRound={k => goTo(Number(k))}
      tools={<div className="flex flex-wrap gap-2 [&>*]:min-w-0 [&>*]:grow">{tools}</div>} note={picks.size > 0 && <PickNote picks={picks.size} dirty={dirty} />}
      primary={{ label, onClick: onSimulate, disabled, loading }} onReset={picks.size > 0 && !loading ? onReset : undefined}
    >
      {body}
    </ScenarioPanel>
  );
}
