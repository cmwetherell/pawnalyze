'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { FaceOff } from '@/components/chess/FaceOff';
import { GameSheet, type GameCellView } from '@/components/chess/GameSheet';
import { OddsChip } from '@/components/chess/OddsChip';
import { PieceDot } from '@/components/chess/PieceDot';
import { BottomBar } from '@/components/layout/BottomBar';
import { Container } from '@/components/layout/Container';
import { HeroEnter } from '@/components/layout/HeroEnter';
import { Section } from '@/components/layout/Section';
import { SectionBar, type SectionBarProps } from '@/components/layout/SectionBar';
import { SectionGroup } from '@/components/layout/SectionGroup';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { CopyButton } from '@/components/ui/CopyButton';
import { Delta } from '@/components/ui/Delta';
import { IconButton } from '@/components/ui/IconButton';
import { PhotoCreditLine } from '@/components/ui/PhotoCredit';
import { Segmented } from '@/components/ui/Segmented';
import { StatStrip } from '@/components/ui/StatStrip';
import { Swatch } from '@/components/ui/Swatch';
import { formatPct, inHundred } from '@/lib/format';
import { LIVE_REFRESH_MS, N_CLASSICAL, WCC_HREF } from '@/lib/wcc/config';
import { genevaDay, type Players } from '@/lib/wcc/display';
import { exact, gameOdds, whiteInGame } from '@/lib/wcc/match';
import { ZERO_OFFSETS, adjustedWdl, drawRate, type RatingOffsets } from '@/lib/wcc/model';
import { PICK_HP, parseColor, parseOffsets, parsePicks, parseTheta, writeScenario, type PickOutcome } from '@/lib/wcc/scenario';
import { currentOdds, isLagging, matchState, wonLine } from '@/lib/wcc/status';
import type { HalfPoints, HistoryPoint, MarketRow, MatchOdds, ModelGrid, PlayerId, WccGame, WccRun, WccSummary } from '@/lib/wcc/types';
import { MatchEnding } from './MatchEnding';
import { MatchScore, NextGame, scoreLabel } from './MatchNow';
import { FACE_OFF_CHANGES, FACE_OFF_PHOTOS, PAWN_NOTE, faceOffSides, oddsSides } from './players';
import { PrizeCard } from './PrizeCard';
import { Schedule, liveHref } from './Schedule';
import { SimReplay } from './SimReplay';
import { WhatIfLab, type GridState } from './WhatIfLab';
import { WinProbHistory } from './WinProbHistory';

interface Props {
  players: Players;
  games: WccGame[];
  run: WccRun;
  /** Headline odds for the current state (or frozen before the decisive game once decided). */
  summary: WccSummary;
  history: HistoryPoint[];
  markets: MarketRow[];
  /** Last stored Kalshi price for Gukesh, 0..1, and when it was taken ("after game 1"). */
  kalshi: { p: number; when: string } | null;
  /** The match is decided; odds are frozen as they stood before the decisive game. */
  finished: boolean;
  slots: { markets: ReactNode; h2h: ReactNode; methodology: ReactNode };
}

const HERO = 'headline';
const COLOR_UNKNOWN = '0';

const navFor = (finished: boolean): SectionBarProps['groups'] => [
  {
    label: 'Forecast',
    items: [
      { id: 'odds', label: 'Odds' },
      { id: 'scenario', label: finished ? 'Games' : 'Scenarios' },
      { id: 'when', label: 'Endings', also: ['scores', 'how-it-ends'] },
    ],
  },
  ...(finished ? [] : [{ label: 'Play', items: [{ id: 'replay', label: 'Replay' }, { id: 'what-if', label: 'What-if' }] }]),
  {
    label: 'Context',
    items: [
      { id: 'markets', label: 'Markets', also: ['history'] },
      { id: 'head-to-head', label: 'Form', also: ['prize'] },
      { id: 'schedule', label: 'Schedule' },
      { id: 'methodology', label: 'Method', also: ['photo-credits'] },
    ],
  },
];

