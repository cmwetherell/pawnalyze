'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import BottomSheet from '@/components/ui/BottomSheet';
import HeroPanel from './HeroPanel';
import OlympiadScenarioBuilder from './OlympiadScenarioBuilder';
import ScenarioSummary from './ScenarioSummary';
import TeamSpotlight from './TeamSpotlight';
import SpotlightHint from './SpotlightHint';
import TeamTable from './TeamTable';
import { MAX_PICKS, N_ROUNDS } from '@/lib/olympiad/config';
import { cachedJson, StaleRunError } from '@/lib/olympiad/clientCache';
import { describePick, encodePicks, normalizePick, parseFiltersLenient, pickKey } from '@/lib/olympiad/filters';
import { baselineOdds, scenarioOdds } from '@/lib/olympiad/odds';
import { prefetchTeam } from '@/lib/olympiad/prefetch';
import { latestActiveRound } from '@/lib/olympiad/rounds';
import { deriveStandings, outcomeFromScores, sortMatchesForPicker } from '@/lib/olympiad/standings';
import { formatPct } from '@/components/ui/ProbBar';
import type {
  HistoryPoint, Match, OlympiadEvent, Outcome, Pick, Player, RoundOdds, Run, ScenarioResult, ScenarioTeam, Team, TeamOdds, TeamSummary,
} from '@/lib/olympiad/types';

interface OlympiadDashboardProps {
  event: OlympiadEvent;
  run: Run;
  teams: Team[];
  players: Player[];
  matches: Match[];
  summary: TeamSummary[];
  history: HistoryPoint[];
  roundOdds: RoundOdds | null;
  anyLive: boolean;
}

const LIVE_REFRESH_MS = 5 * 60 * 1000;

