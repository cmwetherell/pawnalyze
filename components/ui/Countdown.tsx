'use client';

import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';

interface CountdownProps {
  iso: string;
  /** full: days, hours, minutes, seconds as figures. inline: "2 d 4 h". */
  variant?: 'full' | 'inline';
  className?: string;
}

const split = (ms: number) => ({ d: Math.floor(ms / 86_400_000), h: Math.floor(ms / 3_600_000) % 24, m: Math.floor(ms / 60_000) % 60, s: Math.floor(ms / 1000) % 60 });

/** Before hydration it holds its place with dashes, so nothing moves when the first value arrives. */
export function Countdown({ iso, variant = 'inline', className }: CountdownProps) {
  const now = useNow(variant === 'full' ? 1000 : 60_000);
  const left = now === null ? null : Math.max(0, new Date(iso).getTime() - now);
  const t = left === null ? null : split(left);

  if (variant === 'inline') {
    const text = !t ? '–' : t.d > 0 ? `${t.d} d ${t.h} h` : t.h > 0 ? `${t.h} h ${t.m} min` : t.m > 0 ? `${t.m} min` : 'now';
    return <time dateTime={iso} className={cn('whitespace-nowrap tnum', className)}>{text}</time>;
  }
  const cells = [['days', t?.d], ['hours', t?.h], ['minutes', t?.m], ['seconds', t?.s]] as const;
  return (
    <time dateTime={iso} role="timer" aria-live="off" className={cn('inline-grid w-fit grid-cols-[repeat(4,auto)] gap-x-6', className)}>
      {cells.map(([label, v]) => (
        <span key={label} className="flex min-w-12 flex-col items-start">
          <span className="type-stat-sm text-ink tnum">{v === undefined ? '–' : String(v).padStart(2, '0')}</span>
          <span className="type-label text-ink-3">{label}</span>
        </span>
      ))}
    </time>
  );
}
