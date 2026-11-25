'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';

const KEY = 'oly26-spotlight-hint';
const listeners = new Set<() => void>();
function read(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}
function dismiss() {
  try { localStorage.setItem(KEY, '1'); } catch { /* private mode */ }
  listeners.forEach(l => l());
}
function subscribe(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; }

/** One-time tip: every team name on the page opens its profile. Gone once dismissed or once a team has been opened. */
export function SpotlightHint({ hasSelected }: { hasSelected: boolean }) {
  const dismissed = useSyncExternalStore(subscribe, read, () => true);
  useEffect(() => { if (hasSelected) dismiss(); }, [hasSelected]);
  if (dismissed || hasSelected) return null;
  return (
    <Callout icon="info" action={<Button size="sm" variant="quiet" onClick={dismiss}>Got it</Button>}>
      <p><strong>Select any team name</strong> in the race, the table, the results or a match to open its full profile: roster, results, finish odds and likely opponents.</p>
    </Callout>
  );
}
