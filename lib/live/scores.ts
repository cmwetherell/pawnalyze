/**
 * Per-position scores fetched as the game grows: Elocator complexity and Lichess cloud Stockfish.
 * Newest position first, limited concurrency, retries with backoff, keyed by fenKey so repeated
 * positions are fetched once.
 */
import { LICHESS } from './feed';
import { fenKey, type Evaluation, type LivePosition } from './pgn';
import { Store, sleep } from './store';

export class RateLimited extends Error {}

export interface ScoresSnapshot<T> {
  values: ReadonlyMap<string, T>;
  /** Positions still wanted and not given up on. */
  pending: number;
  /** Consecutive failed requests (0 = healthy). */
  failures: number;
}

interface Job { key: string; fen: string; misses: number; nextAt: number; running: boolean; gaveUp: boolean; fetches: number }

interface Options<T> {
  /** Resolve to null when the source does not have this position (yet). */
  fetchOne: (fen: string, signal: AbortSignal) => Promise<T | null>;
  concurrency: number;
  /** Minimum gap between requests. */
  gapMs: number;
  /** Delay before trying a missing position again; null = give up. `latest` is the position on the board. */
  missDelay: (misses: number, latest: boolean) => number | null;
  /** Delay before refreshing the latest position's value; null = values are final. */
  refreshDelay?: (fetches: number) => number | null;
  better?: (next: T, prev: T) => boolean;
}

const RATE_LIMIT_MS = 60_000;

export class ScoreStore<T> extends Store<ScoresSnapshot<T>> {
  private jobs = new Map<string, Job>();
  private order: string[] = [];
  private latest: string | null = null;
  private ctl: AbortController | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private running = 0;
  private notBefore = 0;

  constructor(private readonly opt: Options<T>) {
    super({ values: new Map(), pending: 0, failures: 0 });
  }

  start() { if (!this.ctl) { this.ctl = new AbortController(); this.pump(); } }
  stop() {
    this.ctl?.abort();
    this.ctl = null;
    clearTimeout(this.timer);
    this.jobs.forEach(j => { j.running = false; });
    this.running = 0;
  }

  /** Declare the positions of interest, oldest first, with any values already known. */
  want(positions: { fen: string; known?: T | null }[], latestIsLive: boolean) {
    const values = new Map(this.getSnapshot().values);
    let changed = false;
    this.order = [];
    for (const p of positions) {
      const key = fenKey(p.fen);
      if (p.known != null) {
        if (values.get(key) !== p.known) { values.set(key, p.known); changed = true; }
        this.jobs.delete(key);
        continue;
      }
      if (!this.jobs.has(key)) this.jobs.set(key, { key, fen: p.fen, misses: 0, nextAt: 0, running: false, gaveUp: false, fetches: 0 });
      this.order.push(key);
    }
    const last = positions.at(-1);
    const latest = latestIsLive && last ? fenKey(last.fen) : null;
    if (latest !== this.latest) {
      this.latest = latest;
      const j = latest ? this.jobs.get(latest) : undefined;
      if (j && (j.misses > 0 || j.gaveUp)) { j.misses = 0; j.gaveUp = false; j.nextAt = 0; }
    }
    if (changed || this.pendingCount(values) !== this.getSnapshot().pending) this.patch({ values, pending: this.pendingCount(values) });
    this.pump();
  }

  private pendingCount(values: ReadonlyMap<string, T>) {
    return this.order.filter(k => !values.has(k) && !this.jobs.get(k)?.gaveUp).length;
  }

  private due(j: Job, now: number) {
    if (j.running || j.gaveUp || j.nextAt > now) return false;
    return !this.getSnapshot().values.has(j.key) || (j.key === this.latest && this.opt.refreshDelay !== undefined);
  }

  private pump = () => {
    clearTimeout(this.timer);
    const signal = this.ctl?.signal;
    if (!signal) return;
    const now = Date.now();
    if (now >= this.notBefore && this.running < this.opt.concurrency) {
      for (let i = this.order.length - 1; i >= 0; i--) {
        const j = this.jobs.get(this.order[i]);
        if (j && this.due(j, now)) {
          this.notBefore = now + this.opt.gapMs;
          void this.exec(j, signal);
          break;
        }
      }
    }
    // Wake for the next job that is waiting on time rather than on a free slot.
    let next = Infinity;
    const values = this.getSnapshot().values;
    for (const k of this.order) {
      const j = this.jobs.get(k);
      if (!j || j.running || j.gaveUp) continue;
      if (values.has(k) && !(k === this.latest && this.opt.refreshDelay)) continue;
      next = Math.min(next, j.nextAt);
    }
    if (next < Infinity && this.running < this.opt.concurrency) {
      this.timer = setTimeout(this.pump, Math.min(2 ** 30, Math.max(next - now, this.notBefore - now, 20)));
    }
  };

