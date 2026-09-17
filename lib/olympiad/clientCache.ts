'use client';

/** Tiny in-memory cache for detail fetches so browsing teams is instant on revisits. */
const cache = new Map<string, Promise<unknown>>();

export class StaleRunError extends Error {
  constructor() {
    super('stale_run');
    this.name = 'StaleRunError';
  }
}

export function cachedJson<T>(key: string, url: string): Promise<T> {
  const hit = cache.get(key);
  if (hit) return hit as Promise<T>;
  const p = (async () => {
    const res = await fetch(url);
    if (res.status === 410) throw new StaleRunError();
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
    return body as T;
  })();
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  return p;
}
