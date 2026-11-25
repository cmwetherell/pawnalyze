'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { ScenarioPanel } from '@/components/chess/ScenarioPanel';
import { Section } from '@/components/layout/Section';
import { Split } from '@/components/layout/Split';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Flag } from '@/components/ui/Flag';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatStrip } from '@/components/ui/StatStrip';
import { formatPct } from '@/lib/format';
import { clearlyAbove } from '@/lib/raceHistory';
import type { Tone } from '@/lib/theme/tones';
import { games2024 } from '@/lib/wcc2024';
import type { Game } from '@/types';
import { GameRow } from './GameRow';
import { OddsByRound, type OddsEntry, type OddsRound } from './OddsByRound';
import { pickedWords, pointsWord, scoreOf, withPick, type Outcome } from './rounds';

interface MatchSims {
  byRound: { round: number; winPercentages: { winner: string; percentage: string }[]; nSims: number }[];
  highestRound: number | string;
  nSimsForHighestRound: number;
}

/** The round the API gives to the simulations that match a scenario. */
const SCENARIO = 100;
/** The API samples at random and fails when its sample holds no simulation of the last round. */
const TRIES = 3;

const PLAYERS: Record<string, { name: string; short: string; flag: string; tone: Tone }> = {
  'Ding, Liren': { name: 'Ding Liren', short: 'Ding', flag: 'CHN', tone: 'series-1' },
  'Gukesh D': { name: 'Gukesh D', short: 'Gukesh', flag: 'IND', tone: 'series-2' },
};

