'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import BoardSvg from '@/components/chess/BoardSvg';
import ComplexityBar from '@/components/elocator/ComplexityBar';
import { CompactCountdown, localDay, localTime, useNow } from '@/components/wcc/MatchStatus';
import { P_COLOR } from '@/components/wcc/ui';
import { setUrlParam, useUrlParam } from '@/hooks/useUrlParam';
import { BroadcastFeed, RoundsStore, defaultRound, type FeedSnapshot, type RoundInfo } from '@/lib/live/feed';
import { START_FEN, fenKey, fmtEval, parseLiveGame, type Colour, type Evaluation, type LivePosition } from '@/lib/live/pgn';
import { complexityInputs, createComplexityStore, createEvalStore, evalInputs } from '@/lib/live/scores';
import { PLAYER_DEFAULTS, WCC_HREF } from '@/lib/wcc/config';
import { LICHESS_BROADCAST_ID } from '@/lib/wcc/lichess';
import type { PlayerId } from '@/lib/wcc/types';
import EvalBar from './EvalBar';
import LiveCharts, { moveLabel, type ChartPoint } from './LiveCharts';

const EMPTY_GAME = parseLiveGame('');

function useStore<S>(store: { subscribe: (cb: () => void) => () => void; getSnapshot: () => S }): S {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/** Live page for the match: picks the game, then follows it. */
export default function LiveGame() {
  const [store] = useState(() => new RoundsStore(LICHESS_BROADCAST_ID));
  useEffect(() => { store.start(); return () => store.stop(); }, [store]);
  const { rounds, failed } = useStore(store);
  const now = useNow();
  const wanted = Number(useUrlParam('game'));
  // Any other broadcast round, for checking the page when the match is not being played.
  const other = useUrlParam('round');

  if (other && /^\w{8}$/.test(other)) {
    return <GameView key={other} round={{ id: other, gameNo: 0, startsAt: null, ongoing: true, finished: false }} />;
  }
  if (!rounds || now === null) {
    return (
      <div className="surface-card p-8 text-center text-sm text-[var(--text-muted)]">
        {failed ? 'Lichess cannot be reached right now. Trying again…' : 'Loading the broadcast…'}
      </div>
    );
  }
  const auto = defaultRound(rounds, now);
  const round = rounds.find(r => r.gameNo === wanted) ?? auto;
  if (!round) return <div className="surface-card p-8 text-center text-sm text-[var(--text-muted)]">No games in the broadcast yet.</div>;

  return (
    <div className="space-y-4">
      <nav aria-label="Games" className="flex flex-wrap gap-1.5">
        {rounds.map(r => {
          const on = r.id === round.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setUrlParam('game', r.id === auto?.id ? null : String(r.gameNo))}
              aria-current={on ? 'page' : undefined}
              title={r.startsAt ? `${localDay(new Date(r.startsAt).toISOString())}, ${localTime(new Date(r.startsAt).toISOString())}` : undefined}
              className={`h-9 min-w-9 px-2.5 rounded-md text-sm font-medium tabular-nums border transition-colors ${on
                ? 'bg-chess-gold/15 border-chess-gold/50 text-[var(--text-primary)]'
                : r.finished || r.ongoing
                  ? 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'
                  : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)]'}`}
            >
              {r.ongoing && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-live mr-1.5 align-middle" aria-label="live" />}
              G{r.gameNo}
            </button>
          );
        })}
      </nav>
      {/* A round that finishes while being watched keeps its feed (the key does not change). */}
      <GameView key={round.id} round={round} />
    </div>
  );
}

