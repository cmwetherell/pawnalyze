'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import CopyLink from '@/components/ui/CopyLink';
import { LIVE_REFRESH_MS, N_CLASSICAL } from '@/lib/wcc/config';
import { exact, gameOdds, whiteInGame } from '@/lib/wcc/match';
import { ZERO_OFFSETS, adjustedWdl, drawRate, type RatingOffsets } from '@/lib/wcc/model';
import {
  PICK_HP, encodePicks, parseColour, parseOffsets, parsePicks, parseTheta, writeScenario, type PickOutcome,
} from '@/lib/wcc/scenario';
import { currentOdds, fmtScore, isLagging, matchState } from '@/lib/wcc/status';
import type {
  HalfPoints, HistoryPoint, MarketRow, MatchOdds, ModelGrid, PlayerId, SimRow, SimStats, WccGame, WccRun, WccSummary,
} from '@/lib/wcc/types';
import ClinchTimeline from './ClinchTimeline';
import ColourDrawToggle from './ColourDrawToggle';
import GameStrip, { type GameView } from './GameStrip';
import HowItEnds from './HowItEnds';
import MatchStatus from './MatchStatus';
import PrizeCard from './PrizeCard';
import ScheduleCalendar from './ScheduleCalendar';
import ScoreDistribution from './ScoreDistribution';
import SimReplay from './SimReplay';
import WhatIfLab from './WhatIfLab';
import WinProbHistoryChart from './WinProbHistoryChart';
import WinSplitBar from './WinSplitBar';
import { Crown, DeltaChip, formatPct, type Players } from './ui';

interface Props {
  players: Players;
  games: WccGame[];
  run: WccRun;
  /** Headline odds for the current state (or frozen before the decisive game once decided). */
  summary: WccSummary;
  history: HistoryPoint[];
  markets: MarketRow[];
  simStats: SimStats | null;
  simSample: SimRow[];
  /** The match is decided; odds are frozen as they stood before the decisive game. */
  finished: boolean;
  slots: { markets: ReactNode; h2h: ReactNode; methodology: ReactNode };
}

type GridState = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

const NAV = [
  { id: 'odds', label: 'Odds' },
  { id: 'scenario', label: 'Scenarios' },
  { id: 'how-it-ends', label: 'Tiebreaks' },
  { id: 'scores', label: 'Scores' },
  { id: 'when', label: 'When' },
  { id: 'replay', label: 'Replay' },
  { id: 'markets', label: 'Markets' },
  { id: 'what-if', label: 'What-if' },
  { id: 'head-to-head', label: 'Form' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'methodology', label: 'Method' },
];