  private async exec(j: Job, signal: AbortSignal) {
    j.running = true;
    this.running++;
    let value: T | null = null;
    let failed = false;
    try {
      // Background tabs keep the moves coming but do not refresh scores they already have.
      if (typeof document !== 'undefined' && document.hidden && this.getSnapshot().values.has(j.key)) await sleep(5_000, signal);
      value = await this.opt.fetchOne(j.fen, signal);
    } catch (e) {
      failed = true;
      if (e instanceof RateLimited) this.notBefore = Date.now() + RATE_LIMIT_MS;
    }
    if (signal.aborted) return;
    j.running = false;
    this.running--;
    const now = Date.now();
    const snap = this.getSnapshot();
    if (value !== null) {
      j.misses = 0;
      j.fetches++;
      const refresh = this.opt.refreshDelay?.(j.fetches) ?? null;
      j.nextAt = refresh === null ? Infinity : now + refresh;
      const prev = snap.values.get(j.key);
      if (prev === undefined || !this.opt.better || this.opt.better(value, prev)) {
        const values = new Map(snap.values).set(j.key, value);
        this.set({ values, pending: this.pendingCount(values), failures: 0 });
      } else if (snap.failures) this.patch({ failures: 0 });
    } else {
      j.misses++;
      const d = this.opt.missDelay(j.misses, j.key === this.latest);
      if (d === null && !failed) j.gaveUp = true;
      j.nextAt = now + (d ?? 60_000);
      this.patch({ pending: this.pendingCount(snap.values), failures: failed ? snap.failures + 1 : 0 });
    }
    this.pump();
  }
}

// ------------------------------------------------------------------ the two sources

export function createComplexityStore(url = '/api/live/complexity') {
  return new ScoreStore<number>({
    concurrency: 4,
    gapMs: 30,
    fetchOne: async (fen, signal) => {
      const res = await fetch(`${url}?fen=${encodeURIComponent(fenKey(fen))}`, { signal });
      if (res.status === 429) throw new RateLimited();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { complexity } = await res.json() as { complexity: number };
      return complexity;
    },
    missDelay: n => [2_000, 5_000, 10_000, 20_000][Math.min(n - 1, 3)],
  });
}

export function createEvalStore(base = LICHESS) {
  return new ScoreStore<Evaluation>({
    // Lichess asks for one request at a time.
    concurrency: 1,
    gapMs: 250,
    fetchOne: async (fen, signal) => {
      const res = await fetch(`${base}/api/cloud-eval?fen=${encodeURIComponent(fen)}`, { signal, cache: 'no-store' });
      if (res.status === 404) return null;
      if (res.status === 429) throw new RateLimited();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json() as { depth?: number; pvs?: { cp?: number; mate?: number }[] };
      const pv = j.pvs?.[0];
      if (!pv || (pv.cp === undefined && pv.mate === undefined)) return null;
      return pv.mate !== undefined ? { mate: pv.mate, depth: j.depth, source: 'cloud' } : { cp: pv.cp, depth: j.depth, source: 'cloud' };
    },
    missDelay: (n, latest) => latest
      ? [2_000, 3_000, 4_000, 6_000, 8_000][n - 1] ?? 10_000
      : [10_000, 30_000, 90_000][n - 1] ?? null,
    refreshDelay: n => [8_000, 15_000, 30_000][n - 1] ?? 60_000,
    better: (a, b) => b.source !== 'cloud' || (a.depth ?? 0) >= (b.depth ?? 0),
  });
}

export function evalInputs(positions: LivePosition[]) {
  return positions.map(p => ({ fen: p.fen, known: p.evaluation }));
}

export function complexityInputs(positions: LivePosition[]) {
  // A finished position has no move to find, so it has no complexity.
  return positions.filter(p => !p.over).map(p => ({ fen: p.fen }));
}
