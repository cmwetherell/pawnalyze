import { strokeVar, type Tone } from '@/lib/theme/tones';

interface SparklineProps { values: (number | null)[]; tone?: Tone; /** Words for the trend; without them it is decoration beside a number. */ label?: string; className?: string }

const W = 120;
const H = 32;
const PAD = 4;

export function Sparkline({ values, tone = 'ink', label, className }: SparklineProps) {
  const pts = values.flatMap((v, i) => (v === null ? [] : [{ v, i }]));
  if (pts.length < 2) return null;
  const max = Math.max(...pts.map(p => p.v), 1e-9);
  const x = (i: number) => PAD + (i / Math.max(1, values.length - 1)) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - (v / max) * (H - 2 * PAD);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={className}>
      <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} strokeWidth={1} className="stroke-line" />
      <polyline points={pts.map(p => `${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')} fill="none" stroke={strokeVar(tone)} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last.i)} cy={y(last.v)} r={3} fill={strokeVar(tone)} />
    </svg>
  );
}
