'use client';

import { useEffect, useSyncExternalStore } from 'react';

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

/** One-time tip: every team name on the page opens its spotlight. Hidden after dismissal or the first selection. */
export default function SpotlightHint({ hasSelected }: { hasSelected: boolean }) {
  const dismissed = useSyncExternalStore(subscribe, read, () => true);
  useEffect(() => { if (hasSelected) dismiss(); }, [hasSelected]);
  if (dismissed || hasSelected) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-chess-gold/25 bg-chess-gold/10 px-3 py-2 text-xs text-[var(--text-secondary)]">
      <svg className="w-4 h-4 text-gold-ink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
      <span className="flex-1">
        <span className="font-semibold text-[var(--text-primary)]">Tap any team name</span> — in the race, the table, results or a match card — to open its full profile: roster, results, finish odds and likely opponents.
      </span>
      <button type="button" onClick={dismiss} className="h-10 px-2.5 rounded-md text-gold-ink hover:bg-chess-gold/15 font-medium shrink-0">Got it</button>
    </div>
  );
}
