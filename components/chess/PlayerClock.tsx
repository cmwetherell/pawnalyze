import type { Tone } from '@/lib/theme/tones';
import { Swatch } from '@/components/ui/Swatch';
import { cn } from '@/lib/utils';
import { PieceDot } from './PieceDot';

interface PlayerClockProps {
  name: string;
  rating?: number | string | null;
  /** Already formatted: "1:24:05" */
  clock?: string | null;
  running?: boolean;
  tone: Tone;
  /** Shows the piece colour instead of the tone, where there is no player colour. */
  side?: 'white' | 'black';
  className?: string;
}

/** Name line above and below the board. */
export function PlayerClock({ name, rating, clock, running = false, tone, side, className }: PlayerClockProps) {
  return (
    <div className={cn('flex min-h-tap items-center gap-2', className)}>
      {side ? <><PieceDot side={side} /><span className="sr-only">{side === 'white' ? 'White: ' : 'Black: '}</span></> : <Swatch tone={tone} />}
      <span className="min-w-0 truncate type-ui text-ink">{name}</span>
      {rating ? <span className="type-data text-ink-3">{rating}</span> : null}
      {clock && (
        <span className={cn('ml-auto min-w-20 rounded-sm px-2 py-1 text-center type-mono', running ? 'bg-action text-on-action' : 'bg-sunken text-ink-2')}>
          {clock}{running && <span className="sr-only">, running</span>}
        </span>
      )}
    </div>
  );
}
