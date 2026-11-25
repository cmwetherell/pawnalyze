'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { BottomBar } from '@/components/layout/BottomBar';
import { Section } from '@/components/layout/Section';
import { SectionBar } from '@/components/layout/SectionBar';
import { Split } from '@/components/layout/Split';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { CopyButton } from '@/components/ui/CopyButton';
import { Flag } from '@/components/ui/Flag';
import { SearchInput } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatPct } from '@/lib/format';
import { MAX_PICKS, N_ROUNDS, OLYMPIAD_EVENTS } from '@/lib/olympiad/config';
import { cachedJson, StaleRunError } from '@/lib/olympiad/clientCache';
import { describePick, encodePicks, normalizePick, parseFiltersLenient, pickKey } from '@/lib/olympiad/filters';
import { baselineOdds, scenarioOdds } from '@/lib/olympiad/odds';
import { prefetchTeam } from '@/lib/olympiad/prefetch';
import { latestActiveRound } from '@/lib/olympiad/rounds';
import { deriveStandings, outcomeFromScores, sortMatchesForPicker } from '@/lib/olympiad/standings';
import type {
  HistoryPoint, Match, OfficialStandings, OlympiadEvent, Outcome, Pick, Player, RoundOdds, Run, ScenarioResult, ScenarioTeam, Team, TeamOdds, TeamSummary,
} from '@/lib/olympiad/types';
import { FinalPodium } from './FinalPodium';
import { byGold } from './GoldRace';
import { OlympiadScenarioBuilder, PickNote, simulateState, type ScenarioBuilderProps } from './OlympiadScenarioBuilder';
import { RaceSection } from './RaceSection';
import { ScenarioSummary } from './ScenarioSummary';
import { SpotlightHint } from './SpotlightHint';
import { TeamSpotlight } from './TeamSpotlight';
import { TeamTable } from './TeamTable';
import { podiumRows } from './podium';
import { nameInSentence, shortTeamName } from './teams';

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
  /** Every round has a result: retire the scenario tooling and label the odds as historical. */
  finished: boolean;
  /** rounds_completed of the run the odds come from (= N_ROUNDS - 1 once finished). */
  oddsRound: number;
  officialStandings: OfficialStandings | null;
}

const LIVE_REFRESH_MS = 5 * 60 * 1000;

