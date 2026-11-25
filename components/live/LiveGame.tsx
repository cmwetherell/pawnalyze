'use client';

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';

import { BoardControls } from '@/components/chess/BoardControls';
import { BoardPane } from '@/components/chess/BoardPane';
import { averageComplexity } from '@/components/chess/ComplexityChart';
import { ComplexityScale } from '@/components/chess/ComplexityScale';
import { MoveList } from '@/components/chess/MoveList';
import { PlayerClock } from '@/components/chess/PlayerClock';
import { Replay } from '@/components/chess/Replay';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Countdown } from '@/components/ui/Countdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heading } from '@/components/ui/Heading';
import { LocalTime } from '@/components/ui/LocalTime';
import { ScrollRow } from '@/components/ui/ScrollRow';
import { Segmented, type SegmentedItem } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatStrip } from '@/components/ui/StatStrip';
import type { StatProps } from '@/components/ui/Stat';
import { Tag, type TagTone } from '@/components/ui/Tag';
import { TextLink } from '@/components/ui/TextLink';
import { useNow } from '@/hooks/useNow';
import { setUrlParam, useUrlParam } from '@/hooks/useUrlParam';
import { moveLabel } from '@/lib/chess/moves';
import { BroadcastFeed, RoundsStore, defaultRound, type FeedSnapshot, type RoundInfo } from '@/lib/live/feed';
import { fenKey, fmtEval, parseLiveGame, type Color, type Evaluation, type LivePosition } from '@/lib/live/pgn';
import { complexityInputs, createComplexityStore, createEvalStore, evalInputs } from '@/lib/live/scores';
import { playerTone, type Tone } from '@/lib/theme/tones';
import { CLASSICAL_SCHEDULE, G1_WHITE, PLAYER_DEFAULTS, WCC_HREF } from '@/lib/wcc/config';
import { LICHESS_BROADCAST_ID } from '@/lib/wcc/lichess';
import { other, whiteInGame } from '@/lib/wcc/match';
import type { HalfPoints, PlayerId } from '@/lib/wcc/types';
import { LiveCharts, type ChartPoint } from './LiveCharts';

const EMPTY_GAME = parseLiveGame('');
/** Before Lichess answers: the published schedule, so the picker is there from the start. */
const SCHEDULED: RoundInfo[] = CLASSICAL_SCHEDULE.map(s => ({ id: '', gameNo: s.gameNo, startsAt: Date.parse(s.startsAt), ongoing: false, finished: false }));

