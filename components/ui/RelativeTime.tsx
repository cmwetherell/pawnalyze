'use client';

import { useNow } from '@/hooks/useNow';

export function relativeTime(iso: string, now: number): string {
  const m = Math.round(Math.max(0, now - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

/** "3 h ago", updated every minute; the server renders the date in UTC so hydration matches everywhere. */
export function RelativeTime({ iso, prefix = '' }: { iso: string; prefix?: string }) {
  const now = useNow(60_000);
  const abs = new Date(iso).toLocaleString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return <time dateTime={iso} title={abs} suppressHydrationWarning>{prefix}{now === null ? abs : relativeTime(iso, now)}</time>;
}

export default RelativeTime;