export default function WccDashboard({ players, games, run, summary, history, markets, kalshi, finished, slots }: Props) {
  const router = useRouter();
  const state = useMemo(() => matchState(games, run.params.g1_white ?? null), [games, run.params.g1_white]);
  const colorKnown = state.g1White !== null;
  const runTheta = run.params.theta?.classical ?? 1;

  const [picks, setPicks] = useState<Map<number, PickOutcome>>(() => new Map());
  const [color, setColor] = useState<PlayerId | null>(null);
  const [offsets, setOffsets] = useState<RatingOffsets>(ZERO_OFFSETS);
  const [theta, setTheta] = useState<number>(runTheta);
  const [grid, setGrid] = useState<ModelGrid | null>(null);
  const [gridState, setGridState] = useState<GridState>('idle');
  const [restoreNote, setRestoreNote] = useState<string | null>(null);
  /** What a pointed-at pick would make Gukesh's odds. */
  const [preview, setPreview] = useState<number | null>(null);
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
    const c = parseColor(qs.get('c'));
    const r = parseOffsets(qs.get('r'));
    const t = parseTheta(qs.get('t'));
    restored.current = true;
    if (finished) return;
    if (p.size) setPicks(p);
    if (c !== null && !colorKnown) setColor(c);
    if (r.g !== 0 || r.s !== 0) { setOffsets(r); requestGrid(); }
    if (t !== null) setTheta(t);
    if (dropped > 0) setRestoreNote(`${dropped} shared pick${dropped === 1 ? ' is' : 's are'} already decided or invalid and ${dropped === 1 ? 'was' : 'were'} dropped.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync so any scenario can be shared.
  useEffect(() => {
    if (!restored.current) return;
    const url = new URL(window.location.href);
    writeScenario(url, { picks, g1White: color, offsets, theta }, runTheta, colorKnown);
    // Keep shared links readable: ?s=3:1,5:d rather than ?s=3%3A1%2C5%3Ad.
    const next = url.toString().replace(/%3A/gi, ':').replace(/%2C/gi, ',');
    if (next !== window.location.href) window.history.replaceState(null, '', next);
  }, [picks, color, offsets, theta, runTheta, colorKnown]);

  // Live days: pick up new results and runs without a manual reload.
  useEffect(() => {
    if (!state.anyLive) return;
    const id = setInterval(() => router.refresh(), LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [state.anyLive, router]);

  // ---- exact odds

  const effG1: PlayerId | null = colorKnown ? state.g1White : color;
  const labActive = offsets.g !== 0 || offsets.s !== 0 || Math.abs(theta - runTheta) > 1e-9;
  const wdl = useMemo(
    () => (labActive ? adjustedWdl(summary.wdl, run.params, grid, offsets, theta) : summary.wdl),
    [labActive, summary.wdl, run.params, grid, offsets, theta],
  );
  const lagging = !finished && isLagging(run, state);

  // Baseline: the stored summary, or (if results arrived after the last run) the same exact
  // computation with those results applied.
  // Once decided, currentOdds freezes them as they stood before the decisive game (or at 7–7).
  const baseline: MatchOdds = useMemo(() => currentOdds(summary, run, state), [summary, run, state]);

  // Odds over time: a point for every game since the last stored run, computed exactly from the
  // results up to that game (the same numbers a pipeline run would store).
  const historyNow: HistoryPoint[] = useMemo(() => {
    const extra: HistoryPoint[] = [];
    const known = new Set(history.map(h => `${h.afterGame}:${h.tbGames}`));
    for (let g = run.afterGame + 1; g <= state.lastFinal; g++) {
      if (known.has(`${g}:0`)) continue;
      const fixed = new Map([...state.fixed].filter(([n]) => n <= g));
      const o = exact({ wdl: summary.wdl, fixed, g1White: state.g1White, tb: [] });
      const game = state.classical[g - 1];
      extra.push({ runId: -g, afterGame: g, tbGames: 0, createdAt: game?.startsAt ?? new Date(0).toISOString(), pWin1: o.pWin1, pTb: o.pTb });
    }
    if (state.tbFixed.length > run.tbGames && !known.has(`${N_CLASSICAL}:${state.tbFixed.length}`)) {
      const o = exact({ wdl: summary.wdl, fixed: state.fixed, g1White: state.g1White, tb: state.tbFixed });
      extra.push({ runId: -100, afterGame: N_CLASSICAL, tbGames: state.tbFixed.length, createdAt: new Date().toISOString(), pWin1: o.pWin1, pTb: o.pTb });
    }
    return extra.length ? [...history, ...extra] : history;
  }, [history, state, run.afterGame, run.tbGames, summary.wdl]);

  const fixedAll = useMemo(() => {
    const m = new Map<number, HalfPoints>(state.fixed);
    for (const [g, o] of picks) if (!m.has(g)) m.set(g, PICK_HP[o]);
    return m;
  }, [state.fixed, picks]);

  const scenarioActive = !finished && (picks.size > 0 || (!colorKnown && color !== null) || labActive);
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

  const cells: GameCellView[] = useMemo(() => {
    const nextNo = finished || state.anyLive ? undefined : state.classical.find(g => g.status === 'scheduled')?.gameNo;
    return state.classical.map(game => {
      const white = game.whitePlayerId ?? (effG1 !== null ? whiteInGame(game.gameNo, effG1) : null);
      const result = state.fixed.get(game.gameNo) ?? null;
      const pPlayed = odds.gamePlayed[game.gameNo - 1] ?? 1;
      return {
        gameNo: game.gameNo,
        dateLabel: genevaDay(game.startsAt),
        whiteName: white === null ? null : players[white].shortName,
        whiteAssumed: game.whitePlayerId === null && !colorKnown && white !== null,
        odds: gameOdds(wdl, game.gameNo, effG1),
        pPlayed,
        result,
        live: game.status === 'live',
        next: game.gameNo === nextNo,
        unreachable: result === null && (finished || pPlayed < 1e-9),
        pick: picks.get(game.gameNo),
        swing: swings.get(game.gameNo) ?? null,
        href: liveHref(game.gameNo),
      };
    });
  }, [state, finished, effG1, colorKnown, wdl, odds.gamePlayed, picks, swings, players]);

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

  const setPick = useCallback((g: number, v: PickOutcome | null) => {
    setPicks(prev => {
      const next = new Map(prev);
      if (v === null) next.delete(g); else next.set(g, v);
      return next;
    });
  }, []);
  const resetAll = useCallback(() => {
    // The button that was pressed goes away, so the keyboard stays with the scenario.
    const heading = document.querySelector<HTMLElement>('#scenario h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    setPicks(new Map());
    setColor(null);
    setOffsets(ZERO_OFFSETS);
    setTheta(runTheta);
    setRestoreNote(null);
  }, [runTheta]);
  const onLab = useCallback((o: RatingOffsets, t: number) => { setOffsets(o); setTheta(t); }, []);

  // ---- words

  const [p1, p2] = [players[1], players[2]];
  const pickCount = picks.size;
  const labelParts = [
    pickCount ? `your ${pickCount} pick${pickCount === 1 ? '' : 's'}` : null,
    !colorKnown && color !== null ? `${players[color].shortName} White in game 1` : null,
    labActive ? 'the what-if settings' : null,
  ].filter(Boolean);
  const joined = labelParts.length > 1 ? `${labelParts.slice(0, -1).join(', ')} and ${labelParts[labelParts.length - 1]}` : labelParts[0];
  const scenarioLabel = scenarioActive && joined ? `With ${joined}:` : null;
  const byColor = { '1': odds.byColor['1']?.p_win1 ?? odds.pWin1, '2': odds.byColor['2']?.p_win1 ?? odds.pWin1 };
  const champion = finished && state.winner ? players[state.winner] : null;
  const fav = odds.pWin1 >= 0.5 ? p1 : p2;
  const nSims = run.rebasedFrom || lagging ? null : run.nSims;
  const draws = drawRate(wdl);
  // What the headline includes beyond the stored run.
  const freshness = [
    run.rebasedFrom ? `the match-start ratings (${p1.shortName} ${p1.ratings.classical}, ${p2.shortName} ${p2.ratings.classical})` : null,
    lagging && state.lastFinal > run.afterGame
      ? `results since the last simulation run (${state.lastFinal > run.afterGame + 1 ? `games ${run.afterGame + 1}–${state.lastFinal}` : `game ${state.lastFinal}`})`
      : lagging ? `the color draw (${players[state.g1White ?? 1].shortName} White in game 1)` : null,
  ].filter((x): x is string => x !== null);
  const source = scenarioLabel
    ? 'Exact odds, recomputed for this scenario.'
    : nSims !== null ? `Exact odds, confirmed by ${nSims.toLocaleString('en-US')} simulations.`
      : freshness.length > 0 ? `Exact odds. They include ${freshness.join(' and ')}; the simulations catch up at the next run.` : 'Exact odds.';

  const last = state.lastFinal > 0 ? state.fixed.get(state.lastFinal) : undefined;
  const lastGame = last === undefined
    ? { value: 'None yet', sub: 'Game 1 is on Nov 24' }
    : { value: last === 1 ? 'Draw ½–½' : `${players[last === 2 ? 1 : 2].shortName} won`, sub: `Game ${state.lastFinal}, ${genevaDay(state.classical[state.lastFinal - 1].startsAt)}` };
  const rating = (tc: 'classical' | 'rapid' | 'blitz', label: string) => ({
    key: tc,
    label: `${label} rating`,
    value: (
      <span className="inline-flex flex-wrap items-baseline gap-x-4">
        {([1, 2] as const).map(id => (
          <span key={id} className="inline-flex items-baseline gap-2">
            <Swatch tone={id === 1 ? 'p1' : 'p2'} /><span className="sr-only">{players[id].shortName} </span>{players[id].ratings[tc] || '–'}
          </span>
        ))}
      </span>
    ),
    sub: `${p1.shortName}, ${p2.shortName}`,
  });

  const groups = useMemo(() => navFor(finished), [finished]);
  const sides = oddsSides(players, odds.pWin1);

  return (
    <>
      <section id="odds" aria-label="Match odds" className="scroll-mt-bar pb-8">
        <Container>
          <HeroEnter>
            <div id={HERO}>
              <FaceOff
                variant="hero"
                sides={faceOffSides(players)}
                p1={odds.pWin1}
                base={scenarioActive ? baseline.pWin1 : null}
                preview={preview}
                score={<MatchScore state={state} players={players} />}
                scoreLabel={scoreLabel(state)}
                champion={champion ? { name: champion.name, line: wonLine(state) } : null}
                verdict={
                  champion ? (
                    <>Before the decisive game our odds were {p1.shortName} {formatPct(odds.pWin1)}, {p2.shortName} {formatPct(odds.pWin2)}. <span className="block text-ink-3">Every number below is frozen as it stood then.</span></>
                  ) : (
                    <>
                      {scenarioLabel && <>{scenarioLabel} </>}
                      {fav.shortName} wins {inHundred(Math.max(odds.pWin1, odds.pWin2))} matches. {odds.pTb > 1 - 1e-6 ? 'The tiebreaks decide it.' : `${formatPct(odds.pTb)} go to tiebreaks.`}
                      {!scenarioLabel && kalshi && <span className="block text-ink-3">Kalshi traders gave {p1.shortName} {formatPct(kalshi.p)} {kalshi.when}.</span>}
                    </>
                  )
                }
                notes={[champion ? 'Chance before the decisive game. Each pawn is 1\u00a0in\u00a0100.' : PAWN_NOTE, source]}
                next={champion ? undefined : <><span className="block font-medium text-ink"><NextGame state={state} /></span>Live board, evaluation and complexity</>}
                actions={
                  champion ? (
                    <>
                      <Button variant="primary" href={`${WCC_HREF}/live`}>Replay the games</Button>
                      <Button href="#scenario">Game by game</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="primary" live={state.anyLive} href={`${WCC_HREF}/live`}>
                        {state.live?.stage === 'classical' ? `Watch game ${state.live.gameNo} live` : 'Watch live'}
                      </Button>
                      <Button href="#scenario">Pick results</Button>
                    </>
                  )
                }
                credit={<PhotoCreditLine photos={FACE_OFF_PHOTOS} changes={FACE_OFF_CHANGES} />}
              />
            </div>
          </HeroEnter>
          <StatStrip
            className="mt-8"
            columns={6}
            items={[
              rating('classical', 'Classical'),
              rating('rapid', 'Rapid'),
              rating('blitz', 'Blitz'),
              { label: 'Goes to tiebreaks', value: formatPct(odds.pTb), delta: scenarioActive && <Delta value={odds.pTb} base={baseline.pTb} short quiet />, sub: 'of matches' },
              { label: 'Last game', ...lastGame },
              { label: 'Draw rate', value: formatPct(draws, 0), sub: 'of classical games' },
            ]}
          />
        </Container>
      </section>

      <SectionBar
        groups={groups}
        heroId={HERO}
        eventLabel="World Championship"
        live={<OddsChip sides={sides} preview={preview} />}
        // Icons: the same two buttons, with their words, head the section below. Reset keeps its place, so a first pick moves no link.
        actions={!finished && <><IconButton icon="reset" label="Reset" onClick={resetAll} className={scenarioActive ? undefined : 'invisible'} /><CopyButton kind="link" label="Share scenario" variant="icon" /></>}
      />

      <Container>
        <div aria-live="polite">
          {restoreNote && <Callout className="mb-section" onDismiss={() => setRestoreNote(null)}>{restoreNote}</Callout>}
        </div>
      </Container>

      <SectionGroup label="Forecast">
        <Section
          id="scenario"
          layout="wide"
          title={finished ? 'Game by game' : 'Pick the results'}
          finding={finished ? 'Every classical game of the match. A game number opens its board and moves.' : 'Choose a result for any game and every number on this page updates at once. A game number opens its live board.'}
          actions={!finished && <>{scenarioActive && <Button size="sm" icon="reset" onClick={resetAll} className="max-lg:order-last lg:max-[1439px]:hidden">Reset</Button>}<CopyButton kind="link" label="Share scenario" variant="secondary" /></>}
          legend={!finished && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2 type-small text-ink-2">
              <li className="inline-flex items-center gap-2"><PieceDot side="white" />Has White{!colorKnown && color !== null ? ' (assumed until the Nov 22 draw)' : ''}</li>
              <li>Percentages are {p1.shortName} win, draw, {p2.shortName} win for that game{effG1 === null ? ', averaged over the color draw' : ''}.</li>
            </ul>
          )}
        >
          {!finished && !colorKnown && (
            <div className="mb-6 flex flex-col items-start gap-2">
              <p aria-hidden className="type-ui text-ink">White in game 1</p>
              <Segmented
                ariaLabel="White in game 1"
                value={String(color ?? 0)}
                onChange={v => setColor(v === COLOR_UNKNOWN ? null : Number(v) as PlayerId)}
                items={[
                  { value: COLOR_UNKNOWN, label: 'Not drawn yet', hint: '50/50 average' },
                  { value: '1', label: `${p1.shortName} (${p1.shortName} ${formatPct(byColor['1'])})` },
                  { value: '2', label: `${p2.shortName} (${p1.shortName} ${formatPct(byColor['2'])})` },
                ]}
              />
            </div>
          )}
          <GameSheet games={cells} players={players} locked={finished} onPick={setPick} onPreview={finished ? undefined : setPreview} />
        </Section>
        <MatchEnding odds={odds} players={players} finished={finished} />
      </SectionGroup>

      {!finished && (
        <SectionGroup label="Play" ground="surface">
          <SimReplay wdl={summary.wdl} fixed={state.fixed} g1White={state.g1White} tb={state.tbFixed} players={players} />
          <WhatIfLab
            players={players} offsets={offsets} theta={theta} runTheta={runTheta} onChange={onLab} gridState={gridState} requestGrid={requestGrid}
            pWin1={odds.pWin1} basePWin1={baseline.pWin1} drawRate={draws} breakEven={breakEven}
          />
        </SectionGroup>
      )}

      <SectionGroup label="Context">
        <WinProbHistory history={historyNow} markets={markets} players={players} />
        {slots.markets}
        <Section layout="split" label="Prize money and form">
          <PrizeCard prize={odds.prize} base={scenarioActive ? baseline.prize : null} players={players} />
          {slots.h2h}
        </Section>
        <Schedule games={state.classical} players={players} />
        {slots.methodology}
      </SectionGroup>

      {!finished && (
        <BottomBar label="Match odds" heroId={HERO}>
          <a
            href="#scenario"
            aria-label={`Jump to the scenario builder. ${sides.map(s => `${s.name} ${formatPct(s.p)}`).join(', ')}`}
            className="flex min-w-0 flex-1"
          >
            <OddsChip variant="halves" sides={sides} preview={preview} />
          </a>
          {scenarioActive && <IconButton icon="reset" label={pickCount ? `Reset ${pickCount} pick${pickCount === 1 ? '' : 's'}` : 'Reset'} onClick={resetAll} />}
          <CopyButton kind="link" label="Share scenario" variant="icon" />
        </BottomBar>
      )}
    </>
  );
}
