'use client';

import { useState, type ReactNode } from 'react';

import { BottomBar } from '@/components/layout/BottomBar';
import { Section } from '@/components/layout/Section';
import { Split } from '@/components/layout/Split';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Flag } from '@/components/ui/Flag';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatStrip } from '@/components/ui/StatStrip';
import { formatPct } from '@/lib/format';
import { buildPlayerToneMap, getPlayerFederation, getPlayerName, getPlayerShortName } from '@/lib/playerData';
import { bestOfTheRest, leadersAt, playersAbove, playersBeside, raceHistory, tookTheLead, type RaceHistory } from '@/lib/raceHistory';
import type { EventTable, SimulationRow } from '@/lib/simulations';
import { cn } from '@/lib/utils';
import type { Game } from '@/types';
import { OddsByRound, type OddsEntry, type OddsRound } from './OddsByRound';
import { ScenarioBuilder } from './ScenarioBuilder';
import { isPlayed, pickedWords, pointsWord, scoreOf, withPick, type GameRound } from './rounds';
import { useSimulations } from './useSimulations';

const HERO = 'odds';

interface CandidatesResultsProps {
  eventTable: EventTable;
  rounds: GameRound[];
  initialData?: SimulationRow[];
  /** Stored name, once the event is over. */
  winner?: string;
  /** Between the figures and the results. */
  intro?: ReactNode;
}

const scenarioRows = (rows: SimulationRow[]) => rows.filter(r => r.Round === 'Simulated');
const total = (rows: SimulationRow[]) => rows.reduce((sum, r) => sum + Number(r.win_count), 0);
const top = (entries: [string, number][]) => entries.reduce((a, b) => (b[1] > a[1] ? b : a));

/** Who won (or leads), from where, and since when. The winner is known; everything else is read off the simulations. */
function story(history: RaceHistory, winner: string | undefined) {
  const last = history.rounds.length - 1;
  const ahead = leadersAt(history, last);
  const leader = winner !== undefined && history.odds.has(winner) ? winner : ahead[0][0];
  const odds = history.odds.get(leader) ?? [];
  return {
    leader, ahead,
    now: odds[last], from: odds[0],
    favorites: leadersAt(history, 0),
    above: playersAbove(history, leader, 0),
    beside: playersBeside(history, leader, 0),
    lead: tookTheLead(history, leader),
    rest: bestOfTheRest(history, leader),
  };
}

const COUNT = ['', 'one other', 'two others', 'three others', 'four others', 'five others', 'six others', 'seven others'];
const and = new Intl.ListFormat('en-US', { type: 'conjunction' });
const after = (round: string) => (round === 'Pre' ? 'before round 1' : `after round ${round}`);
/** A sampled chance, in words: never to a tenth. */
const about = (p: number) => formatPct(p, 0);

