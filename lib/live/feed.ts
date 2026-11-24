/**
 * Live feed of one broadcast game, straight from Lichess to the viewer's browser.
 *
 * 1. GET the round's PGN once (paints immediately; also works before the game starts).
 * 2. Hold open the PGN stream, which pushes the whole game again after every move.
 * 3. If the stream ends, stalls or is refused, reconnect with backoff, polling the PGN in between.
 */
import { PgnSplitter, parseLiveGame, splitPgn, type LiveGame } from './pgn';
import { Store, sleep, withTimeout } from './store';

export const LICHESS = 'https://lichess.org';
/** Lichess sends a keep-alive every 60 s when nothing happens. */
const STALL_MS = 90_000;
const BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 20_000, 30_000];
/** Lichess asks clients to wait a full minute after a 429. */
const RATE_LIMIT_MS = 60_000;

export type FeedStatus = 'connecting' | 'streaming' | 'reconnecting' | 'closed';

export interface FeedSnapshot {
  status: FeedStatus;
  game: LiveGame | null;
  /** Local time the latest move was made, as far as we know; null if unknown. */
  lastMoveAt: number | null;
  /** The last attempt to reach Lichess failed. */
  unreachable: boolean;
}

export interface FeedOptions {
  roundId: string;
  /** Which game of the round to follow. */
  pick: (headers: Record<string, string>) => boolean;
  /** Round is over: load it once, no stream. */
  finished?: boolean;
  base?: string;
  stallMs?: number;
  backoffMs?: number[];
  rateLimitMs?: number;
}

class HttpError extends Error {
  constructor(readonly status: number) { super(`HTTP ${status}`); }
}

export class BroadcastFeed extends Store<FeedSnapshot> {
  private ctl: AbortController | null = null;
  private lastPgn = '';
  private wake: (() => void) | null = null;
  private lastByteAt = 0;

  constructor(private readonly opt: FeedOptions) {
    super({ status: 'connecting', game: null, lastMoveAt: null, unreachable: false });
  }

  start() {
    if (this.ctl) return;
    const ctl = new AbortController();
    this.ctl = ctl;
    void this.run(ctl.signal);
  }

  stop() {
    this.ctl?.abort();
    this.ctl = null;
  }

  /** The tab woke up or the network came back: reconnect now if the stream looks dead. */
  nudge() {
    if (Date.now() - this.lastByteAt > 65_000) this.wake?.();
  }

  private get base() { return this.opt.base ?? LICHESS; }

  private async run(signal: AbortSignal) {
    this.patch({ status: 'connecting' });
    let loaded = false;
    for (let i = 0; !loaded && !signal.aborted; i++) {
      loaded = await this.poll(signal);
      // A live round can go on to the stream, which carries the game anyway.
      if (!loaded && !this.opt.finished) break;
      if (!loaded) await sleep(this.backoff(i), signal);
    }
    if (signal.aborted) return;
    if (this.opt.finished) { this.patch({ status: 'closed' }); return; }
    void this.loadThinkTime(signal);

    let failures = 0;
    while (!signal.aborted) {
      let wait = 0;
      try {
        await this.stream(signal, () => { failures = 0; });
        wait = this.backoff(failures++);
      } catch (e) {
        if (signal.aborted) return;
        wait = e instanceof HttpError && e.status === 429 ? this.opt.rateLimitMs ?? RATE_LIMIT_MS : this.backoff(failures++);
      }
      if (signal.aborted) return;
      this.patch({ status: 'reconnecting' });
      const limited = wait >= (this.opt.rateLimitMs ?? RATE_LIMIT_MS);
      if (!limited) await this.poll(signal);
      await this.pause(wait, signal);
      if (limited && !signal.aborted) await this.poll(signal);
    }
  }

  private backoff(i: number) {
    const b = this.opt.backoffMs ?? BACKOFF_MS;
    return b[Math.min(i, b.length - 1)];
  }

  /** Sleep that nudge() can cut short. */
  private async pause(ms: number, signal: AbortSignal) {
    const c = new AbortController();
    const stop = () => c.abort();
    signal.addEventListener('abort', stop);
    this.wake = stop;
    await sleep(ms, c.signal);
    this.wake = null;
    signal.removeEventListener('abort', stop);
  }

