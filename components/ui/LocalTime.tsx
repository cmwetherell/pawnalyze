'use client';

import { useMounted } from '@/hooks/useNow';

export type LocalTimeFormat = 'time' | 'day' | 'datetime';

const OPTIONS: Record<LocalTimeFormat, Intl.DateTimeFormatOptions> = {
  time: { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' },
  day: { weekday: 'short', day: 'numeric', month: 'short' },
  datetime: { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' },
};

/** The reader's own clock once hydrated; Geneva time (the match's) in the server markup. */
export function LocalTime({ iso, format = 'datetime' }: { iso: string; format?: LocalTimeFormat }) {
  const mounted = useMounted();
  const text = new Date(iso).toLocaleString(mounted ? undefined : 'en-GB', { ...OPTIONS[format], ...(mounted ? {} : { timeZone: 'Europe/Zurich' }) });
  return <time dateTime={iso} suppressHydrationWarning>{text}</time>;
}
