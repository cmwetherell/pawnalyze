import { fillClass, onClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

export interface PipItem {
  /** Full words for assistive tech: "Round 3: win". */
  label: string;
  /** Shown inside from 20px. */
  letter?: string;
  /** `none`: not played. `rest`: sat out, a short line, so it never looks like a loss. */
  tone: Tone | 'none' | 'rest';
  href?: string;
  /** Under the pip, at size 32: "G3". */
  caption?: string;
}

interface PipsProps {
  /** result and form: one per game, letter inside. games: one per scheduled game. eligibility: so many of so many. */
  kind: 'result' | 'form' | 'games' | 'eligibility';
  items: PipItem[];
  size?: 12 | 20 | 32;
  ariaLabel?: string;
  /** One image with `ariaLabel` as its whole text, instead of a list read pip by pip: for tables. Not with linked pips. */
  asImage?: boolean;
  /** At size 32: the pips share the full width, seven to a line on phones and all on one line from 640. */
  fill?: boolean;
  className?: string;
}

const BOX = { 12: 'h-3 w-3', 20: 'h-5 w-5 type-micro', 32: 'h-8 w-8 type-small' } as const;

export function Pips({ kind, items, size = 20, ariaLabel, asImage = false, fill = false, className }: PipsProps) {
  return (
    <ul role={asImage ? 'img' : undefined} aria-label={ariaLabel} data-kind={kind} className={cn('flex flex-wrap', size === 32 ? 'gap-x-1 gap-y-2' : 'gap-1', items.some(i => i.href) && '-mx-1 gap-0', fill && 'grid grid-cols-7 sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none', className)}>
      {items.map((p, i) => {
        const pip = (
          <span className={cn('grid shrink-0 place-items-center rounded-sm leading-none', BOX[size], fill && 'h-11 w-full', 'font-semibold', p.tone === 'rest' ? 'text-ink-3' : p.tone === 'none' ? 'border border-control text-ink-3' : cn(fillClass[p.tone], onClass[p.tone]))}>
            {p.tone === 'rest' && <span aria-hidden className="h-px w-1/2 bg-control" />}
            {!asImage && <span className="sr-only">{p.label}</span>}
            {size >= 20 && p.letter && <span aria-hidden>{p.letter}</span>}
          </span>
        );
        return (
          <li key={i} title={p.label} className="relative flex flex-col items-center gap-1">
            {p.href
              ? <a href={p.href} className="grid h-tap place-items-center rounded-sm px-1 transition-colors duration-in hover:bg-sunken">{pip}</a>
              : pip}
            {p.caption && size === 32 && <span aria-hidden className="type-micro text-ink-3">{p.caption}</span>}
          </li>
        );
      })}
    </ul>
  );
}