function useStore<S>(store: { subscribe: (cb: () => void) => () => void; getSnapshot: () => S }): S {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/** Gukesh's half-points in each finished game. */
export type GameResults = Partial<Record<number, HalfPoints>>;

/** Live page for the match: picks the game, then follows it. */
export function LiveGame({ results }: { results: GameResults }) {
  const [store] = useState(() => new RoundsStore(LICHESS_BROADCAST_ID));
  useEffect(() => { store.start(); return () => store.stop(); }, [store]);
  const { rounds, failed } = useStore(store);
  const now = useNow(1000);
  const wanted = Number(useUrlParam('game'));
  // Any other broadcast round, for checking the page when the match is not being played.
  const otherRound = useUrlParam('round');

  if (otherRound && /^\w{8}$/.test(otherRound)) {
    return <GameView key={otherRound} round={{ id: otherRound, gameNo: 0, startsAt: null, ongoing: true, finished: false }} />;
  }
  const auto = rounds && now !== null ? defaultRound(rounds, now) : null;
  const round = rounds?.find(r => r.gameNo === wanted) ?? auto;
  const shown = rounds?.length ? rounds : SCHEDULED;

  return (
    <>
      <Container className="pb-6 pt-2 md:pb-8 md:pt-0">
        <GamePicker
          rounds={shown} results={results} current={round?.gameNo ?? (shown.some(r => r.gameNo === wanted) ? wanted : null)} clock={now !== null}
          onPick={no => setUrlParam('game', no === auto?.gameNo ? null : String(no))}
        />
      </Container>
      {round
        // A round that finishes while being watched keeps its feed (the key does not change).
        ? <GameView key={round.id} round={round} />
        : (
          <Section label="Game" layout="plain" rule={false}>
            {rounds && now !== null
              ? <EmptyState title="No games in the broadcast yet" />
              : <EmptyState busy title={failed ? 'Lichess cannot be reached right now' : 'Loading the broadcast'} body={failed ? 'Trying again.' : undefined} />}
          </Section>
        )}
    </>
  );
}

// ------------------------------------------------------------------ picker

const WORD: Record<HalfPoints, string> = { 2: `${PLAYER_DEFAULTS[1].shortName} won`, 1: 'draw', 0: `${PLAYER_DEFAULTS[2].shortName} won` };
const GLYPH: Record<HalfPoints, string> = { 2: PLAYER_DEFAULTS[1].shortName[0], 1: '½', 0: PLAYER_DEFAULTS[2].shortName[0] };

interface GamePickerProps { rounds: RoundInfo[]; results: GameResults; current: number | null; /** Local times are known. */ clock: boolean; onPick: (gameNo: number) => void }

function GamePicker({ rounds, results, current, clock, onPick }: GamePickerProps) {
  const items = rounds.map((r): SegmentedItem => {
    const result = r.ongoing ? undefined : results[r.gameNo];
    const started = clock && r.startsAt ? new Date(r.startsAt) : null;
    const when = started && `${started.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}, ${started.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    const state = r.ongoing ? 'live' : result !== undefined ? WORD[result] : r.finished ? 'finished' : null;
    return {
      value: String(r.gameNo),
      label: r.gameNo,
      note: result !== undefined ? GLYPH[result] : undefined,
      dot: r.ongoing,
      muted: !r.ongoing && !r.finished && result === undefined,
      href: `${WCC_HREF}/live?game=${r.gameNo}`,
      hint: when ?? undefined,
      ariaLabel: [`Game ${r.gameNo}`, state, when].filter(Boolean).join(', '),
    };
  });
  return (
    <ScrollRow label="Games" bleed follow='[aria-current="page"]' followKey={`${current}-${rounds.length}`}>
      <Segmented role="nav" ariaLabel="Games" size="sm" full items={items} value={current === null ? '' : String(current)} onChange={v => onPick(Number(v))} />
    </ScrollRow>
  );
}

// ------------------------------------------------------------------ one game

function StatusTag({ feed, round, now }: { feed: FeedSnapshot; round: RoundInfo; now: number | null }) {
  const started = (feed.game?.positions.length ?? 0) > 1;
  let tone: TagTone = 'neutral';
  let text: ReactNode;
  if (feed.game?.result) text = `Final, ${feed.game.result.replace('1/2-1/2', '½–½').replace('-', '–')}`;
  else if (feed.unreachable && !feed.game) { tone = 'warning'; text = 'Lichess unreachable, retrying'; }
  else if (feed.status === 'reconnecting') { tone = 'warning'; text = 'Reconnecting'; }
  else if (feed.status === 'connecting') text = 'Connecting';
  else if (started) { tone = 'live'; text = 'Live'; }
  else if (round.startsAt && now !== null && round.startsAt > now) text = <>Starts in <Countdown iso={new Date(round.startsAt).toISOString()} /></>;
  else text = 'Waiting for the first move';
  return <span role="status"><Tag tone={tone}>{text}</Tag></span>;
}

function fmtClock(s: number): string {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

interface SideInfo { name: string; rating: string | null; tone: Tone }

/** From the broadcast; before it arrives, from the color draw. */
function sideInfo(headers: Record<string, string>, c: Color, gameNo: number): SideInfo {
  const k = c === 'w' ? 'White' : 'Black';
  const fide = Number(headers[`${k}FideId`]);
  const white = gameNo > 0 ? whiteInGame(gameNo, G1_WHITE) : null;
  const drawn = white === null || headers[k] ? null : c === 'w' ? white : other(white);
  const id = ([1, 2] as PlayerId[]).find(p => PLAYER_DEFAULTS[p].fideId === fide) ?? drawn;
  return {
    name: id ? PLAYER_DEFAULTS[id].shortName : headers[k] ?? k,
    rating: headers[`${k}Elo`] ?? null,
    tone: playerTone(id ?? (c === 'w' ? 1 : 2)),
  };
}

function GameView({ round }: { round: RoundInfo }) {
  const isMatch = round.gameNo > 0;
  const [feed] = useState(() => new BroadcastFeed({
    roundId: round.id,
    finished: round.finished,
    pick: isMatch
      ? h => [h.WhiteFideId, h.BlackFideId].map(Number).sort().join() === [PLAYER_DEFAULTS[1].fideId, PLAYER_DEFAULTS[2].fideId].sort().join()
      : firstGamePicker(),
  }));
  const [evalStore] = useState(() => createEvalStore());
  const [complexityStore] = useState(() => createComplexityStore());
  useEffect(() => {
    feed.start();
    evalStore.start();
    complexityStore.start();
    const nudge = () => { if (!document.hidden) feed.nudge(); };
    document.addEventListener('visibilitychange', nudge);
    window.addEventListener('online', nudge);
    return () => {
      document.removeEventListener('visibilitychange', nudge);
      window.removeEventListener('online', nudge);
      feed.stop();
      evalStore.stop();
      complexityStore.stop();
    };
  }, [feed, evalStore, complexityStore]);

  const f = useStore(feed);
  const evals = useStore(evalStore);
  const complexities = useStore(complexityStore);
  const now = useNow(1000);

  const game = f.game ?? EMPTY_GAME;
  const positions = game.positions.length ? game.positions : EMPTY_GAME.positions;
  const inPlay = game.result === null && positions.length > 1;
  useEffect(() => {
    evalStore.want(evalInputs(positions), inPlay);
    complexityStore.want(complexityInputs(positions), inPlay);
  }, [positions, inPlay, evalStore, complexityStore]);

  // null = follow the game.
  const [pinned, setPinned] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const last = positions.length - 1;
  const ply = pinned === null ? last : Math.min(pinned, last);
  const go = (n: number) => setPinned(n >= last ? null : Math.max(0, n));
  const flip = () => setFlipped(v => !v);

  const points: ChartPoint[] = useMemo(() => positions.map(pos => ({
    pos,
    complexity: pos.over ? null : complexities.values.get(fenKey(pos.fen)) ?? null,
    evaluation: pos.evaluation ?? evals.values.get(fenKey(pos.fen)) ?? null,
  })), [positions, complexities.values, evals.values]);

  const loadingMoves = round.finished && f.game === null;
  const cur = points[ply];
  // While the newest position has no evaluation yet, show the one before it, marked as such.
  const prevEval = loadingMoves ? null : cur.evaluation ?? (ply > 0 ? points[ply - 1].evaluation : null);
  const stale = !cur.evaluation && prevEval !== null;
  const sides: Record<Color, SideInfo> = { w: sideInfo(game.headers, 'w', round.gameNo), b: sideInfo(game.headers, 'b', round.gameNo) };
  const names = { w: sides.w.name, b: sides.b.name };
  const clockOf = (c: Color): { value: number | null; running: boolean } => {
    const own = [...positions.slice(0, ply + 1)].reverse().find(p => p.clock !== null && p.ply > 0 && p.toMove !== c);
    const value = own?.clock ?? null;
    const running = inPlay && ply === last && cur.pos.toMove === c;
    if (value === null || !running || f.lastMoveAt === null || now === null) return { value, running };
    return { value: value - (now - f.lastMoveAt) / 1000, running };
  };
  const nameLine = (c: Color) => {
    const k = clockOf(c);
    return <PlayerClock name={sides[c].name} rating={sides[c].rating} tone={sides[c].tone} clock={k.value === null ? null : fmtClock(k.value)} running={k.running} />;
  };

  const opening = game.headers.Opening && game.headers.Opening !== '?' ? game.headers.Opening : null;
  const source = game.headers.GameURL ?? `https://lichess.org/broadcast/-/-/${round.id}`;

  return (
    <>
      <Section label="Game" layout="plain">
        <Replay
          size="lg"
          label="Game; use the arrow keys to step through the moves"
          ply={ply} last={last} onGo={go} onFlip={flip}
          head={(
            <div className="flex flex-col gap-3">
              <Heading level={2} style="h2">{isMatch ? `Game ${round.gameNo}: ` : ''}{names.w} – {names.b}</Heading>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <StatusTag feed={f} round={round} now={now} />
                {opening && <span className="type-small text-ink-2">{opening}</span>}
              </div>
            </div>
          )}
          board={(
            <BoardPane
              fen={cur.pos.fen} from={cur.pos.from} to={cur.pos.to} flipped={flipped} label={`Position after ${moveLabel(cur.pos)}`}
              evaluation={prevEval} stale={stale}
              top={nameLine(flipped ? 'w' : 'b')} bottom={nameLine(flipped ? 'b' : 'w')}
              controls={<BoardControls ply={ply} last={last} onGo={go} onFlip={flip} live={{ behind: pinned !== null && inPlay, onLive: () => setPinned(null) }} />}
            />
          )}
          aside={(
            <>
              <StatStrip
                columns={2}
                items={[
                  evalStat({ evaluation: prevEval, stale, names, failing: evals.failures >= 3, over: cur.pos.over }),
                  complexityStat({ value: loadingMoves ? null : cur.complexity, pos: cur.pos, mover: names[cur.pos.toMove], result: ply === last ? game.result : null, failing: complexities.failures > 0 }),
                ]}
              />
              {last > 0 ? (
                <MoveList moves={points.slice(1).map(p => ({ san: p.pos.san ?? '', meta: p.evaluation ? fmtEval(p.evaluation) : undefined }))} ply={ply} onGo={go} maxHeight={220} fill />
              ) : loadingMoves ? (
                <Skeleton kind="lines" rows={8} label="Loading the moves" />
              ) : (
                <p className="type-body text-ink-2">
                  {round.startsAt && now !== null && round.startsAt > now && <>The game starts on <LocalTime iso={new Date(round.startsAt).toISOString()} />. </>}
                  The moves appear here as they are played; keep this page open.
                </p>
              )}
              {game.truncated && <p className="type-small text-ink-2">Part of the broadcast could not be read; later moves appear once Lichess corrects it.</p>}
            </>
          )}
        />
      </Section>

      <Section
        id="live-charts" title="Complexity and evaluation" layout="wide"
        finding={(
          <>
            <Finding points={points} names={names} />
            Complexity is <TextLink href="/elocator">Elocator</TextLink>&rsquo;s 1 to 100 rating of how hard the position is for the player to move: 70 means harder than 70% of positions from tournament games between players rated 2000+.{last > 0 && ' Tap or click the chart to see a position.'}
          </>
        )}
      >
        {last > 0
          ? <LiveCharts points={points} selected={ply} onSelect={go} sides={sides} inPlay={inPlay} />
          : <EmptyState level={3} busy={loadingMoves} title={loadingMoves ? 'Loading the moves' : 'No moves yet'} body={loadingMoves ? undefined : 'Both charts begin with the first move.'} />}
        <p className="mt-8 type-small text-ink-2">
          Moves and clocks: <TextLink href={source}>Lichess broadcast</TextLink>. Evaluation: Stockfish, from Lichess&rsquo;s analysis and cloud evaluations.
          {isMatch && <> <TextLink href={WCC_HREF}>Match odds and predictions</TextLink>.</>}
        </p>
      </Section>
    </>
  );
}

/** The averages and the hardest position, once nearly every position has its score. */
function Finding({ points, names }: { points: ChartPoint[]; names: Record<Color, string> }) {
  const scored = points.filter(p => p.complexity !== null);
  if (points.length < 11 || scored.length < points.length * 0.9) return null;
  const at = points.map(p => ({ ply: p.pos.ply, san: p.pos.san, toMove: p.pos.toMove, complexity: p.complexity }));
  const [w, b] = [averageComplexity(at, 'w'), averageComplexity(at, 'b')];
  const top = scored.reduce((m, p) => ((p.complexity as number) > (m.complexity as number) ? p : m));
  if (w === null || b === null) return null;
  return (
    <span className="font-medium text-ink">
      {names.w}&rsquo;s positions average {Math.round(w)}, {names.b}&rsquo;s {Math.round(b)}. The hardest scores {top.complexity}: {names[top.pos.toMove]} to move {top.pos.ply === 0 ? 'at the start' : `after ${moveLabel(top.pos)}`}.{' '}
    </span>
  );
}

/** Follow whichever game of a multi-board round arrives first. */
function firstGamePicker() {
  let url: string | null = null;
  return (h: Record<string, string>) => {
    url ??= h.GameURL ?? null;
    return h.GameURL === url;
  };
}

interface EvalStatInput { evaluation: Evaluation | null; stale: boolean; names: Record<Color, string>; failing: boolean; over: boolean }

function evalStat({ evaluation, stale, names, failing, over }: EvalStatInput): StatProps {
  let note: string;
  if (over) note = 'Game over on the board';
  else if (!evaluation) note = failing ? 'Evaluation source unreachable, retrying' : 'Waiting for an evaluation';
  else if (stale) note = 'Previous move; evaluating this one';
  else {
    const ahead = evaluation.mate !== undefined ? (evaluation.mate > 0 ? 'w' : 'b') : Math.abs(evaluation.cp ?? 0) < 30 ? null : (evaluation.cp ?? 0) > 0 ? 'w' : 'b';
    note = ahead ? `${names[ahead]} is better` : 'About equal';
    if (evaluation.depth) note += `, depth ${Math.min(evaluation.depth, 99)}`;
  }
  return { label: 'Stockfish', size: 'lg', value: <span className={stale ? 'text-ink-3' : undefined}>{evaluation ? fmtEval(evaluation) : '–'}</span>, sub: note };
}

interface ComplexityStatInput { value: number | null; pos: LivePosition; mover: string; result: string | null; failing: boolean }

function complexityStat({ value, pos, mover, result, failing }: ComplexityStatInput): StatProps {
  const note = pos.over ? 'No move to find'
    : value === null ? (failing ? 'Elocator is waking up, retrying' : 'Scoring this position')
      : result ? 'Final position' : `${mover} to move`;
  return { label: 'Complexity', size: 'lg', value: value ?? '–', visual: value !== null ? <ComplexityScale score={value} /> : undefined, sub: note };
}