  private async poll(signal: AbortSignal): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/api/broadcast/round/${this.opt.roundId}.pgn`, {
        signal: withTimeout(signal, 15_000), cache: 'no-store',
      });
      if (!res.ok) throw new HttpError(res.status);
      splitPgn(await res.text()).forEach(p => this.apply(p));
      if (this.getSnapshot().unreachable) this.patch({ unreachable: false });
      return true;
    } catch {
      if (!signal.aborted) this.patch({ unreachable: true });
      return false;
    }
  }

  private async stream(signal: AbortSignal, onAlive: () => void) {
    const c = new AbortController();
    const stop = () => c.abort();
    signal.addEventListener('abort', stop);
    this.wake = stop;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(stop, this.opt.stallMs ?? STALL_MS);
    };
    try {
      arm();
      this.lastByteAt = Date.now();
      const res = await fetch(`${this.base}/api/stream/broadcast/round/${this.opt.roundId}.pgn`, { signal: c.signal, cache: 'no-store' });
      if (!res.ok || !res.body) throw new HttpError(res.status);
      this.patch({ status: 'streaming', unreachable: false });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const splitter = new PgnSplitter();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) return;
        arm();
        onAlive();
        this.lastByteAt = Date.now();
        splitter.push(decoder.decode(value, { stream: true })).forEach(p => this.apply(p));
      }
    } finally {
      clearTimeout(timer);
      this.wake = null;
      signal.removeEventListener('abort', stop);
      c.abort();
    }
  }

  private apply(pgn: string) {
    const tags: Record<string, string> = {};
    for (const m of pgn.matchAll(/^\[(\w+)\s+"([^"]*)"\]/gm)) tags[m[1]] = m[2];
    if (!this.opt.pick(tags) || pgn === this.lastPgn) return;
    this.lastPgn = pgn;
    const prev = this.getSnapshot().game;
    const game = parseLiveGame(pgn);
    const moved = prev !== null && game.positions.length > prev.positions.length;
    this.patch({ game, ...(moved ? { lastMoveAt: Date.now() } : {}) });
  }

  /** How long the side to move has been thinking, so the clocks are right on arrival. */
  private async loadThinkTime(signal: AbortSignal) {
    try {
      const res = await fetch(`${this.base}/api/broadcast/-/-/${this.opt.roundId}`, {
        signal: withTimeout(signal, 15_000), cache: 'no-store',
      });
      if (!res.ok) return;
      const { games = [] } = await res.json() as { games?: { id: string; thinkTime?: number; status?: string }[] };
      const url = this.getSnapshot().game?.headers.GameURL ?? '';
      const g = games.find(x => url.endsWith(`/${x.id}`));
      if (g?.status === '*' && typeof g.thinkTime === 'number' && this.getSnapshot().lastMoveAt === null) {
        this.patch({ lastMoveAt: Date.now() - g.thinkTime * 1000 });
      }
    } catch { /* clocks just start without it */ }
  }
}

// ------------------------------------------------------------------ rounds of the match

export interface RoundInfo {
  id: string;
  gameNo: number;
  startsAt: number | null;
  ongoing: boolean;
  finished: boolean;
}

export function parseRounds(json: unknown): RoundInfo[] {
  const rounds = (json as { rounds?: { id: string; name: string; startsAt?: number; ongoing?: boolean; finished?: boolean }[] } | null)?.rounds ?? [];
  return rounds
    .flatMap(r => {
      const m = /^Game (\d{1,2})$/.exec(r.name.trim());
      return m ? [{ id: r.id, gameNo: Number(m[1]), startsAt: r.startsAt ?? null, ongoing: Boolean(r.ongoing), finished: Boolean(r.finished) }] : [];
    })
    .sort((a, b) => a.gameNo - b.gameNo);
}

/** The game to show: one in play, else one about to start (or overdue), else the last one finished, else the first. */
export function defaultRound(rounds: RoundInfo[], now: number): RoundInfo | null {
  const soon = (r: RoundInfo) => !r.finished && r.startsAt !== null && r.startsAt - now < 60 * 60_000 && now - r.startsAt < 10 * 3_600_000;
  return rounds.find(r => r.ongoing) ?? rounds.find(soon) ?? rounds.filter(r => r.finished).at(-1) ?? rounds[0] ?? null;
}

export class RoundsStore extends Store<{ rounds: RoundInfo[] | null; failed: boolean }> {
  private ctl: AbortController | null = null;
  constructor(private readonly tourId: string, private readonly everyMs = 60_000, private readonly base = LICHESS) {
    super({ rounds: null, failed: false });
  }
  start() {
    if (this.ctl) return;
    const ctl = new AbortController();
    this.ctl = ctl;
    void this.run(ctl.signal);
  }
  stop() { this.ctl?.abort(); this.ctl = null; }
  private async run(signal: AbortSignal) {
    while (!signal.aborted) {
      const hidden = typeof document !== 'undefined' && document.hidden && this.getSnapshot().rounds !== null;
      if (!hidden) {
        try {
          const res = await fetch(`${this.base}/api/broadcast/${this.tourId}`, {
            headers: { accept: 'application/json' }, signal: withTimeout(signal, 15_000), cache: 'no-store',
          });
          if (!res.ok) throw new HttpError(res.status);
          const rounds = parseRounds(await res.json());
          const prev = this.getSnapshot();
          if (prev.failed || JSON.stringify(prev.rounds) !== JSON.stringify(rounds)) this.set({ rounds, failed: false });
        } catch {
          if (!signal.aborted) this.patch({ failed: true });
        }
      }
      await sleep(this.getSnapshot().failed ? 10_000 : this.everyMs, signal);
    }
  }
}