function StatusPill({ feed, round, now }: { feed: FeedSnapshot; round: RoundInfo; now: number | null }) {
  const started = (feed.game?.positions.length ?? 0) > 1;
  const pill = (cls: string, dot: string, text: React.ReactNode) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs font-semibold ${cls}`} role="status">
      <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden /> {text}
    </span>
  );
  const quiet = 'bg-[var(--bg-surface-3)] text-[var(--text-secondary)]';
  if (feed.game?.result) return pill(quiet, 'bg-[var(--text-muted)]', `Final · ${feed.game.result.replace('1/2-1/2', '½–½')}`);
  if (feed.unreachable && !feed.game) return pill(quiet, 'bg-amber-500', 'Lichess unreachable, retrying');
  if (feed.status === 'reconnecting') return pill(quiet, 'bg-amber-500', 'Reconnecting');
  if (feed.status === 'connecting') return pill(quiet, 'bg-amber-500', 'Connecting');
  if (started) return pill('bg-red-500/10 text-red-500', 'bg-red-500 animate-pulse-live', 'Live');
  if (round.startsAt && now !== null && round.startsAt > now) {
    return pill(quiet, 'bg-[var(--text-muted)]', <CompactCountdown to={new Date(round.startsAt).toISOString()} label="Starts in" />);
  }
  return pill(quiet, 'bg-amber-500', 'Waiting for the first move');
}

function fmtClock(s: number): string {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

interface SideInfo { name: string; rating: string | null; playerId: PlayerId | null }

function PlayerRow({ side, clock, running, colour }: { side: SideInfo; clock: number | null; running: boolean; colour: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colour }} aria-hidden />
      <span className="font-semibold text-[var(--text-primary)] truncate">{side.name}</span>
      {side.rating && <span className="text-xs text-[var(--text-muted)] tabular-nums">{side.rating}</span>}
      {clock !== null && (
        <span className={`ml-auto px-2 py-0.5 rounded font-mono text-sm tabular-nums ${running ? 'bg-chess-gold/20 text-[var(--text-primary)] font-semibold' : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)]'}`}>
          {fmtClock(clock)}
        </span>
      )}
    </div>
  );
}

