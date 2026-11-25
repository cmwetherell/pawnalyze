import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export interface DeltaProps {
  value: number;
  base: number;
  /**
   * pts: both are 0..1, shown as points. pct: both are 0..100. places: ranks (a smaller number is higher, so `better` is
   * usually 'down'). plain: the bare difference (rating points), or whatever `format` makes of its size.
   */
  unit?: 'pts' | 'pct' | 'places' | 'plain';
  better?: 'up' | 'down';
  /** No colour: for dense tables where direction is enough. */
  quiet?: boolean;
  /** Decimals for places and plain (default 0): an average finish moves by tenths. */
  digits?: 0 | 1;
  /** Leaves the unit word to assistive tech. */
  short?: boolean;
  /** Size of the change as text, for `unit="plain"` ("$40k"). */
  format?: (size: number) => string;
  /** Words before the change: "would be". */
  label?: string;
  className?: string;
}

/**
 * Change against a base: arrow, sign, size. Never colour alone. Renders nothing when it rounds to zero.
 * For places the arrow and sign say which way the entry moved, so rank 5 to 3 reads "up 2 places".
 */
export function Delta({ value, base, unit = 'pts', better = 'up', quiet = false, digits = 0, short = false, format, label, className }: DeltaProps) {
  const d = unit === 'pts' ? (value - base) * 100 : value - base;
  const whole = (unit === 'places' || unit === 'plain') && digits === 0;
  if (Math.abs(d) < (whole ? 0.5 : 0.05)) return null;
  const good = d > 0 === (better === 'up');
  const up = unit === 'places' && better === 'down' ? good : d > 0;
  const size = format ? format(Math.abs(d)) : whole ? String(Math.round(Math.abs(d))) : Math.abs(d).toFixed(1);
  const word = unit === 'places' ? (size === '1' ? ' place' : ' places') : unit === 'pts' ? ' pts' : unit === 'pct' ? '%' : '';
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap type-label font-medium tnum', quiet ? 'text-ink-2' : good ? 'text-positive' : 'text-negative', className)}>
      {label && <span className="font-normal text-ink-2">{label}</span>}
      <Icon name={up ? 'up' : 'down'} size={14} className="h-2.5 w-2.5" />
      <span className="sr-only">{up ? 'up ' : 'down '}</span>
      <span>{up ? '+' : '−'}{size}{word && (short ? <span className="sr-only">{word}</span> : word)}</span>
    </span>
  );
}