export default function OlympiadDashboard({
  event, run, teams, players, matches, summary, history, roundOdds: baseRoundOdds, anyLive,
}: OlympiadDashboardProps) {
  const router = useRouter();
  const teamsById = useMemo(() => new Map(teams.map(t => [t.teamId, t])), [teams]);
  const participantIds = useMemo(() => new Set(summary.map(s => s.teamId)), [summary]);
  const participants = useMemo(() => teams.filter(t => participantIds.has(t.teamId)), [teams, participantIds]);
  const standings = useMemo(() => deriveStandings(matches, teams, participantIds), [matches, teams, participantIds]);
  const anyPlayed = useMemo(() => matches.some(m => m.status === 'final'), [matches]);
  const baseline = useMemo(() => baselineOdds(summary), [summary]);
  const nextRound = run.roundsCompleted + 1;
  const resultsRound = useMemo(() => latestActiveRound(matches), [matches]);

  const [picks, setPicks] = useState<Map<string, Pick>>(new Map());
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);
  const [scenarioKey, setScenarioKey] = useState('');
  const [scenarioRoundOdds, setScenarioRoundOdds] = useState<{ key: string; odds: RoundOdds } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleRun, setStaleRun] = useState(false);
  const [restoreNote, setRestoreNote] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [appliedResults, setAppliedResults] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickedByUser, setPickedByUser] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const cache = useRef<Map<string, ScenarioResult>>(new Map());
  const teamStats = useRef<Map<string, Map<number, ScenarioTeam>>>(new Map());

  const picksKey = useMemo(() => encodePicks(Array.from(picks.values())), [picks]);
  const dirty = picksKey !== scenarioKey;
  const isScenario = scenario !== null && scenarioKey !== '';

  const odds: Map<number, TeamOdds> = useMemo(
    () => (isScenario && scenario ? scenarioOdds(scenario, participantIds) : baseline),
    [isScenario, scenario, participantIds, baseline],
  );
  const rows = useMemo(() => Array.from(odds.values()), [odds]);
  const roundOdds = isScenario && scenarioRoundOdds?.key === scenarioKey ? scenarioRoundOdds.odds : baseRoundOdds;

  const markStale = useCallback(() => setStaleRun(true), []);
  const filtersKey = isScenario ? scenarioKey : '';
  const prefetch = useCallback((teamId: number) => prefetchTeam(event, run.runId, teamId, filtersKey), [event, run.runId, filtersKey]);

  // Warm the top eight (the hero) while the browser is idle so opening them is instant.
  useEffect(() => {
    const top = [...summary].sort((a, b) => b.pGold - a.pGold).slice(0, 8).map(s => s.teamId);
    const run_ = () => top.forEach(id => prefetchTeam(event, run.runId, id, ''));
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const handle = hasIdle ? window.requestIdleCallback(run_) : window.setTimeout(run_, 1500);
    return () => { if (hasIdle) window.cancelIdleCallback(handle); else clearTimeout(handle); };
  }, [event, run.runId, summary]);

  const runSimulation = useCallback(async (key: string, extraTeam: number | null) => {
    if (key === '') {
      setScenario(null);
      setScenarioKey('');
      setError(null);
      return;
    }
    const cacheKey = `${key}|${extraTeam ?? ''}`;
    const merge = (result: ScenarioResult): ScenarioResult => {
      const known = teamStats.current.get(key) ?? new Map<number, ScenarioTeam>();
      for (const t of result.teams) known.set(t.teamId, t);
      teamStats.current.set(key, known);
      return { ...result, teams: Array.from(known.values()) };
    };
    const cached = cache.current.get(cacheKey);
    if (cached) {
      setScenario(merge(cached));
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
      if (res.status === 410) { setStaleRun(true); return; }
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      cache.current.set(cacheKey, body as ScenarioResult);
      setScenario(merge(body as ScenarioResult));
      setScenarioKey(key);
      // Conditional win odds for the next round's cards, fetched in the background.
      if (nextRound <= N_ROUNDS) {
        const q = new URLSearchParams({ event, run: String(run.runId), round: String(nextRound), filters: key });
        cachedJson<RoundOdds>(`round|${event}|${run.runId}|${nextRound}|${key}`, `/api/sims/olympiad-2026/round-odds?${q.toString()}`)
          .then(o => setScenarioRoundOdds({ key, odds: o }))
          .catch(e => { if (e instanceof StaleRunError) setStaleRun(true); });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [event, run.runId, nextRound]);

  // Restore a shared scenario (?s=) and spotlight (?team=) client-side; never touch searchParams on the server.
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const teamParam = Number(qs.get('team'));
    const teamOk = participantIds.has(teamParam);
    if (teamOk) setSelectedTeamId(teamParam);
    const s = qs.get('s');
    if (!s) return;
    const { picks: valid, dropped } = parseFiltersLenient(s, { roundsCompleted: run.roundsCompleted, nTeams: run.nTeams, participantIds });
    if (dropped > 0) {
      setRestoreNote(valid.length
        ? `${dropped} of ${valid.length + dropped} shared picks are already decided or no longer valid and were dropped.`
        : 'This shared scenario is from an earlier round; all of its picks are already decided.');
    }
    if (valid.length === 0) return;
    const map = new Map<string, Pick>();
    for (const p of valid) {
      const n = normalizePick(p, matches);
      map.set(pickKey(n.round, n.teamId), n);
    }
    setPicks(map);
    void runSimulation(encodePicks(Array.from(map.values())), teamOk ? teamParam : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live days: pick up new results/runs without a manual reload (server cache is busted by the pipeline).
  useEffect(() => {
    if (!anyLive) return;
    const id = setInterval(() => router.refresh(), LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [anyLive, router]);

  const writeUrl = (mutate: (url: URL) => void) => {
    const url = new URL(window.location.href);
    mutate(url);
    window.history.replaceState(null, '', url.toString());
  };

  const simulateKey = (key: string) => {
    writeUrl(url => { if (key) url.searchParams.set('s', key); else url.searchParams.delete('s'); });
    void runSimulation(key, selectedTeamId);
    requestAnimationFrame(() => {
      if (window.innerWidth < 1024) summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSimulate = () => {
    if (!(dirty && picks.size > 0)) return;
    setSheetOpen(false);
    simulateKey(picksKey);
  };

  const handleReset = () => {
    setPicks(new Map());
    setScenario(null);
    setScenarioKey('');
    setError(null);
    setAppliedResults(false);
    writeUrl(url => url.searchParams.delete('s'));
  };

  const selectTeam = useCallback((teamId: number | null, scroll = true) => {
    if (teamId !== null) {
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body) triggerRef.current = active;
      setPickedByUser(true);
    }
    setSelectedTeamId(teamId);
    const url = new URL(window.location.href);
    if (teamId === null) url.searchParams.delete('team'); else url.searchParams.set('team', String(teamId));
    window.history.replaceState(null, '', url.toString());
    if (teamId !== null && scroll) {
      requestAnimationFrame(() => spotlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, []);

  // After the spotlight unmounts, hand focus back to whatever opened it (row, hero entry, chip).
  useEffect(() => {
    if (selectedTeamId !== null) return;
    const back = triggerRef.current;
    triggerRef.current = null;
    if (back?.isConnected) back.focus({ preventScroll: true });
  }, [selectedTeamId]);

  const selectedTeam = selectedTeamId !== null ? teamsById.get(selectedTeamId) ?? null : null;
  const selectedIndex = selectedTeamId !== null ? order.indexOf(selectedTeamId) : -1;
  const prevTeam = selectedIndex > 0 ? order[selectedIndex - 1] : null;
  const nextTeam = selectedIndex >= 0 && selectedIndex < order.length - 1 ? order[selectedIndex + 1] : null;

  const handleSetPick = (round: number, teamId: number, outcome: Outcome | null) => {
    setPicks(prev => {
      const next = new Map(prev);
      const normalized = normalizePick({ round, teamId, outcome: outcome ?? 'w' }, matches);
      const key = pickKey(normalized.round, normalized.teamId);
      if (outcome === null) next.delete(key);
      else if (next.size >= MAX_PICKS && !next.has(key)) return prev;
      else next.set(key, normalized);
      return next;
    });
    setAppliedResults(false);
  };

  // Results that are final but not yet in the simulations → one-click scenario.
  const playedBeyondRun = useMemo(() => {
    const final = matches.filter(m => m.status === 'final' && m.round > run.roundsCompleted && !m.projected && m.team2Id !== null);
    return sortMatchesForPicker(final, standings, teamsById);
  }, [matches, run.roundsCompleted, standings, teamsById]);

  const applyResults = useMemo(() => {
    if (playedBeyondRun.length === 0) return null;
    const onApply = () => {
      const map = new Map<string, Pick>();
      for (const m of playedBeyondRun.slice(0, MAX_PICKS)) {
        const outcome = outcomeFromScores(m.team1Score, m.team2Score);
        if (!outcome) continue;
        map.set(pickKey(m.round, m.team1Id), { round: m.round, teamId: m.team1Id, outcome });
      }
      setPicks(map);
      setAppliedResults(true);
      simulateKey(encodePicks(Array.from(map.values())));
    };
    return { count: Math.min(playedBeyondRun.length, MAX_PICKS), onApply, applied: appliedResults && !dirty };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playedBeyondRun, appliedResults, dirty, selectedTeamId]);

  // "With X beating Y in R2, India's gold odds go 22.4% → 29.2%."
  const sentence = useMemo(() => {
    if (!isScenario || !scenario || scenario.matched === 0) return null;
    const name = (id: number) => teamsById.get(id)?.name ?? `Team ${id}`;
    const pickList = Array.from(picks.values()).slice(0, 2).map(p => describePick(p, matches, name));
    const more = picks.size > 2 ? ` and ${picks.size - 2} more` : '';
    const changes = Array.from(odds.values())
      .map(o => ({ o, b: baseline.get(o.teamId) }))
      .filter(x => x.b && Math.abs(x.o.pGold - x.b.pGold) >= 0.005)
      .sort((a, b) => Math.abs(b.o.pGold - b.b!.pGold) - Math.abs(a.o.pGold - a.b!.pGold))
      .slice(0, 2)
      .map(x => `${name(x.o.teamId)}'s gold odds go ${formatPct(x.b!.pGold)} → ${formatPct(x.o.pGold)}`);
    if (changes.length === 0) return `With ${pickList.join(' and ')}${more}, the gold odds barely move.`;
    return `With ${pickList.join(' and ')}${more}, ${changes.join(' and ')}.`;
  }, [isScenario, scenario, picks, matches, teamsById, odds, baseline]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-6 space-y-6">
      <div aria-live="polite" className="space-y-3">
        {staleRun && (
          <div className="rounded-lg border border-chess-gold/40 bg-chess-gold/10 px-4 py-3 text-sm text-[var(--text-primary)] flex flex-wrap items-center gap-3">
            <span>New simulations have been uploaded since this page loaded.</span>
            <button type="button" onClick={() => window.location.reload()} className="h-8 rounded-md bg-chess-gold text-chess-dark px-3 text-xs font-semibold hover:bg-chess-gold-light">
              Reload
            </button>
          </div>
        )}
        {restoreNote && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface-2)] px-4 py-2.5 text-xs text-[var(--text-secondary)] flex items-center gap-3">
            <span className="flex-1">{restoreNote}</span>
            <button type="button" onClick={() => setRestoreNote(null)} className="h-8 px-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">Dismiss</button>
          </div>
        )}
      </div>

      <HeroPanel
        run={run}
        rows={rows}
        odds={odds}
        baseline={baseline}
        teamsById={teamsById}
        isScenario={isScenario}
        history={history}
        matches={matches}
        standings={standings}
        roundOdds={roundOdds}
        nextRound={nextRound}
        resultsRound={resultsRound}
        anyLive={anyLive}
        selectedTeamId={selectedTeamId}
        onSelect={id => selectTeam(id)}
        onPrefetch={prefetch}
        applyResults={applyResults}
      />

      {selectedTeam && (
        <div ref={spotlightRef} className="scroll-mt-20">
          <TeamSpotlight
            key={selectedTeam.teamId}
            event={event}
            run={run}
            team={selectedTeam}
            players={players.filter(p => p.teamId === selectedTeam.teamId)}
            matches={matches}
            teamsById={teamsById}
            standing={standings.get(selectedTeam.teamId)}
            participants={participants.length}
            odds={odds.get(selectedTeam.teamId) ?? null}
            baseline={baseline.get(selectedTeam.teamId) ?? null}
            isScenario={isScenario}
            filtersKey={isScenario ? scenarioKey : ''}
            history={history}
            anyPlayed={anyPlayed}
            onClose={() => selectTeam(null)}
            onPrev={prevTeam !== null ? () => selectTeam(prevTeam, false) : undefined}
            onNext={nextTeam !== null ? () => selectTeam(nextTeam, false) : undefined}
            onStale={markStale}
          />
        </div>
      )}

      <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-6 lg:space-y-0">
        <div className="lg:col-span-3 space-y-4">
          <div ref={summaryRef} className="scroll-mt-20 space-y-3" aria-live="polite">
            {isScenario && scenario && (
              <ScenarioSummary pickCount={picks.size} matched={scenario.matched} nSims={run.nSims} sentence={sentence} onClear={handleReset} />
            )}
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{error}</div>
            )}
          </div>
          <SpotlightHint hasSelected={pickedByUser} />
          <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`} aria-busy={loading}>
            <TeamTable
              teams={participants}
              standings={standings}
              odds={odds}
              baseline={baseline}
              isScenario={isScenario}
              anyPlayed={anyPlayed}
              selectedTeamId={selectedTeamId}
              onSelect={id => selectTeam(id === selectedTeamId ? null : id)}
              onPrefetch={prefetch}
              onOrderChange={setOrder}
            />
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-2">
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
              dirty={dirty}
              roundOdds={roundOdds}
              applyResults={applyResults}
            />
          </div>
        </div>
      </div>

      {/* Mobile: sticky action bar + builder in a bottom sheet */}
      <div
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg-surface-1)]/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex-1 h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-2)] px-3 text-sm font-semibold text-[var(--text-primary)] flex items-center justify-between gap-2"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-gold-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
              Scenario Builder
            </span>
            <span className="text-xs font-normal text-[var(--text-muted)]">
              {picks.size === 0 ? 'no picks' : `${picks.size} pick${picks.size === 1 ? '' : 's'}${dirty ? ' · new' : ''}`}
            </span>
          </button>
          <button
            type="button"
            onClick={handleSimulate}
            disabled={!(dirty && picks.size > 0) || loading}
            className={`h-11 px-4 rounded-lg text-sm font-semibold transition-colors ${
              dirty && picks.size > 0 && !loading
                ? 'bg-chess-gold text-chess-dark hover:bg-chess-gold-light'
                : 'bg-[var(--bg-surface-3)] text-[var(--text-muted)]'
            }`}
          >
            {loading ? 'Simulating…' : 'Simulate'}
          </button>
        </div>
      </div>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Scenario Builder">
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
          dirty={dirty}
          roundOdds={roundOdds}
          applyResults={applyResults}
          inSheet
        />
      </BottomSheet>
    </div>
  );
}
