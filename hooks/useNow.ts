'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** Current time in ms, rounded down to `stepMs` and refreshed that often; null during SSR and hydration. */
export function useNow(stepMs = 60_000): number | null {
  const subscribe = useCallback((cb: () => void) => {
    const id = setInterval(cb, stepMs);
    return () => clearInterval(id);
  }, [stepMs]);
  return useSyncExternalStore<number | null>(subscribe, () => Math.floor(Date.now() / stepMs) * stepMs, () => null);
}

const never = () => () => {};
/** False during SSR and the first client render. */
export function useMounted(): boolean {
  return useSyncExternalStore(never, () => true, () => false);
}