function sideInfo(headers: Record<string, string>, c: Colour): SideInfo {
  const k = c === 'w' ? 'White' : 'Black';
  const fide = Number(headers[`${k}FideId`]);
  const playerId = ([1, 2] as PlayerId[]).find(id => PLAYER_DEFAULTS[id].fideId === fide) ?? null;
  return {
    name: playerId ? PLAYER_DEFAULTS[playerId].shortName : headers[k] ?? (c === 'w' ? 'White' : 'Black'),
    rating: headers[`${k}Elo`] ?? null,
    playerId,
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
  const now = useNow();

  const game = f.game ?? EMPTY_GAME;
  const { positions } = game;
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

  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    // Scroll only the list, never the page, as new moves arrive.
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !el) return;
    const top = el.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top - list.clientHeight / 2;
  }, [ply, last]);

  const points: ChartPoint[] = useMemo(() => positions.map(pos => ({
    pos,
    complexity: pos.over ? null : complexities.values.get(fenKey(pos.fen)) ?? null,
    evaluation: pos.evaluation ?? evals.values.get(fenKey(pos.fen)) ?? null,
  })), [positions, complexities.values, evals.values]);

  const cur = points[ply];
  // While the newest position has no evaluation yet, show the one before it, marked as such.
  const prevEval = cur.evaluation ?? (ply > 0 ? points[ply - 1].evaluation : null);
  const stale = !cur.evaluation && prevEval !== null;
  const white = sideInfo(game.headers, 'w');
  const black = sideInfo(game.headers, 'b');
  const sides: Record<Colour, SideInfo> = { w: white, b: black };
  const names = { w: white.name, b: black.name };
  const colours: Record<Colour, string> = { w: P_COLOR[white.playerId ?? 1], b: P_COLOR[black.playerId ?? 2] };
  const clockOf = (c: Colour): { value: number | null; running: boolean } => {
    const own = [...positions.slice(0, ply + 1)].reverse().find(p => p.clock !== null && p.ply > 0 && p.toMove !== c);
    const value = own?.clock ?? null;
    const running = inPlay && ply === last && cur.pos.toMove === c;
    if (value === null || !running || f.lastMoveAt === null || now === null) return { value, running };
    return { value: value - (now - f.lastMoveAt) / 1000, running };
  };

  const top: Colour = flipped ? 'w' : 'b';
  const bottom: Colour = flipped ? 'b' : 'w';
  const ctrl = 'h-10 w-10 inline-flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent';
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(ply - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(ply + 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(last); }
    else if (e.key === 'f') setFlipped(v => !v);
  };
  const row = (c: Colour) => {
    const k = clockOf(c);
    return <PlayerRow side={sides[c]} clock={k.value} running={k.running} colour={colours[c]} />;
  };

  return (
    <div className="space-y-4">
      <section className="surface-card p-4 sm:p-6" aria-label="Game">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
          <h2 className="font-heading text-xl text-[var(--text-primary)]">
            {isMatch ? `Game ${round.gameNo}: ` : ''}{names.w} – {names.b}
          </h2>
          <StatusPill feed={f} round={round} now={now} />
          {game.headers.Opening && game.headers.Opening !== '?' && <span className="text-xs text-[var(--text-muted)]">{game.headers.Opening}</span>}
        </div>

        <div
          tabIndex={0}
          onKeyDown={onKey}
          aria-label="Game; use the arrow keys to step through the moves"
          className="grid gap-5 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] outline-none focus-visible:ring-2 focus-visible:ring-chess-gold rounded-lg"
        >
          <div className="min-w-0">
            {row(top)}
            <div className="flex gap-2 items-stretch">
              <EvalBar evaluation={prevEval} stale={stale} flipped={flipped} />
              <div className="flex-1 min-w-0">
                <BoardSvg fen={cur.pos.fen || START_FEN} from={cur.pos.from} to={cur.pos.to} flipped={flipped} label={`Position after ${moveLabel(cur.pos)}`} />
              </div>
            </div>
            {row(bottom)}
            <div className="mt-1 flex items-center gap-1">
              <button type="button" onClick={() => go(0)} disabled={ply === 0} className={ctrl} aria-label="First move">⏮</button>
              <button type="button" onClick={() => go(ply - 1)} disabled={ply === 0} className={ctrl} aria-label="Previous move">◀</button>
              <button type="button" onClick={() => go(ply + 1)} disabled={ply === last} className={ctrl} aria-label="Next move">▶</button>
              <button type="button" onClick={() => go(last)} disabled={ply === last} className={ctrl} aria-label="Last move">⏭</button>
              <button type="button" onClick={() => setFlipped(v => !v)} className={ctrl} aria-label="Flip board" title="Flip board (f)">⇅</button>
              {pinned !== null && inPlay && (
                <button type="button" onClick={() => setPinned(null)} className="ml-auto h-9 px-3 rounded-md text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20">
                  Back to live
                </button>
              )}
            </div>
          </div>

          <div className="min-w-0 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EvalTile evaluation={prevEval} stale={stale} names={names} failing={evals.failures >= 3} over={cur.pos.over} />
              <ComplexityTile value={cur.complexity} pos={cur.pos} mover={names[cur.pos.toMove]} result={ply === last ? game.result : null} failing={complexities.failures > 0} />
            </div>
            {last > 0 ? (
              <ol ref={listRef} className="relative grid grid-cols-[2.5rem_1fr_1fr] gap-y-0.5 content-start text-sm max-h-[220px] lg:max-h-[330px] overflow-y-auto pr-1" aria-label="Moves">
                {Array.from({ length: Math.ceil(last / 2) }, (_, i) => (
                  <li key={i} className="contents">
                    <span className="text-[var(--text-muted)] tabular-nums h-7 inline-flex items-center px-1">{i + 1}.</span>
                    {[i * 2 + 1, i * 2 + 2].map(n => positions[n] ? (
                      <button
                        key={n}
                        type="button"
                        onClick={() => go(n)}
                        aria-current={ply === n ? 'step' : undefined}
                        className={`flex items-center justify-between gap-2 text-left px-1.5 h-7 rounded font-mono ${ply === n ? 'bg-chess-gold/20 text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'}`}
                      >
                        <span>{positions[n].san}</span>
                        <span className="text-[11px] font-normal text-[var(--text-muted)] tabular-nums">{points[n].evaluation ? fmtEval(points[n].evaluation as Evaluation) : ''}</span>
                      </button>
                    ) : <span key={n} />)}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                The moves appear here as they are played; keep this page open.
              </p>
            )}
            {game.truncated && <p className="text-xs text-[var(--text-muted)]">Part of the broadcast could not be read; later moves appear once Lichess corrects it.</p>}
          </div>
        </div>
      </section>

      <section className="surface-card p-4 sm:p-6" aria-labelledby="live-charts">
        <h2 id="live-charts" className="font-heading text-lg text-[var(--text-primary)] mb-1">Complexity and evaluation</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4 max-w-2xl">
          Complexity is <Link href="/elocator" className="underline decoration-chess-gold/40 hover:text-[var(--text-secondary)]">Elocator</Link>&rsquo;s 1–100 rating of how hard the position is for the player to move: 70 means harder than 70% of positions from tournament games between players rated 2000+. Click the chart to see a position.
        </p>
        <LiveCharts points={points} selected={ply} onSelect={go} names={names} colours={colours} />
      </section>

      <p className="text-xs text-[var(--text-muted)]">
        Moves and clocks: <a className="underline" href={game.headers.GameURL ?? `https://lichess.org/broadcast/-/-/${round.id}`} target="_blank" rel="noopener noreferrer">Lichess broadcast ↗</a>.
        {' '}Evaluation: Stockfish, from Lichess&rsquo;s analysis and cloud evaluations.
        {isMatch && <> <Link href={WCC_HREF} className="underline">Match odds and predictions</Link>.</>}
      </p>
    </div>
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

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[var(--bg-surface-2)] p-3.5 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      {children}
    </div>
  );
}

function EvalTile({ evaluation, stale, names, failing, over }: { evaluation: Evaluation | null; stale: boolean; names: Record<Colour, string>; failing: boolean; over: boolean }) {
  let note: string;
  if (over) note = 'Game over on the board';
  else if (!evaluation) note = failing ? 'Evaluation source unreachable, retrying' : 'Waiting for an evaluation';
  else if (stale) note = 'Previous move; evaluating this one…';
  else {
    const ahead = evaluation.mate !== undefined ? (evaluation.mate > 0 ? 'w' : 'b') : Math.abs(evaluation.cp ?? 0) < 30 ? null : (evaluation.cp ?? 0) > 0 ? 'w' : 'b';
    note = ahead ? `${names[ahead]} is better` : 'About equal';
    if (evaluation.depth) note += ` · depth ${Math.min(evaluation.depth, 99)}`;
  }
  return (
    <Tile label="Stockfish">
      <p className={`font-heading text-3xl text-[var(--text-primary)] tabular-nums mt-1 ${stale ? 'opacity-50' : ''}`}>{evaluation ? fmtEval(evaluation) : '–'}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{note}</p>
    </Tile>
  );
}

function ComplexityTile({ value, pos, mover, result, failing }: { value: number | null; pos: LivePosition; mover: string; result: string | null; failing: boolean }) {
  const note = pos.over ? 'No move to find'
    : value === null ? (failing ? 'Elocator is waking up, retrying' : 'Scoring this position…')
      : result ? 'Final position' : `${mover} to move`;
  return (
    <Tile label="Complexity">
      <p className="font-heading text-3xl text-[var(--text-primary)] tabular-nums mt-1">
        {value ?? '–'}
      </p>
      {value !== null && <div className="mt-1.5"><ComplexityBar score={value} /></div>}
      <p className="text-xs text-[var(--text-muted)] mt-1">{note}</p>
    </Tile>
  );
}
