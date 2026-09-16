'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import MedalHero from './MedalHero';
import MedalHistoryChart from './MedalHistoryChart';
import OlympiadScenarioBuilder from './OlympiadScenarioBuilder';
import ScenarioSummary from './ScenarioSummary';
import StatusBar from './StatusBar';
import TeamTable from './TeamTable';
import { encodePicks, normalizePick, parseFilters, pickKey } from '@/lib/olympiad/filters';
import { baselineOdds, scenarioOdds } from '@/lib/olympiad/odds';
import { deriveStandings } from '@/lib/olympiad/standings';
import type {
  HistoryPoint, Match, OlympiadEvent, Outcome, Pick, Player, Run, ScenarioResult, Team, TeamOdds, TeamSummary,
} from '@/lib/olympiad/types';

interface OlympiadDashboardProps {
  event: OlympiadEvent;
  run: Run;
  teams: Team[];
  players: Player[];
  matches: Match[];
  summary: TeamSummary[];
  history: HistoryPoint[];
  lastFinalRound: number;
  anyLive: boolean;
}

export default function OlympiadDashboard({
  event, run, teams, players, matches, summary, history, lastFinalRound, anyLive,
}: OlympiadDashboardProps) {
  const teamsById = useMemo(() => new Map(teams.map(t => [t.teamId, t])), [teams]);
  const participantIds = useMemo(() => new Set(summary.map(s => s.teamId)), [summary]);
  const participants = useMemo(
    () => teams.filter(t => participantIds.has(t.teamId)),
    [teams, participantIds],
  );
  const nonParticipants = useMemo(
    () => teams.filter(t => !participantIds.has(t.teamId)),
    [teams, participantIds],
  );
  const standings = useMemo(() => deriveStandings(matches, teams, participantIds), [matches, teams, participantIds]);
  const anyPlayed = useMemo(() => matches.some(m => m.status === 'final'), [matches]);
  const baseline = useMemo(() => baselineOdds(summary), [summary]);

  const [picks, setPicks] = useState<Map<string, Pick>>(new Map());
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);
  const [scenarioKey, setScenarioKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleRun, setStaleRun] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const cache = useRef<Map<string, ScenarioResult>>(new Map());

  const picksKey = useMemo(() => encodePicks(Array.from(picks.values())), [picks]);
  const dirty = picksKey !== scenarioKey;
  const isScenario = scenario !== null && scenarioKey !== '';

  const odds: Map<number, TeamOdds> = useMemo(
    () => (isScenario && scenario ? scenarioOdds(scenario, participantIds) : baseline),
    [isScenario, scenario, participantIds, baseline],
  );
  const rows = useMemo(() => Array.from(odds.values()), [odds]);

  const runSimulation = useCallback(async (key: string, extraTeam: number | null) => {
    if (key === '') {
      setScenario(null);
      setScenarioKey('');
      setError(null);
      return;
    }
    const cached = cache.current.get(key);
    if (cached) {
      setScenario(cached);
      setScenarioKey(key);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ event, run: String(run.runId), filters: key });
      if (extraTeam !== null) params.set('teams', String(extraTeam));
      const res = await fetch(`/api/sims/olympiad-2026?${params.toString()}`);
      if (res.status === 410) {
        setStaleRun(true);
        return;
      }
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      cache.current.set(key, body as ScenarioResult);
      setScenario(body as ScenarioResult);
      setScenarioKey(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [event, run.runId]);

  // Restore a shared scenario from ?s= (client-only; never touch searchParams on the server).
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s');
    if (!s) return;
    const parsed = parseFilters(s, { roundsCompleted: run.roundsCompleted, nTeams: run.nTeams, participantIds });
    if (!parsed.ok || parsed.picks.length === 0) return;
    const map = new Map<string, Pick>();
    for (const p of parsed.picks) {
      const n = normalizePick(p, matches);
      map.set(pickKey(n.round, n.teamId), n);
    }
    setPicks(map);
    void runSimulation(encodePicks(Array.from(map.values())), null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSimulate = () => {
    const url = new URL(window.location.href);
    if (picksKey) url.searchParams.set('s', picksKey); else url.searchParams.delete('s');
    window.history.replaceState(null, '', url.toString());
    void runSimulation(picksKey, expandedTeamId);
  };

  const handleReset = () => {
    setPicks(new Map());
    setScenario(null);
    setScenarioKey('');
    setError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('s');
    window.history.replaceState(null, '', url.toString());
  };

  const handleSetPick = (round: number, teamId: number, outcome: Outcome | null) => {
    setPicks(prev => {
      const next = new Map(prev);
      const normalized = outcome ? normalizePick({ round, teamId, outcome }, matches) : normalizePick({ round, teamId, outcome: 'w' }, matches);
      const key = pickKey(normalized.round, normalized.teamId);
      if (outcome === null) next.delete(key);
      else next.set(key, normalized);
      return next;
    });
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
      {staleRun && (
        <div className="rounded-lg border border-chess-gold/40 bg-chess-gold/10 px-4 py-3 text-sm text-[var(--text-primary)] flex flex-wrap items-center gap-3">
          <span>New simulations have been uploaded since this page loaded.</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-chess-gold text-chess-dark px-3 py-1 text-xs font-semibold hover:bg-chess-gold-light"
          >
            Reload
          </button>
        </div>
      )}

      <StatusBar run={run} participants={participants.length} lastFinalRound={lastFinalRound} anyLive={anyLive} />

      <MedalHero rows={rows} baseline={baseline} teamsById={teamsById} isScenario={isScenario} />

      <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-6 lg:space-y-0">
        <div className="lg:col-span-3 space-y-4">
          {isScenario && scenario && (
            <ScenarioSummary pickCount={picks.size} matched={scenario.matched} nSims={run.nSims} onClear={handleReset} />
          )}
          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{error}</div>
          )}
          <div className={`transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <TeamTable
              event={event}
              run={run}
              teams={participants}
              teamsById={teamsById}
              players={players}
              matches={matches}
              standings={standings}
              odds={odds}
              baseline={baseline}
              isScenario={isScenario}
              filtersKey={isScenario ? scenarioKey : ''}
              anyPlayed={anyPlayed}
              expandedTeamId={expandedTeamId}
              onToggle={id => setExpandedTeamId(cur => (cur === id ? null : id))}
            />
          </div>
          {nonParticipants.length > 0 && (
            <details className="text-xs text-[var(--text-muted)] px-1">
              <summary className="cursor-pointer hover:text-[var(--text-secondary)]">
                {nonParticipants.length} registered team{nonParticipants.length === 1 ? '' : 's'} not playing
              </summary>
              <p className="mt-1">{nonParticipants.map(t => t.name).join(', ')}</p>
            </details>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="surface-card overflow-hidden lg:sticky lg:top-20">
            <OlympiadScenarioBuilder
              run={run}
              teams={participants}
              teamsById={teamsById}
              matches={matches}
              standings={standings}
              picks={picks}
              onSetPick={handleSetPick}
              onSimulate={handleSimulate}
              onReset={handleReset}
              loading={loading}
              dirty={dirty && picks.size > 0}
            />
          </div>
        </div>
      </div>

      <MedalHistoryChart history={history} teamsById={teamsById} />
    </div>
  );
}