function glideTo(el: HTMLElement | null) {
  el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

export function OlympiadDashboard({
  event, run, teams, players, matches, summary, history, roundOdds: baseRoundOdds, anyLive, finished, oddsRound, officialStandings,
}: OlympiadDashboardProps) {
  const router = useRouter();
  const teamsById = useMemo(() => new Map(teams.map(t => [t.teamId, t])), [teams]);
  const participantIds = useMemo(() => new Set(summary.map(s => s.teamId)), [summary]);
  const participants = useMemo(() => teams.filter(t => participantIds.has(t.teamId)), [teams, participantIds]);
  const standings = useMemo(() => deriveStandings(matches, teams, participantIds, officialStandings), [matches, teams, participantIds, officialStandings]);
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
  const [query, setQuery] = useState('');
  /** No room for the table and the builder side by side: the builder is in the bottom bar and its sheet. */
  const narrow = useMediaQuery('(max-width: 1279.98px)');
  const spotlightRef = useRef<HTMLDivElement>(null);
  /** The page was opened by a link to a team and has not gone to it yet. */
  const landing = useRef(false);
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
  const prefetch = useCallback(
    (teamId: number) => { if (!finished) prefetchTeam(event, run.runId, teamId, filtersKey); },
    [event, run.runId, filtersKey, finished],
  );

  // Warm the top eight (the hero) while the browser is idle so opening them is instant.
  useEffect(() => {
    if (finished) return;   // opponents endpoint has nothing to say once every round is played
    const top = [...summary].sort((a, b) => b.pGold - a.pGold).slice(0, 8).map(s => s.teamId);
    const run_ = () => top.forEach(id => prefetchTeam(event, run.runId, id, ''));
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const handle = hasIdle ? window.requestIdleCallback(run_) : window.setTimeout(run_, 1500);
    return () => { if (hasIdle) window.cancelIdleCallback(handle); else clearTimeout(handle); };
  }, [event, run.runId, summary, finished]);

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
    if (teamOk) {
      setSelectedTeamId(teamParam);
      // A shared team link lands on the team, unless the link names another place on the page.
      landing.current = ['', '#team'].includes(window.location.hash);
    }
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

  useEffect(() => {
    if (!landing.current || selectedTeamId === null) return;
    landing.current = false;
    spotlightRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [selectedTeamId]);

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
      if (window.innerWidth < 1280) glideTo(summaryRef.current);
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
      // Previous and next inside the spotlight keep what opened it.
      if (active && active !== document.body && !spotlightRef.current?.contains(active)) triggerRef.current = active;
      setPickedByUser(true);
    }
    setSelectedTeamId(teamId);
    const url = new URL(window.location.href);
    if (teamId === null) url.searchParams.delete('team'); else url.searchParams.set('team', String(teamId));
    window.history.replaceState(null, '', url.toString());
    if (teamId !== null && scroll) {
      requestAnimationFrame(() => glideTo(spotlightRef.current));
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
    const name = (id: number) => nameInSentence(teamsById.get(id)?.name ?? `Team ${id}`);
    const pickList = Array.from(picks.values()).slice(0, 2).map(p => describePick(p, matches, name));
    const more = picks.size > 2 ? ` and ${picks.size - 2} more` : '';
    const changes = Array.from(odds.values())
      .map(o => ({ o, b: baseline.get(o.teamId) }))
      .filter(x => x.b && Math.abs(x.o.pGold - x.b.pGold) >= 0.005)
      .sort((a, b) => Math.abs(b.o.pGold - b.b!.pGold) - Math.abs(a.o.pGold - a.b!.pGold))
      .slice(0, 2)
      .map(x => `${name(x.o.teamId)}’s gold odds go from ${formatPct(x.b!.pGold)} to ${formatPct(x.o.pGold)}`);
    if (changes.length === 0) return `With ${pickList.join(' and ')}${more}, the gold odds barely move.`;
    return `With ${pickList.join(' and ')}${more}, ${changes.join(' and ')}.`;
  }, [isScenario, scenario, picks, matches, teamsById, odds, baseline]);

  const eventLabel = OLYMPIAD_EVENTS[event].shortTitle;
  const places = useMemo(() => (finished && officialStandings ? podiumRows(officialStandings) : []), [finished, officialStandings]);
  const champion = places.length ? teamsById.get(places[0].teamId) : undefined;
  const podium = champion !== undefined;
  const leader = [...rows].sort(byGold)[0];
  const leaderTeam = leader && leader.pGold > 0 ? teamsById.get(leader.teamId) : undefined;
  const heroId = podium ? 'podium' : 'race-figure';

  // What the section bar shows once the hero is gone: the answer, with the team it belongs to.
  const chip = champion
    ? { team: champion, text: 'won gold' }
    : leaderTeam ? { team: leaderTeam, text: `${formatPct(leader.pGold)} gold` } : null;
  const simulate = simulateState(picks.size, dirty, loading);

  const builder: ScenarioBuilderProps = {
    run, teams: participants, teamsById, matches, standings, picks, onSetPick: handleSetPick, onSimulate: handleSimulate, onReset: handleReset,
    loading, dirty, roundOdds, applyResults,
  };

  const sectionBar = (
    <SectionBar
      eventLabel={eventLabel} heroId={heroId}
      groups={[{
        label: eventLabel,
        items: [
          ...(podium ? [{ id: 'podium', label: 'Podium' }] : []),
          { id: 'race', label: finished ? 'Final-round odds' : 'Gold race' },
          ...(finished ? [] : [{ id: 'results', label: 'Results' }]),
          { id: 'teams', label: 'Teams' },
          { id: 'method', label: 'How it works' },
        ],
      }]}
      live={chip && (
        <span className="flex items-center gap-2">
          <Flag code={chip.team.fedCode} size="sm" decorative />
          {shortTeamName(chip.team.name)}
          <span className="text-ink-2 tnum">{chip.text}</span>
        </span>
      )}
      actions={isScenario && (
        <>
          <Button size="sm" variant="quiet" icon="reset" onClick={handleReset}>Reset</Button>
          <CopyButton kind="link" variant="secondary" label="Share scenario" />
        </>
      )}
    />
  );

  const teamTable = (
    <div className={loading ? 'pointer-events-none opacity-50 transition-opacity duration-data' : 'transition-opacity duration-data'} aria-busy={loading}>
      <TeamTable
        teams={participants} standings={standings} odds={odds} baseline={baseline} isScenario={isScenario} anyPlayed={anyPlayed} finished={finished} query={query}
        selectedTeamId={selectedTeamId} onSelect={id => selectTeam(id === selectedTeamId ? null : id)} onPrefetch={prefetch} onOrderChange={setOrder}
      />
    </div>
  );

  const teamsMain = finished ? teamTable : (
    <div className="flex flex-col gap-4">
      <div ref={summaryRef} id="scenario" className="flex flex-col gap-3 empty:hidden" aria-live="polite">
        {isScenario && scenario && <ScenarioSummary pickCount={picks.size} matched={scenario.matched} nSims={run.nSims} sentence={sentence} onClear={handleReset} />}
        {error && <Callout tone="negative" icon="error"><p>{error}</p></Callout>}
      </div>
      <SpotlightHint hasSelected={pickedByUser} />
      {teamTable}
    </div>
  );

  return (
    <>
      {podium && officialStandings && (
        <FinalPodium standings={officialStandings} teamsById={teamsById} history={history} eventLabel={eventLabel} selectedTeamId={selectedTeamId} onSelect={id => selectTeam(id)} />
      )}
      {podium && sectionBar}

      <RaceSection
        run={run} rows={rows} odds={odds} baseline={baseline} teamsById={teamsById} isScenario={isScenario} history={history} matches={matches}
        standings={standings} roundOdds={roundOdds} nextRound={nextRound} resultsRound={resultsRound} anyLive={anyLive} finished={finished} oddsRound={oddsRound}
        selectedTeamId={selectedTeamId} onSelect={id => selectTeam(id)} onPrefetch={prefetch} applyResults={applyResults} opens={!podium} figureId="race-figure"
        notices={(
          <div aria-live="polite" className="flex flex-col gap-3 empty:hidden [&:not(:empty)]:mb-6">
            {staleRun && (
              <Callout tone="warning" icon="warning" action={<Button size="sm" icon="reset" onClick={() => window.location.reload()}>Reload</Button>}>
                <p>New simulations have been uploaded since this page loaded.</p>
              </Callout>
            )}
            {restoreNote && <Callout icon="info" onDismiss={() => setRestoreNote(null)}><p>{restoreNote}</p></Callout>}
          </div>
        )}
      >
        {selectedTeam && (
          <div ref={spotlightRef} id="team" className="mt-8 scroll-mt-bar">
            <TeamSpotlight
              key={selectedTeam.teamId}
              event={event} run={run} team={selectedTeam} players={players.filter(p => p.teamId === selectedTeam.teamId)} matches={matches} teamsById={teamsById}
              standing={standings.get(selectedTeam.teamId)} participants={participants.length}
              odds={odds.get(selectedTeam.teamId) ?? null} baseline={baseline.get(selectedTeam.teamId) ?? null}
              isScenario={isScenario} filtersKey={filtersKey} history={history} anyPlayed={anyPlayed} finished={finished} oddsRound={oddsRound}
              onClose={() => selectTeam(null)}
              onPrev={prevTeam !== null ? () => selectTeam(prevTeam, false) : undefined}
              onNext={nextTeam !== null ? () => selectTeam(nextTeam, false) : undefined}
              onStale={markStale}
            />
          </div>
        )}
      </RaceSection>
      {!podium && sectionBar}

      <Section
        id="teams" layout="wide" title={`All ${participants.length} teams`}
        finding={isScenario ? 'Scenario odds with the change from the baseline. Select a team to open its profile.'
          : !anyPlayed ? 'Select a team for roster, results, finish odds and likely opponents.'
          : finished ? 'Final standings. Gold odds are as they stood before the last round. Select a team for its full profile.'
          : 'Sorted by gold odds; sort by Pos or MP for the standings. Select a team for its full profile.'}
        actions={<SearchInput className="w-full" placeholder="Search teams" aria-label="Search teams" value={query} onChange={e => setQuery(e.target.value)} onClear={() => setQuery('')} />}
      >
        {finished || narrow ? teamsMain : <Split stickyAside main={teamsMain} aside={<OlympiadScenarioBuilder {...builder} />} />}
      </Section>

      {!finished && narrow && (
        <>
          <BottomBar label="Scenario" heroId={heroId} until="xl">
            <Button className="flex-1" icon="sort" onClick={() => setSheetOpen(true)} aria-haspopup="dialog" aria-expanded={sheetOpen}>
              Scenario{picks.size > 0 && `, ${picks.size} pick${picks.size === 1 ? '' : 's'}`}
            </Button>
            <Button variant="primary" onClick={handleSimulate} disabled={simulate.disabled} loading={loading}>{loading ? 'Simulating' : 'Simulate'}</Button>
          </BottomBar>
          <Sheet
            open={sheetOpen} onClose={() => setSheetOpen(false)} title="Scenario builder"
            footer={(
              <>
                <Button variant="primary" onClick={handleSimulate} disabled={simulate.disabled} loading={loading}>{simulate.label}</Button>
                {picks.size > 0 && <Button variant="quiet" icon="reset" onClick={handleReset} disabled={loading}>Reset</Button>}
                {picks.size > 0 && <span className="w-full type-label text-ink-2"><PickNote picks={picks.size} dirty={dirty} /></span>}
              </>
            )}
          >
            <OlympiadScenarioBuilder {...builder} bare />
          </Sheet>
        </>
      )}
    </>
  );
}
