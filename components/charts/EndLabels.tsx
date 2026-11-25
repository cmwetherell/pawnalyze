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
  /** Colour of the leader. */
  color: string;
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

/** Direct labels right of the lines, pushed apart; a leader when a label moved more than 8px. */
export function EndLabels({ labels, x, right, top, bottom, gap = 20, inset = 14, ground = 'auto', promoted = null, onPromote }: EndLabelsProps) {
  const at = solveLabels(labels, top, bottom, gap);
  return (
    <g>
      {labels.map(l => {
        const y = at.get(l.id) ?? l.y;
        const on = l.strong || promoted === l.id;
        const button = l.onSelect !== undefined;
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
            {Math.abs(y - l.y) > 8 && <path d={`M${x + 4} ${l.y}L${x + inset - 2} ${y}`} fill="none" stroke={l.color} strokeWidth={1} />}
            <rect x={x + inset - 4} y={y - gap / 2} width={Math.max(0, right - x - inset + 3)} height={gap + (l.extra ?? 0)} rx={2} fill="transparent" strokeWidth={2} />
            <text
              x={x + inset} y={y + 5} paintOrder="stroke" strokeWidth={5} strokeLinejoin="round"
              className={cn(l.strong ? 'type-data font-semibold' : 'type-small tnum', on ? 'fill-ink' : l.plain ? 'fill-ink-2' : 'fill-ink-3', groundStroke[ground])}
            >
              {l.text}
              {l.value && (l.extra
                ? <tspan x={x + inset} dy={l.extra} className={cn('type-small tnum', on ? 'fill-ink' : undefined)}>{l.value}</tspan>
                : <tspan dx={6} className={on ? 'fill-ink' : undefined}>{l.value}</tspan>)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
