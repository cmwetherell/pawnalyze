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
