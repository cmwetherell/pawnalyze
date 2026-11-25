import { cn } from '@/lib/utils';
import { groundStroke, type Ground } from './ground';
import { textWidth } from './scales';

interface YAxisProps {
  ticks: number[];
  /** Printed text, one per tick. */
  labels: string[];
  y: (v: number) => number;
  left: number;
  right: number;
  /** The value that gets the 1px baseline instead of a gridline. */
  baseline?: number;
}

/** Solid hairline grid, 1px baseline, tick numbers. No axis line, no tick marks. */
export function YAxis({ ticks, labels, y, left, right, baseline = 0 }: YAxisProps) {
  return (
    <g aria-hidden>
      {!ticks.includes(baseline) && <line x1={left} x2={right} y1={y(baseline)} y2={y(baseline)} strokeWidth={1} shapeRendering="crispEdges" className="stroke-axis" />}
      {ticks.map((t, i) => (
        <g key={t}>
          <line x1={left} x2={right} y1={y(t)} y2={y(t)} strokeWidth={1} shapeRendering="crispEdges" className={t === baseline ? 'stroke-axis' : 'stroke-grid'} />
          <text x={left - 10} y={y(t) + 4} textAnchor="end" className="fill-ink-3 type-micro tnum">{labels[i]}</text>
        </g>
      ))}
    </g>
  );
}

interface XAxisProps {
  labels: string[];
  /** Indices to print. */
  ticks: number[];
  x: (i: number) => number;
  y: number;
  /** The pointed-at index: printed in ink, over its neighbors. */
  active?: number | null;
  max: number;
  ground?: Ground;
}

export function XAxis({ labels, ticks, x, y, active = null, max, ground = 'auto' }: XAxisProps) {
  const at = (i: number) => {
    const half = textWidth(labels[i], 12) / 2;
    return Math.min(max - half, Math.max(half, x(i)));
  };
  return (
    <g aria-hidden>
      {ticks.filter(i => active === null || !labels[active] || Math.abs(at(i) - at(active)) > (textWidth(labels[i], 12) + textWidth(labels[active], 12)) / 2 + 4).map(i => (<text key={i} x={at(i)} y={y} textAnchor="middle" className="fill-ink-3 type-micro tnum">{labels[i]}</text>))}
      {active !== null && labels[active] && (
        <text x={at(active)} y={y} textAnchor="middle" paintOrder="stroke" strokeWidth={10} strokeLinejoin="round" className={cn('fill-ink type-micro font-medium tnum', groundStroke[ground])}>{labels[active]}</text>
      )}
    </g>
  );
}
