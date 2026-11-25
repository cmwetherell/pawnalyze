import { cn } from '@/lib/utils';
import { groundFill, type Ground } from './ground';

export type MarkerShape = 'circle' | 'square' | 'triangle';

interface MarkerProps { shape: MarkerShape; x: number; y: number; r?: number; ground?: Ground }

/** An outlined point. Shape, not colour, says which source it is. */
export function Marker({ shape, x, y, r = 6, ground = 'auto' }: MarkerProps) {
  const cls = cn('stroke-ink-2', groundFill[ground]);
  if (shape === 'square') return <rect x={x - r + 0.5} y={y - r + 0.5} width={2 * r - 1} height={2 * r - 1} strokeWidth={1.75} className={cls} />;
  if (shape === 'triangle') return <path d={`M${x} ${y - r - 1}l${r + 1} ${2 * r}h${-2 * (r + 1)}z`} strokeWidth={1.75} strokeLinejoin="round" className={cls} />;
  return <circle cx={x} cy={y} r={r} strokeWidth={1.75} className={cls} />;
}

/** The same mark beside a word, in a legend or the tooltip. */
export function MarkerKey({ shape }: { shape: MarkerShape }) {
  return <svg width={16} height={16} aria-hidden className="shrink-0"><Marker shape={shape} x={8} y={8.500} r={4.500} ground="raised" /></svg>;
}
