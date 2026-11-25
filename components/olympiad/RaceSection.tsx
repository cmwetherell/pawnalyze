'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';

import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { formatPct } from '@/lib/format';
import type { DerivedStanding, HistoryPoint, Match, RoundOdds, Run, Team, TeamOdds } from '@/lib/olympiad/types';
import { byGold, GoldRace } from './GoldRace';
import { hasTrend, MedalHistoryChart } from './MedalHistoryChart';
import { MoversStrip } from './MoversStrip';
import { RoundResults, type ApplyResults } from './RoundResults';
import { sentenceName, shortTeamName } from './teams';

type Tab = 'race' | 'results' | 'trend';

interface RaceSectionProps {
  run: Run;
  rows: TeamOdds[];
  odds: Map<number, TeamOdds>;
  baseline: Map<number, TeamOdds>;
  teamsById: Map<number, Team>;
  isScenario: boolean;
  history: HistoryPoint[];
  matches: Match[];
  standings: Map<number, DerivedStanding>;
  roundOdds: RoundOdds | null;
  nextRound: number;
  resultsRound: number | null;
  anyLive: boolean;
  finished: boolean;
  /** rounds_completed of the run behind `rows`; N_ROUNDS - 1 once the event is over. */
  oddsRound: number;
  selectedTeamId: number | null;
  onSelect: (teamId: number) => void;
  onPrefetch: (teamId: number) => void;
  applyResults: ApplyResults | null;
  /** The page opens with this section: it needs no rule under the tabs of the head, and it shows how the odds moved (next to the podium otherwise). */
  opens: boolean;
  /** Anchor of the tabs: what the phone bar waits for while the event is live. */
  figureId: string;
  /** Page notices, above the tabs. */
  notices?: ReactNode;
  /** The team spotlight, under the tabs. */
  children?: ReactNode;
}

/** The medal picture: the gold race, the latest round and, while the event is live, how the odds moved. */
export function RaceSection({
  run, rows, odds, baseline, teamsById, isScenario, history, matches, standings, roundOdds, nextRound, resultsRound,
  anyLive, finished, oddsRound, selectedTeamId, onSelect, onPrefetch, applyResults, opens, figureId, notices, children,
}: RaceSectionProps) {
  const [tab, setTab] = useState<Tab>(anyLive || (resultsRound !== null && resultsRound > run.roundsCompleted) ? 'results' : 'race');
  const prefix = useId();

  // "#results" is a tab: any link to it opens the tab first, so the browser has something to scroll to.
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if ((e.target as Element).closest?.('a[href="#results"]')) setTab('results'); };
    const onHash = () => {
      if (window.location.hash !== '#results') return;
      setTab('results');
      requestAnimationFrame(() => document.getElementById('results')?.scrollIntoView());
    };
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    const first = requestAnimationFrame(onHash);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHash);
      cancelAnimationFrame(first);
    };
  }, []);

  const name = (id: number | undefined) => teamsById.get(id ?? -1)?.name ?? '';
  const [first, second] = [...rows].sort(byGold);
  const rounds = [...new Set(history.map(h => h.roundsCompleted))].sort((a, b) => a - b);
  const prev = rounds[rounds.length - 2];

  const raceTitle = finished ? `Going into round ${oddsRound + 1}` : first && first.pGold > 0 ? `${sentenceName(name(first.teamId))} ${isScenario ? 'would lead' : 'leads'} the gold race` : 'Gold medal race';
  const title = tab === 'race' ? raceTitle : tab === 'trend' ? 'Odds over time' : resultsRound !== null ? `Round ${resultsRound} results` : `Round ${nextRound} preview`;
  const finding = tab === 'race'
    ? (
      <>
        {isScenario
          ? 'Chance of winning gold under your scenario.'
          : finished ? `Chance of winning gold as it stood after round ${oddsRound}, with one round left to play.` : 'Chance of winning gold.'}
        {' '}Each bar shows the full podium out of 100%.
        {!finished && first && second && first.pGold > 0 && ` ${sentenceName(name(first.teamId))} has ${formatPct(first.pGold)}, ${shortTeamName(name(second.teamId))} ${formatPct(second.pGold)}.`}
      </>
    )
    : tab === 'trend' ? 'Point at a line to bring it forward; select one to open that team.'
    : 'Select a team to open its profile.';

  const tabs: { key: Tab; label: string; live?: boolean }[] = [
    { key: 'race', label: finished ? 'Final-round odds' : 'Gold race' },
    { key: 'results', label: resultsRound !== null ? `Round ${resultsRound}` : `Round ${nextRound} preview`, live: anyLive },
    ...(opens ? [{ key: 'trend' as const, label: 'Trend' }] : []),
  ];
  const panel = (key: Tab, content: () => ReactNode) => (
    <div key={key} id={`${prefix}-${key}`} role="tabpanel" aria-labelledby={`${prefix}-tab-${key}`} hidden={tab !== key}>
      {tab === key && content()}
    </div>
  );

  return (
    <Section id="race" rule={!opens} className={opens ? 'pt-6 md:pt-0' : undefined} layout="wide" title={title} finding={finding}>
      {notices}
      <div id={figureId}>
        <Tabs className="mb-6" ariaLabel="Medal picture" items={tabs} value={tab} onChange={k => setTab(k as Tab)} panelPrefix={prefix} />
        {panel('race', () => (
          <div className="flex flex-col gap-6">
            <GoldRace rows={rows} baseline={baseline} teamsById={teamsById} isScenario={isScenario} selectedTeamId={selectedTeamId} onSelect={onSelect} onPrefetch={onPrefetch} />
            {!finished && prev !== undefined && <MoversStrip history={history} teamsById={teamsById} onSelect={onSelect} since={prev === 0 ? 'before round 1' : `round ${prev}`} />}
          </div>
        ))}
        {/* Hidden with its tab, and there from the start, so the section bar can follow it. */}
        <div id="results" hidden={tab !== 'results'}>
          {panel('results', () => (
            <RoundResults
              run={run} matches={matches} teamsById={teamsById} standings={standings} odds={odds} resultsRound={resultsRound}
              roundOdds={roundOdds} nextRound={nextRound} onSelect={onSelect} applyResults={applyResults}
            />
          ))}
        </div>
        {opens && panel('trend', () => (hasTrend(history)
          ? <MedalHistoryChart history={history} teamsById={teamsById} extraTeamId={selectedTeamId} onSelect={onSelect} />
          : (
            <EmptyState
              level={3} title="No trend to show yet"
              body={`Odds over time needs at least two simulation runs that use the same team numbering. Chess-results renumbers every seed when a team withdraws, which resets this history; the chart picks up again from the next run after round ${run.roundsCompleted}.`}
            />
          )))}
      </div>
      {children}
    </Section>
  );
}
