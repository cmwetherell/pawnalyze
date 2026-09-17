'use client';

import { useSyncExternalStore } from 'react';

function subscribeMinute(cb: () => void) {
  const id = setInterval(cb, 60000);
  return () => clearInterval(id);
}
function minuteSnapshot(): number {
  return Math.floor(Date.now() / 60000) * 60000;
}

export function relativeTime(iso: string, now: number): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

/** "3 h ago", updated every minute; renders the absolute date on the server to avoid hydration drift. */
export default function RelativeTime({ iso, prefix = '' }: { iso: string; prefix?: string }) {
  const now = useSyncExternalStore(subscribeMinute, minuteSnapshot, () => null);
  const abs = new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return (
    <time dateTime={iso} title={abs}>
      {prefix}{now === null ? abs : relativeTime(iso, now)}
    </time>
  );
}
