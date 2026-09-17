'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Flag from '@/components/ui/Flag';
import CompletedRoundList from './CompletedRoundList';
import MatchOutcomeToggle from './MatchOutcomeToggle';
import MatchPickerCard, { type WinProbs } from './MatchPickerCard';
import TeamCombobox, { matchesTeam } from './TeamCombobox';
import { MAX_PICKS } from '@/lib/olympiad/config';
import { outcomeFor, pickKey } from '@/lib/olympiad/filters';
import { allRounds, firstOpenRound, roundState, type RoundState } from '@/lib/olympiad/rounds';
import { formatMatchScore, sortMatchesForPicker, teamRoundHistory } from '@/lib/olympiad/standings';
import type { DerivedStanding, Match, Outcome, Pick, RoundOdds, Run, Team } from '@/lib/olympiad/types';

interface OlympiadScenarioBuilderProps {
  run: Run;
  teams: Team[];              // participants only
  teamsById: Map<number, Team>;
  matches: Match[];
  standings: Map<number, DerivedStanding>;
  picks: Map<string, Pick>;
  onSetPick: (round: number, teamId: number, outcome: Outcome | null) => void;
  onSimulate: () => void;
  onReset: () => void;
  loading: boolean;
  dirty: boolean;
  /** Model W/D/L for the next round (baseline or scenario-conditioned) */
  roundOdds: RoundOdds | null;
  applyResults: { count: number; onApply: () => void; applied: boolean } | null;
  /** When rendered inside a mobile sheet the list scrolls with the sheet, not its own box */
  inSheet?: boolean;
}

const INITIAL_MATCHES = 12;
const MORE_MATCHES = 20;
type SortMode = 'strength' | 'closest';

