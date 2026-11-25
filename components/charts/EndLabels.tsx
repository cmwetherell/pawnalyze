import { cn } from '@/lib/utils';
import { groundStroke, type Ground } from './ground';
import { solveLabels } from './labelSolver';

export interface EndLabel {
  id: string;
  text: string;
  /** Printed after the name, or under it when there is `extra` room. */
  value?: string;
  /** Pixels below the name for the value. */
  extra?: number;
  y: number;
  strong: boolean;
  /** Ink instead of the quiet ink-3 (a normal, not a context, series). */
  plain?: boolean;
  /** Color of the leader and the swatch. */
  color: string;
  /** A stroke of the line's color before the name, when several lines matter equally. */
  swatch?: boolean;
  /** The line ends in a dot, which the leader starts clear of. */
  dot?: boolean;
  ariaLabel?: string;
  onSelect?: () => void;
}

interface EndLabelsProps {
  labels: EndLabel[];
  /** Pixel where the lines end. */
  x: number;
  /** Right edge of the drawing. */
  right: number;
  top: number;
  bottom: number;
  gap?: number;
  /** Clear of the mark. */
  inset?: number;
  ground?: Ground;
  promoted?: string | null;
  onPromote?: (id: string | null) => void;
}

/** Room the swatch takes before the name. */
export const SWATCH = 18;

/** Direct labels right of the lines, pushed apart; a leader when a label moved more than 8px. */
export function EndLabels({ labels, x, right, top, bottom, gap = 20, inset = 14, ground = 'auto', promoted = null, onPromote }: EndLabelsProps) {
  const at = solveLabels(labels, top, bottom, gap);
  return (
    <g>
      {labels.map(l => {
        const y = at.get(l.id) ?? l.y;
        const on = l.strong || promoted === l.id;
        const button = l.onSelect !== undefined;
        const tx = x + inset + (l.swatch ? SWATCH : 0);
        // A two-line label that had to move up by no more than its second line still stands beside its mark.
        const moved = l.extra && y < l.y ? Math.max(0, l.y - y - l.extra) : Math.abs(y - l.y);
        return (
          <g
            key={l.id}
            role={button ? 'button' : undefined}
            tabIndex={button ? 0 : undefined}
            aria-label={button ? l.ariaLabel ?? `${l.text}${l.value ? ` ${l.value}` : ''}` : undefined}
            aria-hidden={button ? undefined : true}
            className={cn('outline-none [&:focus-visible>rect]:stroke-focus', (button || onPromote) && 'pointer-events-auto', button && 'cursor-pointer')}
            onPointerEnter={onPromote && (() => onPromote(l.id))}
            onPointerLeave={onPromote && (() => onPromote(null))}
            onFocus={onPromote && (() => onPromote(l.id))}
            onBlur={onPromote && (() => onPromote(null))}
            onClick={l.onSelect}
            onKeyDown={button ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); l.onSelect?.(); } } : undefined}
          >
            {moved > 8 && !l.swatch && <path d={`M${x + (l.dot ? 7 : 3)} ${l.y}L${x + inset - 3} ${y}`} fill="none" stroke={l.color} strokeWidth={1} />}
            <rect x={x + inset - 4} y={y - gap / 2} width={Math.max(0, right - x - inset + 3)} height={gap + (l.extra ?? 0)} rx={2} fill="transparent" strokeWidth={2} />
            {l.swatch && <path d={`M${x + inset} ${y}h12`} stroke={l.color} strokeWidth={3} />}
            <text
              x={tx} y={y + 5} paintOrder="stroke" strokeWidth={5} strokeLinejoin="round"
              className={cn(l.strong ? 'type-data font-semibold' : 'type-small tnum', on ? 'fill-ink' : l.plain ? 'fill-ink-2' : 'fill-ink-3', groundStroke[ground])}
            >
              {l.text}
              {l.value && (l.extra
                ? <tspan x={tx} dy={l.extra} className={cn('type-small tnum', on ? 'fill-ink' : undefined)}>{l.value}</tspan>
                : <tspan dx={6} className={on ? 'fill-ink' : undefined}>{l.value}</tspan>)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
