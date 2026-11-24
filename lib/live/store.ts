/** Minimal external store for useSyncExternalStore: immutable snapshots, change listeners. */
export class Store<S> {
  private listeners = new Set<() => void>();
  constructor(private snap: S) {}
  getSnapshot = (): S => this.snap;
  subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  };
  protected set(next: S) {
    this.snap = next;
    this.listeners.forEach(l => l());
  }
  protected patch(p: Partial<S>) {
    this.set({ ...this.snap, ...p });
  }
}

/** Resolves after `ms`, or at once when the signal aborts. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise(resolve => {
    if (signal?.aborted) return resolve();
    const done = () => { clearTimeout(id); signal?.removeEventListener('abort', done); resolve(); };
    const id = setTimeout(done, ms);
    signal?.addEventListener('abort', done);
  });
}

/** A signal that aborts with `signal` or after `ms` (AbortSignal.any is too new for older Safari). */
export function withTimeout(signal: AbortSignal, ms: number): AbortSignal {
  const c = new AbortController();
  if (signal.aborted) { c.abort(); return c.signal; }
  const id = setTimeout(() => c.abort(), ms);
  signal.addEventListener('abort', () => { clearTimeout(id); c.abort(); }, { once: true });
  return c.signal;
}
