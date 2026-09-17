'use client';

import { useId, useMemo, useState } from 'react';

import MedalHero from './MedalHero';
import MedalHistoryChart from './MedalHistoryChart';
import MoversStrip from './MoversStrip';
import RoundResults from './RoundResults';
import type { DerivedStanding, HistoryPoint, Match, RoundOdds, Run, Team, TeamOdds } from '@/lib/olympiad/types';

type Tab = 'race' | 'trend' | 'results';

interface HeroPanelProps {
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
  selectedTeamId: number | null;
  onSelect: (teamId: number) => void;
  onPrefetch?: (teamId: number) => void;
  applyResults: { count: number; onApply: () => void; applied: boolean } | null;
}

export default function HeroPanel({
  run, rows, odds, baseline, teamsById, isScenario, history, matches, standings, roundOdds, nextRound, resultsRound,
  anyLive, selectedTeamId, onSelect, onPrefetch, applyResults,
}: HeroPanelProps) {
  const trendAvailable = useMemo(() => new Set(history.map(h => h.roundsCompleted)).size >= 2, [history]);
  const resultsDefault = anyLive || (resultsRound !== null && resultsRound > run.roundsCompleted);
  const [tab, setTab] = useState<Tab>(resultsDefault ? 'results' : 'race');
  const baseId = useId();

  const tabs: { key: Tab; label: string; disabled?: boolean; hint?: string }[] = [
    { key: 'race', label: 'Gold race' },
    { key: 'results', label: resultsRound !== null ? `Round ${resultsRound}` : `Round ${nextRound} preview` },
    { key: 'trend', label: 'Trend' },
  ];

  const roundLabel = useMemo(() => {
    const rounds = Array.from(new Set(history.map(h => h.roundsCompleted))).sort((a, b) => a - b);
    const prev = rounds[rounds.length - 2];
    return prev === undefined ? '' : prev === 0 ? 'pre-tournament' : `round ${prev}`;
  }, [history]);

  return (
    <section className="surface-card p-4 sm:p-6" aria-label="Medal picture">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-heading text-[var(--text-primary)]">
          {tab === 'race' ? 'Gold Medal Race' : tab === 'trend' ? 'Odds Over Time' : resultsRound !== null ? `Round ${resultsRound} Results` : `Round ${nextRound} Preview`}
        </h2>
        <div role="tablist" aria-label="Hero view" className="inline-flex rounded-lg bg-[var(--bg-surface-2)] p-0.5 text-xs">
          {tabs.map(t => (
            <button
              key={t.key}
              id={`${baseId}-tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              aria-controls={`${baseId}-panel`}
              disabled={t.disabled}
              title={t.hint}
              onClick={() => setTab(t.key)}
              className={`h-10 px-3 rounded-md font-medium transition-colors ${
                tab === t.key ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {t.label}
              {t.key === 'results' && anyLive && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live align-middle" />}
            </button>
          ))}
        </div>
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`}>
        {tab === 'race' && (
          <>
            <MoversStrip history={history} teamsById={teamsById} onSelect={onSelect} roundLabel={roundLabel} />
            <MedalHero rows={rows} baseline={baseline} teamsById={teamsById} isScenario={isScenario} selectedTeamId={selectedTeamId} onSelect={onSelect} onPrefetch={onPrefetch} />
          </>
        )}
        {tab === 'trend' && (trendAvailable ? (
          <MedalHistoryChart history={history} teamsById={teamsById} extraTeamId={selectedTeamId} embedded />
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--text-secondary)] max-w-2xl">
            <p className="font-medium text-[var(--text-primary)]">No trend to show yet.</p>
            <p className="mt-1 text-[var(--text-muted)]">
              Odds over time needs at least two simulation runs that use the same team numbering. Chess-results renumbers
              every seed when a team withdraws, which resets this history; the chart picks up again from the next run
              after round {run.roundsCompleted}.
            </p>
          </div>
        ))}
        {tab === 'results' && (
          <RoundResults
            run={run}
            matches={matches}
            teamsById={teamsById}
            standings={standings}
            odds={odds}
            resultsRound={resultsRound}
            roundOdds={roundOdds}
            nextRound={nextRound}
            onSelect={onSelect}
            applyResults={applyResults}
          />
        )}
      </div>
    </section>
  );
}