export default function OlympiadScenarioBuilder({
  run, teams, teamsById, matches, standings, picks, onSetPick, onSimulate, onReset, loading, dirty, roundOdds, applyResults, inSheet,
}: OlympiadScenarioBuilderProps) {
  const [view, setView] = useState<'round' | 'team'>('round');
  const [activeRound, setActiveRound] = useState<number>(() => firstOpenRound(run) ?? 1);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(INITIAL_MATCHES);
  const [sortMode, setSortMode] = useState<SortMode>('strength');
  const [pathTeam, setPathTeam] = useState<Team | null>(null);

  const rounds = allRounds();
  const states = useMemo(() => {
    const map = new Map<number, RoundState>();
    for (const r of rounds) map.set(r, roundState(r, run, matches));
    return map;
  }, [rounds, run, matches]);

  const anyPlayed = useMemo(() => matches.some(m => m.status === 'final'), [matches]);
  const totalPicks = picks.size;
  const roundHasPick = (round: number) => Array.from(picks.values()).some(p => p.round === round);

  const probsFor = useCallback((m: Match): WinProbs | null => {
    if (!roundOdds || roundOdds.round !== m.round) return null;
    const c = roundOdds.teams[m.team1Id];
    if (!c) return null;
    const n = Math.max(1, c.w + c.d + c.l);
    return { w: c.w / n, d: c.d / n, l: c.l / n };
  }, [roundOdds]);

  // ---- Round view: match list
  const roundMatches = useMemo(() => {
    const inRound = matches.filter(m => m.round === activeRound);
    let sorted = sortMatchesForPicker(inRound, standings, teamsById);
    if (sortMode === 'closest') {
      sorted = [...sorted].sort((a, b) => {
        const pa = probsFor(a); const pb = probsFor(b);
        const ga = pa ? Math.abs(pa.w - pa.l) : 2; const gb = pb ? Math.abs(pb.w - pb.l) : 2;
        return ga - gb;
      });
    }
    if (!query.trim()) return sorted;
    return sorted.filter(m => {
      const t1 = teamsById.get(m.team1Id);
      const t2 = m.team2Id !== null ? teamsById.get(m.team2Id) : undefined;
      return (t1 && matchesTeam(t1, query)) || (t2 && matchesTeam(t2, query));
    });
  }, [matches, activeRound, standings, teamsById, query, sortMode, probsFor]);

  const pathPicksInRound = useMemo(
    () => Array.from(picks.values()).filter(p => p.round === activeRound).sort((a, b) => a.teamId - b.teamId),
    [picks, activeRound],
  );

  const history = useMemo(
    () => (pathTeam ? teamRoundHistory(matches, pathTeam.teamId) : []),
    [matches, pathTeam],
  );

  // ---- Round tab scrolling + drag (same behaviour as the Candidates builder)
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const updateScrollArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollArrows, { passive: true });
    const ro = new ResizeObserver(updateScrollArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateScrollArrows); ro.disconnect(); };
  }, [updateScrollArrows, view]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onMouseDown = (e: MouseEvent) => {
      dragging.current = true; didDrag.current = false;
      dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      if (Math.abs(dx) > 4) didDrag.current = true;
      el.scrollLeft = dragStart.current.scrollLeft - dx;
    };
    const onMouseUp = () => { dragging.current = false; };
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [view]);

  const scrollBy = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });

  const activeState = states.get(activeRound) ?? 'unpaired';
  const stateGlyph = (s: RoundState) =>
    s === 'complete' ? '✓' : s === 'played' ? '✓' : s === 'paired' ? '●' : s === 'projected' ? '◐' : '○';
  const stateTitle = (r: number, s: RoundState) =>
    s === 'complete' ? `Round ${r} · in the simulations`
      : s === 'played' ? `Round ${r} · played, not yet simulated`
        : s === 'paired' ? `Round ${r} · pairings published`
          : s === 'projected' ? `Round ${r} · projected pairings`
            : `Round ${r} · pairings not yet published`;

  const canSimulate = dirty && totalPicks > 0 && !loading;
  const scrollBox = inSheet ? 'px-4 pt-1 pb-2' : 'flex-1 overflow-y-auto px-4 pt-1 pb-2 lg:max-h-[calc(100vh-22rem)]';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-heading text-[var(--text-primary)]">Scenario Builder</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Pick match winners and see how the gold-medal odds shift
          </p>
        </div>
        <div role="tablist" aria-label="Builder view" className="inline-flex rounded-lg bg-[var(--bg-surface-2)] p-0.5 text-xs shrink-0">
          {(['round', 'team'] as const).map(v => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              type="button"
              onClick={() => setView(v)}
              className={`h-10 px-2.5 rounded-md font-medium transition-colors ${
                view === v ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {v === 'round' ? 'By round' : 'By team'}
            </button>
          ))}
        </div>
      </div>

      {view === 'round' ? (
        <>
          {/* Round tabs */}
          <div className="flex items-center gap-1 px-2 pb-1">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll rounds left"
              className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                canScrollLeft ? 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]' : 'text-[var(--border)] cursor-default'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div ref={scrollRef} role="tablist" aria-label="Round" className="flex gap-1 overflow-x-auto scrollbar-none py-1 flex-1 select-none cursor-grab active:cursor-grabbing">
              {rounds.map(r => {
                const s = states.get(r) ?? 'unpaired';
                const isActive = r === activeRound;
                const hasSel = roundHasPick(r);
                return (
                  <button
                    key={r}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => { if (!didDrag.current) { setActiveRound(r); setLimit(INITIAL_MATCHES); setQuery(''); } }}
                    title={stateTitle(r, s)}
                    className={`relative shrink-0 h-10 px-2.5 rounded-md text-xs font-medium transition-colors select-none inline-flex items-center gap-1 ${
                      isActive
                        ? 'bg-chess-gold text-chess-dark'
                        : hasSel
                          ? 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-chess-gold/30'
                          : s === 'complete'
                            ? 'bg-[var(--bg-surface-2)] text-[var(--text-muted)]/70 hover:text-[var(--text-secondary)]'
                            : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <span aria-hidden className={`text-[11px] ${isActive ? '' : s === 'paired' ? 'text-red-400' : s === 'projected' || s === 'played' ? 'text-gold-ink' : ''}`}>{stateGlyph(s)}</span>
                    R{r}
                    {hasSel && !isActive && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-chess-gold" />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              aria-label="Scroll rounds right"
              className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                canScrollRight ? 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]' : 'text-[var(--border)] cursor-default'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <p className="px-4 pb-2 text-[11px] text-[var(--text-muted)]">
            <span className="text-gold-ink">✓</span> simulated · <span className="text-red-400">●</span> pairings out · <span className="text-gold-ink">◐</span> projected · ○ not yet paired
          </p>

          {/* Round content */}
          <div className={scrollBox}>
            {activeState === 'complete' && (
              <CompletedRoundList round={activeRound} matches={matches} teamsById={teamsById} />
            )}

            {activeState === 'played' && (
              <div className="space-y-1.5">
                <div className="rounded-md bg-chess-gold/10 border border-chess-gold/25 px-2.5 py-2 text-[11px] text-[var(--text-secondary)]">
                  <span className="font-semibold text-gold-ink">Round {activeRound} has been played.</span> The medal odds still reflect round {run.roundsCompleted}; the next simulation run will fold these results in.
                  {applyResults && applyResults.count > 0 && (
                    <button
                      type="button"
                      onClick={applyResults.onApply}
                      disabled={applyResults.applied}
                      className="mt-1.5 block w-full h-9 rounded-md text-xs font-semibold bg-chess-gold text-chess-dark hover:bg-chess-gold-light disabled:opacity-50"
                    >
                      {applyResults.applied ? 'Results applied as a scenario' : `Apply ${applyResults.count} result${applyResults.count === 1 ? '' : 's'} as a scenario now`}
                    </button>
                  )}
                </div>
                <input
                  value={query}
                  onChange={e => { setQuery(e.target.value); setLimit(INITIAL_MATCHES); }}
                  placeholder="Find a team…"
                  aria-label="Filter matches by team"
                  className="w-full h-10 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
                {roundMatches.slice(0, limit).map(m => {
                  const t1 = teamsById.get(m.team1Id);
                  const t2 = m.team2Id !== null ? teamsById.get(m.team2Id) ?? null : null;
                  if (!t1) return null;
                  return (
                    <MatchPickerCard key={m.boardNo} match={m} team1={t1} team2={t2} standing1={standings.get(m.team1Id)}
                      standing2={m.team2Id !== null ? standings.get(m.team2Id) : undefined} selected={null} onChange={() => {}} showMp={anyPlayed} locked />
                  );
                })}
                {roundMatches.length > limit && (
                  <button type="button" onClick={() => setLimit(l => l + MORE_MATCHES)} className="w-full text-xs text-gold-ink hover:text-chess-gold-light py-2">
                    Show {Math.min(MORE_MATCHES, roundMatches.length - limit)} more of {roundMatches.length}
                  </button>
                )}
              </div>
            )}

            {(activeState === 'paired' || activeState === 'projected') && (
              <div className="space-y-1.5">
                {activeState === 'projected' && (
                  <div className="rounded-md bg-chess-gold/10 border border-chess-gold/25 px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span className="font-semibold text-gold-ink">Projected pairings.</span> Official round {activeRound} pairings aren&apos;t out yet; these come from our Swiss pairing engine and may differ slightly.
                  </div>
                )}
                <p className="text-xs text-[var(--text-muted)] pb-0.5">
                  <span className="text-[var(--text-secondary)] font-medium">Tap the team you think wins</span>, or <span className="font-bold">=</span> for a drawn match.
                  {roundOdds && roundOdds.round === activeRound && <span> Percentages are the model&apos;s odds.</span>}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={e => { setQuery(e.target.value); setLimit(INITIAL_MATCHES); }}
                    placeholder="Find a team…"
                    aria-label="Filter matches by team"
                    className="flex-1 min-w-0 h-10 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                  <div role="tablist" aria-label="Sort matches" className="inline-flex rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border)] p-0.5 text-[11px] shrink-0">
                    {([['strength', anyPlayed ? 'Top boards' : 'Top seeds'], ['closest', 'Closest']] as [SortMode, string][]).map(([k, label]) => (
                      <button
                        key={k}
                        role="tab"
                        aria-selected={sortMode === k}
                        type="button"
                        disabled={k === 'closest' && !(roundOdds && roundOdds.round === activeRound)}
                        onClick={() => { setSortMode(k); setLimit(INITIAL_MATCHES); }}
                        className={`h-9 px-2 rounded-md font-medium transition-colors ${
                          sortMode === k ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                        } disabled:opacity-40`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {roundMatches.slice(0, limit).map(m => {
                  const t1 = teamsById.get(m.team1Id);
                  const t2 = m.team2Id !== null ? teamsById.get(m.team2Id) ?? null : null;
                  if (!t1) return null;
                  const locked = m.status === 'final';
                  return (
                    <MatchPickerCard
                      key={m.boardNo}
                      match={m}
                      team1={t1}
                      team2={t2}
                      standing1={standings.get(m.team1Id)}
                      standing2={m.team2Id !== null ? standings.get(m.team2Id) : undefined}
                      selected={locked ? null : outcomeFor(picks, m.round, m.team1Id, matches)}
                      onChange={o => onSetPick(m.round, m.team1Id, o)}
                      showMp={anyPlayed}
                      probs={probsFor(m)}
                      locked={locked}
                    />
                  );
                })}
                {roundMatches.length > limit && (
                  <button type="button" onClick={() => setLimit(l => l + MORE_MATCHES)} className="w-full text-xs text-gold-ink hover:text-chess-gold-light py-2">
                    Show {Math.min(MORE_MATCHES, roundMatches.length - limit)} more of {roundMatches.length}
                  </button>
                )}
              </div>
            )}

            {activeState === 'unpaired' && (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">
                  Round {activeRound} pairings aren&apos;t published yet. Pick how a team does regardless of opponent.
                </p>
                <TeamCombobox
                  teams={teams}
                  placeholder="Add a team…"
                  onSelect={t => {
                    if (!picks.has(pickKey(activeRound, t.teamId))) onSetPick(activeRound, t.teamId, 'w');
                  }}
                />
                <ul className="space-y-1">
                  {pathPicksInRound.map(p => {
                    const t = teamsById.get(p.teamId);
                    if (!t) return null;
                    return (
                      <li key={p.teamId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-surface-2)] ring-1 ring-chess-gold/30">
                        <Flag code={t.fedCode} size="sm" aria-hidden />
                        <span className="text-sm text-[var(--text-primary)] truncate flex-1">{t.name}</span>
                        <MatchOutcomeToggle
                          selected={p.outcome}
                          onChange={o => onSetPick(p.round, p.teamId, o)}
                          labels={{ w: `${t.name} wins`, d: `${t.name} draws`, l: `${t.name} loses` }}
                        />
                      </li>
                    );
                  })}
                </ul>
                {pathPicksInRound.length === 0 && (
                  <p className="text-[11px] text-[var(--text-muted)] italic">No picks for this round yet.</p>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Team view */
        <div className={`${scrollBox} space-y-2`}>
          <TeamCombobox teams={teams} placeholder="Choose a team…" onSelect={setPathTeam} keepQuery />
          {pathTeam ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 py-1">
                <Flag code={pathTeam.fedCode} size="md" aria-hidden />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">{pathTeam.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Seed #{pathTeam.teamId} · {pathTeam.avgRating} avg</div>
                </div>
              </div>
              {rounds.map(r => {
                const s = states.get(r) ?? 'unpaired';
                const entry = history.find(h => h.round === r);
                const opp = entry?.opponentId != null ? teamsById.get(entry.opponentId) : null;
                const selected = outcomeFor(picks, r, pathTeam.teamId, matches);
                const locked = s === 'complete' || s === 'played' || entry?.status === 'final';
                return (
                  <div key={r} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${selected ? 'bg-[var(--bg-surface-2)] ring-1 ring-chess-gold/30' : 'bg-[var(--bg-surface-2)]/40'}`}>
                    <span className="w-7 text-[11px] font-semibold text-[var(--text-muted)] tabular-nums">R{r}</span>
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs">
                      {opp ? (
                        <>
                          <Flag code={opp.fedCode} size="xs" aria-hidden />
                          <span className="truncate text-[var(--text-secondary)]">{opp.name}</span>
                          {entry?.projected && <span className="text-[11px] uppercase tracking-wider text-gold-ink shrink-0">proj.</span>}
                        </>
                      ) : entry && entry.opponentId === null ? (
                        <span className="text-[var(--text-muted)] italic">bye</span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic">opponent TBD</span>
                      )}
                    </div>
                    {locked ? (
                      <span className={`font-mono text-[11px] w-[84px] text-center ${
                        entry?.outcome === 'w' ? 'text-emerald-500' : entry?.outcome === 'l' ? 'text-rose-400' : 'text-gold-ink'
                      }`}>
                        {entry ? formatMatchScore(entry.score, entry.oppScore) : '–'}
                      </span>
                    ) : (
                      <MatchOutcomeToggle
                        compact
                        selected={selected}
                        onChange={o => onSetPick(r, pathTeam.teamId, o)}
                        labels={{ w: `${pathTeam.name} wins R${r}`, d: `${pathTeam.name} draws R${r}`, l: `${pathTeam.name} loses R${r}` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic px-1">
              Choose a team to set its result in each remaining round — e.g. &ldquo;What if India wins out?&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 py-3 border-t border-[var(--border)] mt-auto">
        {totalPicks > 0 && (
          <p className="text-[11px] text-[var(--text-muted)] mb-2" aria-live="polite">
            {totalPicks} of {MAX_PICKS} picks
            {dirty ? <span className="text-gold-ink"> · not yet simulated</span> : <span> · simulated</span>}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSimulate}
            disabled={!canSimulate}
            className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all ${
              canSimulate
                ? 'bg-chess-gold text-chess-dark hover:bg-chess-gold-light hover:shadow-gold active:bg-chess-gold-dark'
                : 'bg-[var(--bg-surface-3)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {loading ? 'Simulating…' : totalPicks === 0 ? 'Pick a result to simulate' : dirty ? `Simulate ${totalPicks} pick${totalPicks === 1 ? '' : 's'}` : 'Up to date'}
          </button>
          {totalPicks > 0 && (
            <button
              type="button"
              onClick={onReset}
              disabled={loading}
              className="h-11 px-3 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
