import { formatPct } from '@/lib/format';
import { fillClass, onClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

export interface OddsSide { name: string; /** 0..1 */ p: number; tone: Tone }

interface OddsChipProps {
  sides: [OddsSide, OddsSide];
  /** 0..1 for side one: what a pick would make it. */
  preview?: number | null;
  /** inline: the section bar. halves: the bottom bar, two solid halves that fill their box. */
  variant?: 'inline' | 'halves';
  className?: string;
}

/** As wide as a chance usually gets. */
const WIDEST = formatPct(0.888);

/** The live number in the section bar and the bottom bar. A preview takes the same place and says so. */
export function OddsChip({ sides, preview, variant = 'inline', className }: OddsChipProps) {
  const would = preview !== null && preview !== undefined;
  const p = would ? [preview, 1 - preview] : [sides[0].p, sides[1].p];

  if (variant === 'halves') {
    return (
      <span className={cn('grid h-12 min-w-0 flex-1 grid-cols-2 gap-0.5 overflow-hidden rounded-sm', className)}>
        {sides.map((s, i) => (
          // Name over number, each half read from its own side: both fit at 320.
          <span key={s.name} className={cn('flex min-w-0 flex-col justify-center px-3 leading-tight', i === 1 && 'text-right', fillClass[s.tone], onClass[s.tone])}>
            <span className="truncate type-label leading-tight">{s.name}{would && <span className="sr-only"> would be</span>}</span>
            <span className="tnum type-ui font-semibold leading-tight">{formatPct(p[i])}</span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-4 whitespace-nowrap type-ui text-ink', className)}>
      {sides.map((s, i) => (
        <span key={s.name} className="inline-flex items-center gap-2">
          <span aria-hidden className={cn('h-4 w-1 rounded-sm', fillClass[s.tone])} />
          {/* The number follows its words. An unseen "would be" holds the width of both states, so a preview never moves what is beside it. */}
          <span className="grid">
            <span className="col-start-1 row-start-1 flex items-center gap-2">
              <span className="text-ink-2">{would ? <><span className="sr-only">{s.name} </span>would be</> : s.name}</span>
              <span className="tnum font-semibold">{formatPct(p[i])}</span>
            </span>
            {[s.name, 'would be'].map(w => (
              <span key={w} aria-hidden className="invisible col-start-1 row-start-1 flex items-center gap-2"><span>{w}</span><span className="tnum font-semibold">{WIDEST}</span></span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