export default function WccDashboard({ players, games, run, summary, history, markets, simStats, simSample, finished, slots }: Props) {
  const router = useRouter();
  const state = useMemo(() => matchState(games, run.params.g1_white ?? null), [games, run.params.g1_white]);
  const colourKnown = state.g1White !== null;
  const runTheta = run.params.theta?.classical ?? 1;

  const [picks, setPicks] = useState<Map<number, PickOutcome>>(() => new Map());
  const [colour, setColour] = useState<PlayerId | null>(null);
  const [offsets, setOffsets] = useState<RatingOffsets>(ZERO_OFFSETS);
  const [theta, setTheta] = useState<number>(runTheta);
  const [grid, setGrid] = useState<ModelGrid | null>(null);
  const [gridState, setGridState] = useState<GridState>('idle');
  const [restoreNote, setRestoreNote] = useState<string | null>(null);
  const restored = useRef(false);
  const gridRequested = useRef(false);

  const requestGrid = useCallback(() => {
    if (gridRequested.current) return;
    gridRequested.current = true;
    setGridState('loading');
    fetch(`/api/sims/wcc-2026/grid?v=${encodeURIComponent(run.modelVersion)}`)
      .then(async res => {
        if (res.status === 404) { setGridState('missing'); return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setGrid(await res.json() as ModelGrid);
        setGridState('ready');
      })
      .catch(() => setGridState('error'));
  }, [run.modelVersion]);

  // Restore a shared scenario client-side (?s, ?c, ?r, ?t); the server never reads searchParams.
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const decided = (g: number) => state.fixed.has(g);
    const { picks: p, dropped } = parsePicks(qs.get('s'), decided);
    const c = parseColour(qs.get('c'));
    const r = parseOffsets(qs.get('r'));
    const t = parseTheta(qs.get('t'));
    restored.current = true;
    if (finished) return;
    if (p.size) setPicks(p);
    if (c !== null && !colourKnown) setColour(c);
    if (r.g !== 0 || r.s !== 0) { setOffsets(r); requestGrid(); }
    if (t !== null) setTheta(t);
    if (dropped > 0) setRestoreNote(`${dropped} shared pick${dropped === 1 ? ' is' : 's are'} already decided or invalid and ${dropped === 1 ? 'was' : 'were'} dropped.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync so any scenario can be shared.
  useEffect(() => {
    if (!restored.current) return;
    const url = new URL(window.location.href);
    writeScenario(url, { picks, g1White: colour, offsets, theta }, runTheta, colourKnown);
    // Keep shared links readable: ?s=3:1,5:d rather than ?s=3%3A1%2C5%3Ad.
    const next = url.toString().replace(/%3A/gi, ':').replace(/%2C/gi, ',');
    if (next !== window.location.href) window.history.replaceState(null, '', next);
  }, [picks, colour, offsets, theta, runTheta, colourKnown]);

  // Live days: pick up new results and runs without a manual reload.
  useEffect(() => {
    if (!state.anyLive) return;
    const id = setInterval(() => router.refresh(), LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [state.anyLive, router]);

  // ---- exact odds

  const effG1: PlayerId | null = colourKnown ? state.g1White : colour;
  const labActive = offsets.g !== 0 || offsets.s !== 0 || Math.abs(theta - runTheta) > 1e-9;
  const wdl = useMemo(
    () => (labActive ? adjustedWdl(summary.wdl, run.params, grid, offsets, theta) : summary.wdl),
    [labActive, summary.wdl, run.params, grid, offsets, theta],
  );
  const lagging = !finished && isLagging(run, state);

  // Baseline: the stored summary, or (if results arrived after the last run) the same exact
  // computation with those results applied.
  const baseline: MatchOdds = useMemo(() => (finished ? summary : currentOdds(summary, run, state)), [finished, summary, run, state]);

  // Odds over time: until the pipeline stores a run for the latest result, add it from the exact computation.
  const historyNow: HistoryPoint[] = useMemo(() => {
    if (!lagging || state.lastFinal <= run.afterGame || state.tbFixed.length > 0) return history;
    const game = state.classical[state.lastFinal - 1];
    return [...history, {
      runId: -1, afterGame: state.lastFinal, tbGames: 0,
      createdAt: game?.startsAt ?? new Date(0).toISOString(), pWin1: baseline.pWin1, pTb: baseline.pTb,
    }];
  }, [lagging, history, state, run.afterGame, baseline]);

  const fixedAll = useMemo(() => {
    const m = new Map<number, HalfPoints>(state.fixed);
    for (const [g, o] of picks) if (!m.has(g)) m.set(g, PICK_HP[o]);
    return m;
  }, [state.fixed, picks]);

  const scenarioActive = !finished && (picks.size > 0 || (!colourKnown && colour !== null) || labActive);
  const odds: MatchOdds = useMemo(
    () => (scenarioActive ? exact({ wdl, fixed: fixedAll, g1White: effG1, tb: state.tbFixed }) : baseline),
    [scenarioActive, wdl, fixedAll, effG1, state.tbFixed, baseline],
  );

  const swings = useMemo(() => {
    if (finished) return new Map<number, Record<PickOutcome, number>>();
    const out = new Map<number, Record<PickOutcome, number>>();
    for (let g = 1; g <= N_CLASSICAL; g++) {
      if (state.fixed.has(g)) continue;
      const at = (o: PickOutcome) => {
        const m = new Map(fixedAll);
        m.set(g, PICK_HP[o]);
        return exact({ wdl, fixed: m, g1White: effG1, tb: state.tbFixed }).pWin1;
      };
      out.set(g, { '1': at('1'), d: at('d'), '2': at('2') });
    }
    return out;
  }, [finished, state.fixed, state.tbFixed, fixedAll, wdl, effG1]);

  const views: GameView[] = useMemo(() => state.classical.map(game => {
    const white = game.whitePlayerId ?? (effG1 !== null ? whiteInGame(game.gameNo, effG1) : null);
    return {
      game,
      white,
      whiteAssumed: game.whitePlayerId === null && !colourKnown && white !== null,
      odds: gameOdds(wdl, game.gameNo, effG1),
      pPlayed: odds.gamePlayed[game.gameNo - 1] ?? 1,
      finalHp: state.fixed.get(game.gameNo) ?? null,
      pick: picks.get(game.gameNo),
      swing: swings.get(game.gameNo) ?? null,
    };
  }), [state, effG1, colourKnown, wdl, odds.gamePlayed, picks, swings]);

  const breakEven = useMemo(() => {
    if (!grid) return null;
    const p = (d: number) => exact({
      wdl: adjustedWdl(summary.wdl, run.params, grid, { g: 0, s: -d }, theta), fixed: fixedAll, g1White: effG1, tb: state.tbFixed,
    }).pWin1;
    const lo0 = -150, hi0 = 230;
    if (p(hi0) < 0.5) return { points: hi0, beyond: true };
    if (p(lo0) > 0.5) return { points: lo0, beyond: true };
    let lo = lo0, hi = hi0;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (p(mid) < 0.5) lo = mid; else hi = mid;
    }
    return { points: (lo + hi) / 2, beyond: false };
  }, [grid, summary.wdl, run.params, theta, fixedAll, effG1, state.tbFixed]);

  // ---- handlers

  const setPick = (g: number, v: PickOutcome | null) => {
    setPicks(prev => {
      const next = new Map(prev);
      if (v === null) next.delete(g); else next.set(g, v);
      return next;
    });
  };
  const resetAll = () => {
    setPicks(new Map());
    setColour(null);
    setOffsets(ZERO_OFFSETS);
    setTheta(runTheta);
    setRestoreNote(null);
  };
  const onLab = (o: RatingOffsets, t: number) => { setOffsets(o); setTheta(t); };

  const pickCount = picks.size;
  const labelParts = [
    pickCount ? `your ${pickCount} pick${pickCount === 1 ? '' : 's'}` : null,
    !colourKnown && colour !== null ? `${players[colour].shortName} White in game 1` : null,
    labActive ? 'the what-if settings' : null,
  ].filter(Boolean);
  const joined = labelParts.length > 1 ? `${labelParts.slice(0, -1).join(', ')} and ${labelParts[labelParts.length - 1]}` : labelParts[0];
  const scenarioLabel = scenarioActive && joined ? `With ${joined}:` : null;
  const byColour = { '1': odds.byColour['1']?.p_win1 ?? odds.pWin1, '2': odds.byColour['2']?.p_win1 ?? odds.pWin1 };
  const champion = finished && state.winner ? players[state.winner] : null;
  // What the headline includes beyond the stored run.
  const freshness = [
    run.rebasedFrom ? `the match-start ratings (${players[1].shortName} ${players[1].ratings.classical}, ${players[2].shortName} ${players[2].ratings.classical})` : null,
    lagging && state.lastFinal > run.afterGame
      ? `results since the last simulation run (game ${run.afterGame + 1}${state.lastFinal > run.afterGame + 1 ? `–${state.lastFinal}` : ''})`
      : lagging ? `the colour draw (${players[state.g1White ?? 1].shortName} White in game 1)` : null,
  ].filter((x): x is string => x !== null);

  return (
    <>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6">
        {/* Headline */}
        <section id="odds" aria-label="Match odds" className="surface-card p-4 sm:p-6 -mt-16 sm:-mt-20 relative z-10 shadow-2xl shadow-black/20 scroll-mt-32">
          {champion ? (
            <div className="mb-5 pb-5 border-b border-[var(--border)] flex flex-wrap items-center gap-4">
              <span className="w-12 h-12 rounded-full grid place-items-center bg-chess-gold/15 text-chess-gold ring-1 ring-chess-gold/50"><Crown className="w-6 h-6" /></span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">World Champion</p>
                <p className="font-heading text-2xl sm:text-3xl gold-gradient-text">{champion.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {state.decidedStage === 'classical'
                    ? `Won ${fmtScore(Math.max(state.score1, state.score2), Math.min(state.score1, state.score2))} after game ${state.decidedAt}.`
                    : 'Won in the tiebreaks after a 7–7 classical match.'}
                  {' '}The odds below are frozen as they stood before the decisive game.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-5 pb-5 border-b border-[var(--border)]">
              <MatchStatus state={state} players={players} />
            </div>
          )}
          <WinSplitBar
            players={players}
            pWin1={odds.pWin1}
            pTb={odds.pTb}
            base={scenarioActive ? { pWin1: baseline.pWin1, pTb: baseline.pTb } : null}
            nSims={run.rebasedFrom || lagging ? null : run.nSims}
            scenarioLabel={scenarioLabel}
          />
          {freshness.length > 0 && !scenarioActive && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Uses {freshness.join(' and ')}, computed exactly on this page; the simulations catch up at the next run.
            </p>
          )}
        </section>

      </div>

      {/* In-page navigation */}
      <nav aria-label="Sections" className="sticky top-16 z-30 mt-6 border-y border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-none">
          {NAV.map(n => (
            <a key={n.id} href={`#${n.id}`} className="shrink-0 h-11 px-2.5 inline-flex items-center text-xs font-semibold text-[var(--text-muted)] hover:text-gold-ink transition-colors">
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      <div className={`max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6 ${finished ? 'pb-10' : 'pb-28 lg:pb-10'}`}>
        <div aria-live="polite">
          {restoreNote && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface-2)] px-4 py-2.5 text-xs text-[var(--text-secondary)] flex items-center gap-3">
              <span className="flex-1">{restoreNote}</span>
              <button type="button" onClick={() => setRestoreNote(null)} className="h-8 px-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">Dismiss</button>
            </div>
          )}
        </div>

        {/* Scenario builder */}
        <section id="scenario" aria-labelledby="scenario-title" className="surface-card p-4 sm:p-6 scroll-mt-32">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1">
                {finished ? 'The classical games' : 'Scenario builder'}
              </p>
              <h2 id="scenario-title" className="font-heading text-xl sm:text-2xl text-[var(--text-primary)]">
                {finished ? 'Game by game' : 'Pick the results'}
              </h2>
              {!finished && (
                <p className="mt-1.5 text-sm text-[var(--text-muted)]">
                  Choose a result for any game and every number on this page updates instantly. Hover a button to see where the match odds would go.
                </p>
              )}
            </div>
            {!finished && (
              <div className="flex flex-wrap items-end gap-3">
                {!colourKnown && (
                  <ColourDrawToggle value={colour} onChange={setColour} players={players} byColour={byColour} />
                )}
                <div className="hidden lg:flex items-center gap-1">
                  {scenarioActive && (
                    <button type="button" onClick={resetAll} className="h-10 px-3 rounded-md text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]">
                      Reset
                    </button>
                  )}
                  <CopyLink label="Share scenario" />
                </div>
              </div>
            )}
          </div>
          <GameStrip views={views} players={players} onPick={setPick} locked={finished} />
          {!finished && (
            <p className="mt-3 text-[11px] text-[var(--text-muted)] flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5"><span aria-hidden className="w-2.5 h-2.5 rounded-full bg-white ring-1 ring-black/40" /> who has White{!colourKnown && colour !== null ? ' (italic: assumed until the 22 Nov draw)' : ''}</span>
              <span>Bars: {players[1].shortName} win · draw · {players[2].shortName} win for that game{effG1 === null ? ', averaged over the colour draw' : ''}.</span>
            </p>
          )}
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <HowItEnds odds={odds} players={players} />
          <ScoreDistribution odds={odds} players={players} />
        </div>
        <ClinchTimeline odds={odds} players={players} />
        {!finished && <SimReplay runId={run.runId} nSims={run.nSims} stats={simStats} sample={simSample} players={players} />}
        <WinProbHistoryChart history={historyNow} markets={markets} players={players} />
        {slots.markets}
        {!finished && (
          <WhatIfLab
            players={players}
            offsets={offsets}
            theta={theta}
            runTheta={runTheta}
            onChange={onLab}
            gridState={gridState}
            requestGrid={requestGrid}
            pWin1={odds.pWin1}
            basePWin1={baseline.pWin1}
            drawRate={drawRate(wdl)}
            breakEven={breakEven}
          />
        )}
        <PrizeCard prize={odds.prize} base={scenarioActive ? baseline.prize : null} players={players} />
        {slots.h2h}
        <ScheduleCalendar games={state.classical} players={players} />
        {slots.methodology}
      </div>

      {/* Mobile: sticky scenario bar */}
      {!finished && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg-surface-1)]/95 backdrop-blur"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-2">
            <a href="#scenario" className="flex-1 min-w-0 h-11 rounded-lg bg-[var(--bg-surface-2)] px-3 flex items-center justify-between gap-2" aria-label="Jump to the scenario builder">
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] truncate">
                  {scenarioActive ? `${pickCount} pick${pickCount === 1 ? '' : 's'}${labActive ? ' · what-if' : ''}` : 'No picks yet'}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                  <span aria-hidden className="w-2 h-2 rounded-sm" style={{ background: 'var(--wcc-p1)' }} />
                  {players[1].shortName[0]} {formatPct(odds.pWin1)}
                  <span className="text-[var(--text-muted)]">·</span>
                  <span aria-hidden className="w-2 h-2 rounded-sm" style={{ background: 'var(--wcc-p2)' }} />
                  {players[2].shortName[0]} {formatPct(odds.pWin2)}
                </span>
              </span>
              {scenarioActive && <DeltaChip value={odds.pWin1} base={baseline.pWin1} className="shrink-0" />}
            </a>
            {scenarioActive && (
              <button type="button" onClick={resetAll} className="h-11 px-3 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]">
                Reset
              </button>
            )}
            <CopyLink label="Share" className="!h-11 border border-[var(--border)]" />
          </div>
        </div>
      )}
    </>
  );
}