async function fetchSims(filters: string[]): Promise<MatchSims> {
  for (let i = 1; ; i++) {
    const res = await fetch('/api/sims/wcc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filters }) });
    if (res.ok) return res.json();
    if (i === TRIES) throw new Error(`Server responded with an error: ${res.status}`);
  }
}

/** "Din|Guk|2|d" */
const filterOf = (g: Game) => `${g.whitePlayer.substring(0, 3)}|${g.blackPlayer.substring(0, 3)}|${g.round}|${g.outcome === 'white' ? 'w' : g.outcome === 'black' ? 'b' : 'd'}`;

const roundOf = (round: number): OddsRound =>
  round === SCENARIO ? { label: 'Sim', title: 'Your scenario' } : round === 0 ? { label: 'Pre', title: 'Before round 1' } : { label: String(round), title: `After round ${round}` };

const GAMES = games2024(14);
const WINNER = 'Gukesh D';
const LOSER = 'Ding, Liren';

/** The result of the match, from its 14 games. */
function MatchStrip() {
  const won = (name: string) => GAMES.filter(g => (g.outcome === 'white' && g.whitePlayer === name) || (g.outcome === 'black' && g.blackPlayer === name)).length;
  const score = (name: string, games = GAMES) => pointsWord(scoreOf([{ round: 0, games }], name));
  const [a, b] = [PLAYERS[WINNER], PLAYERS[LOSER]];
  const draws = GAMES.filter(g => g.outcome === 'draw').length;
  return (
    <StatStrip
      columns={4}
      items={[
        { key: 'winner', label: 'Winner', lead: <Flag code={a.flag} size="sm" decorative />, value: a.name, sub: 'The challenger' },
        { key: 'score', label: 'Final score', value: `${score(WINNER)}–${score(b.name)}`, sub: `${a.short} to ${b.short}` },
        { key: 'wins', label: 'Games won', value: `${won(WINNER)}–${won(b.name)}`, sub: `${draws} games drawn` },
        { key: 'last', label: 'Decided in', value: `Game ${GAMES.length}`, sub: `${score(WINNER, GAMES.slice(0, -1))}–${score(b.name, GAMES.slice(0, -1))} before it` },
      ]}
    />
  );
}

/** World Championship 2024: who the simulations had winning after each game. `notice` stands under the figures. */
export function Wcc2024Results({ notice }: { notice?: ReactNode }) {
  const [sims, setSims] = useState<MatchSims | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading');
  const [picks, setPicks] = useState<Game[]>([]);

  const load = useCallback((filters: string[]) => fetchSims(filters).then(
    data => { setSims(data); setStatus('idle'); },
    error => { console.error('Failed to fetch simulations:', error); setStatus('error'); },
  ), []);
  useEffect(() => { void load([]); }, [load]);

  const update = (from: Game[]) => { setStatus('loading'); void load(from.map(filterOf)); };
  const played = sims ? Number(sims.highestRound) : 0;
  const games = games2024(sims ? played : 14);
  const loading = status === 'loading';
  const over = !sims || played >= GAMES.length;

  const rounds = sims?.byRound ?? [];
  const names = [...new Set(rounds.flatMap(r => r.winPercentages.map(w => w.winner)))].sort();
  const entries = names.map((name): OddsEntry => {
    const p = PLAYERS[name];
    return {
      id: name, name: p?.name ?? name, short: p?.short, flag: p?.flag, tone: p?.tone ?? 'context', emphasis: p ? 'normal' : 'context',
      values: rounds.map(r => Number(r.winPercentages.find(w => w.winner === name)?.percentage ?? 0) / 100),
    };
  });
  const end = rounds.findLastIndex(r => r.round !== SCENARIO);
  const leader = entries.length > 0 ? entries.reduce((a, b) => (b.values[end] > a.values[end] ? b : a)) : null;
  if (leader) leader.emphasis = 'strong';
  const pct = (i: number) => (leader ? formatPct(leader.values[i], 0) : '');
  // Every load draws another sample, so the finding is in words that hold for all of them.
  const clear = (a: OddsEntry | undefined, b: OddsEntry | undefined, i: number) => Boolean(a && b && clearlyAbove(a.values[i], b.values[i], rounds[i].nSims));
  const other = entries.find(e => e !== leader);
  const steps = leader && end > 0 ? [
    ...(clear(leader, other, 0) ? ['started as the favorite'] : []),
    ...(clear(other, leader, end - 1) ? [`trailed after round ${rounds[end - 1].round}`] : []),
    ...(over && leader.values[end] === 1 ? [`won round ${rounds[end].round}`] : []),
  ] : [];
  const finding = leader && steps.length > 0 ? `${leader.short ?? leader.name} ${new Intl.ListFormat('en-US').format(steps)}.` : undefined;
  const inScenario = rounds.some(r => r.round === SCENARIO);
  const sample = rounds.reduce((sum, r) => sum + (r.round === SCENARIO ? 0 : r.nSims), 0);

  return (
    <>
      <Section label="Summary" layout="plain" rule={false}><MatchStrip /></Section>
      <Section
        id="results"
        title="Simulated results by round"
        layout="wide"
        finding={finding}
      >
        <Split
          stickyAside={!over}
          main={
            <div className="flex flex-col gap-6">
              {inScenario && <Callout icon="check" role="status">Predictions updated to reflect your scenario selections</Callout>}
              {status === 'error' && <Callout tone="negative" icon="error" action={<Button size="sm" onClick={() => update(picks)}>Try again</Button>}>The simulations could not be loaded.</Callout>}
              {sims ? (
                <OddsByRound
                  entries={entries}
                  rounds={rounds.map(r => roundOf(r.round))}
                  noun="Player"
                  y={{ max: 1 }}
                  caption="Share of simulations won by each player"
                  ariaLabel={`Share of simulations won after each round. ${leader ? `${leader.name}: ${pct(0)} before round 1, ${pct(end)} after round ${played}.` : ''}`}
                  note={inScenario
                    ? `Based on ${sims.nSimsForHighestRound.toLocaleString('en-US')} simulations after round ${played} that match your scenario.`
                    : `Based on a random sample of ${sample.toLocaleString('en-US')} stored simulations, drawn anew on each load. ${sims.nSimsForHighestRound.toLocaleString('en-US')} of them are from after round ${played}.`}
                  height={{ desktop: 560, phone: 300 }}
                  start={over && end === rounds.length - 1 ? 'first' : 'last'}
                  busy={loading}
                />
              ) : loading && <div aria-busy="true" className="flex flex-col gap-12"><Skeleton kind="chart" height={560} label="Loading the simulations" /><Skeleton kind="bars" rows={2} /></div>}
              {notice && <div className="mt-6">{notice}</div>}
            </div>
          }
          aside={
            <ScenarioPanel
              title="Pick game outcomes"
              collapsible
              scroll={over ? 'none' : 'lg'}
              summary={over ? 'Every game has been played, so there are none left to pick.' : undefined}
              rounds={[]}
              round=""
              onRound={() => {}}
              note={pickedWords(picks)}
              primary={{ label: 'Update simulations', onClick: () => update(picks), loading }}
              onReset={picks.length > 0 && !loading ? () => { setPicks([]); update([]); } : undefined}
            >
              {games.map(g => (
                <GameRow
                  key={g.id} game={g} label={`Game ${g.round}`} disabled={loading}
                  pick={(picks.find(p => p.id === g.id)?.outcome ?? null) as Outcome | null}
                  onPick={o => setPicks(p => withPick(p, g, o))}
                />
              ))}
            </ScenarioPanel>
          }
        />
      </Section>
    </>
  );
}