/** The odds of a Candidates tournament: what happened, round by round, and the scenario builder. */
export function CandidatesResults({ eventTable, rounds, initialData, winner, intro }: CandidatesResultsProps) {
  const { rows, status, filtered, load } = useSimulations(eventTable, initialData);
  const [picks, setPicks] = useState<Game[]>([]);
  /** Simulate was pressed with nothing picked. */
  const [unpicked, setUnpicked] = useState(false);
  const over = rounds.every(isPlayed);
  const names = [...new Set(rounds.flatMap(r => r.games.flatMap(g => [g.whitePlayer, g.blackPlayer])))];

  const history = rows && rows.length > 0 ? raceHistory(rows) : null;
  const scenario = rows ? scenarioRows(rows) : [];
  const told = history && history.rounds.length > 0 ? story(history, winner) : null;
  const tones = buildPlayerToneMap(told ? [told.leader, ...names.filter(n => n !== told.leader)] : names);

  let entries: OddsEntry[] = [];
  let marks: OddsRound[] = [];
  if (history && told) {
    const played = history.rounds.length > 1;
    const sims = total(scenario);
    const scenarioOdds = (name: string) => Number(scenario.find(r => r.winner === name)?.win_count ?? 0) / (sims || 1);
    // With nothing but odds from before round 1, a scenario takes their place.
    const showBase = played || scenario.length === 0;
    marks = [
      ...(showBase ? history.rounds.map(r => (r === 'Pre' ? { label: 'Pre', title: 'Before round 1' } : { label: r, title: `After round ${r}` })) : []),
      ...(scenario.length > 0 ? [{ label: 'Sim', title: 'Your scenario' }] : []),
    ];
    entries = names.map(name => ({
      id: name, name: getPlayerName(name), short: getPlayerShortName(name), flag: getPlayerFederation(name), tone: tones[name],
      emphasis: name === told.leader ? 'strong' as const : 'context' as const,
      values: [...(showBase ? history.odds.get(name) ?? history.rounds.map(() => 0) : []), ...(scenario.length > 0 ? [scenarioOdds(name)] : [])],
    }));
    const at = marks.length - 1;
    // Level at the end: whoever once stood higher.
    entries.sort((a, b) => b.values[at] - a.values[at] || Math.max(...b.values) - Math.max(...a.values));
  }
  const lastRound = history?.rounds[history.rounds.length - 1];
  const simulations = scenario.length > 0 ? total(scenario) : rows && lastRound ? total(rows.filter(r => r.Round === lastRound)) : 0;

  const reset = () => { setPicks([]); void load([]); };
  const simulate = () => { setUnpicked(picks.length === 0); void load(picks); };
  const loading = status === 'loading';
  const picked = pickedWords(picks);

  const behind = told !== null && !told.ahead.some(e => e[0] === told.leader);
  const end = marks.length - 1;
  const inScenario = scenario.length > 0 ? entries[0] : undefined;
  // The strip over the results says who won, from where and since when, so the finding says who came closest.
  const closest = told?.rest ? `No one else rose above ${getPlayerName(told.rest.name)}’s ${about(told.rest.chance)}${told.rest.round === null ? '' : ` ${after(told.rest.round)}`}.` : '';
  const left = history && lastRound !== undefined ? rounds.length - Number(lastRound === 'Pre' ? 0 : lastRound) : 0;
  const stopped = told && left > 0 && told.now < 1 ? ` The simulations stop after round ${lastRound}, ${left === 1 ? 'one round' : `${left} rounds`} before the end.` : '';
  const finding = told && (inScenario
    ? <>In your scenario {inScenario.name} has a {about(inScenario.values[end])} chance to win, against {about(history?.odds.get(inScenario.id)?.at(-1) ?? 0)} as it stood.</>
    : winner !== undefined
    ? `${closest}${stopped}`.trim() || undefined
    : told.ahead.length === 1
    ? <>{getPlayerName(told.leader)} leads with a {about(told.now)} chance to win.</>
    : <>{and.format(told.ahead.map(e => getPlayerName(e[0])))} are too close to call, at about {about(told.now)} each.</>);
  const perRound = history !== null && scenario.length === 0 && history.sims.length > 1 && history.sims.every(n => n === simulations);

  return (
    <>
      {/* The figures come first on a phone; from 1024 the words are over them. */}
      <Section label="Summary" layout="plain" rule={false}>
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12">
          <div id={HERO} className={cn('min-w-0 lg:col-span-12', intro && 'lg:order-last')}>
            {told ? (
              <StatStrip
                columns={4}
                items={[
                  { key: 'leader', label: winner !== undefined ? 'Winner' : 'Leader', ...player(told.leader), sub: over ? `${pointsWord(scoreOf(rounds, told.leader))} of ${rounds.length} points` : undefined },
                  {
                    key: 'from', label: 'Chance before round 1', value: about(told.from),
                    sub: told.above > 0 ? `${told.beside > 0 ? 'Clearly behind' : 'Behind'} ${COUNT[told.above] ?? `${told.above} others`}` : told.favorites.length === 1 ? 'Favorite' : 'Among the favorites',
                  },
                  told.favorites.length === 1 && told.favorites[0][0] === told.leader
                    ? { key: 'now', label: `Chance after round ${lastRound}`, value: about(told.now) }
                    : told.favorites.length === 1
                    ? { key: 'favorite', label: 'Favorite before round 1', ...player(told.favorites[0][0]), sub: about(told.favorites[0][1]) }
                    : { key: 'favorite', label: 'Favorites before round 1', value: and.format(told.favorites.map(e => getPlayerShortName(e[0]))), sub: `About ${about(told.favorites[0][1])} each` },
                  behind
                    ? { key: 'lead', label: `Ahead after round ${lastRound}`, ...player(told.ahead[0][0]), sub: `${about(told.ahead[0][1])}, ${getPlayerShortName(told.leader)} ${about(told.now)}` }
                    : told.lead ? { key: 'lead', label: 'Ahead for good', value: `After round ${told.lead.round}`, sub: `${told.lead.level ? 'About level with' : 'Behind'} ${getPlayerShortName(told.lead.from)} ${after(told.lead.before)}` }
                    : { key: 'lead', label: 'Ahead for good', value: 'From the start' },
                ]}
              />
            ) : loading && <Skeleton kind="cells" rows={4} label="Loading the simulations" className="lg:min-h-28" />}
          </div>
          {intro && <div className="min-w-0 type-standfirst text-ink lg:col-span-8">{intro}</div>}
        </div>
      </Section>

      <Section id="results" title="Simulation results" layout="wide" finding={finding}>
        <Split
          stickyAside={!over}
          main={
            <div className="flex flex-col gap-6">
              {scenario.length > 0 && <Callout icon="check" role="status">Predictions updated to reflect your scenario selections</Callout>}
              {filtered && scenario.length === 0 && <Callout icon="info" role="status">None of the stored simulations has these results. Change a pick, or reset.</Callout>}
              {status === 'error' && <Callout tone="negative" icon="error" action={<Button size="sm" onClick={simulate}>Try again</Button>}>The simulations could not be loaded.</Callout>}
              {entries.length > 0 ? (
                <OddsByRound
                  entries={entries}
                  rounds={marks}
                  noun="Player"
                  y={{ max: 1 }}
                  caption="Chance to win the tournament after each round"
                  ariaLabel={`Chance to win after each round. ${told ? `${getPlayerName(told.leader)}: ${formatPct(told.from)} before round 1, ${formatPct(told.now)} after round ${lastRound}.` : ''}`}
                  note={simulations > 0 ? `Based on ${simulations.toLocaleString('en-US')} simulations${perRound ? ' after each round' : ''}` : undefined}
                  start={over && scenario.length === 0 ? 'first' : 'last'}
                  busy={loading}
                />
              ) : loading && <div aria-busy="true" className="flex flex-col gap-12"><Skeleton kind="chart" height={420} /><Skeleton kind="bars" rows={8} /></div>}
            </div>
          }
          aside={<ScenarioBuilder rounds={rounds} picks={picks} onPick={(g, o) => { setUnpicked(false); setPicks(p => withPick(p, g, o)); }} onReset={reset} onSimulate={simulate} loading={loading} note={picked ?? (unpicked && !loading ? 'No games picked, so the odds are as they stood.' : null)} />}
        />
      </Section>

      {picks.length > 0 && (
        <BottomBar label="Scenario" heroId={HERO}>
          <span className="min-w-0 flex-1 truncate type-label text-ink-2">{picks.length} selected</span>
          <Button size="sm" variant="quiet" onClick={reset} disabled={loading}>Reset</Button>
          <Button size="sm" variant="primary" onClick={simulate} loading={loading}>Simulate</Button>
        </BottomBar>
      )}
    </>
  );
}

/** The short name where four cells leave no room for the full one. */
function player(name: string) {
  const flag = getPlayerFederation(name);
  return {
    lead: flag ? <Flag code={flag} size="sm" decorative /> : undefined,
    value: <><span className="xl:hidden">{getPlayerShortName(name)}</span><span className="max-xl:hidden">{getPlayerName(name)}</span></>,
  };
}
