'use client';

import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('popstate', cb);
  return () => { listeners.delete(cb); window.removeEventListener('popstate', cb); };
}

/** Read one query-string parameter client-side (null on the server and during hydration). */
export function useUrlParam(name: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}

/** Update the URL without a navigation and notify useUrlParam readers. */
export function setUrlParam(name: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(name); else url.searchParams.set(name, value);
  window.history.replaceState(null, '', url.toString());
  listeners.forEach(l => l());
}

const hashListeners = new Set<() => void>();
function subscribeHash(cb: () => void) {
  hashListeners.add(cb);
  window.addEventListener('hashchange', cb);
  return () => { hashListeners.delete(cb); window.removeEventListener('hashchange', cb); };
}

/** The current location hash without "#" (empty on the server and during hydration). */
export function useHash(): string {
  return useSyncExternalStore(subscribeHash, () => window.location.hash.replace(/^#/, ''), () => '');
}

export function setHash(value: string) {
  const url = new URL(window.location.href);
  url.hash = value;
  window.history.replaceState(null, '', url.toString());
  hashListeners.forEach(l => l());
}
