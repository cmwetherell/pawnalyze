import { cn } from '@/lib/utils';
import { Flag, type FlagSize } from './Flag';

interface FlagStackProps {
  items: { code: string; name?: string }[];
  max?: number;
  /** How many more there are when `items` is already cut: "+203". */
  more?: number;
  size?: FlagSize;
  /** Names the list for assistive tech. */
  label?: string;
  /** The names are written next to it. */
  decorative?: boolean;
  className?: string;
}

export function FlagStack({ items, max = 8, more: rest = 0, size = 'md', label, decorative = false, className }: FlagStackProps) {
  const more = Math.max(0, items.length - max) + rest;
  return (
    <ul aria-label={label} aria-hidden={decorative || undefined} className={cn('flex flex-wrap items-center gap-2', className)}>
      {items.slice(0, max).map((f, i) => <li key={`${f.code}-${i}`} className="flex"><Flag code={f.code} title={f.name} size={size} decorative={decorative} /></li>)}
      {more > 0 && <li className="type-small text-ink-3 tnum">+{more}<span className="sr-only"> more</span></li>}
    </ul>
  );
}
