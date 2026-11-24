'use client';

import { useEffect, useRef, useState } from 'react';

import { TableFallback, tdCls, thCls } from '@/components/wcc/ui';
import { evalPawns, fmtEval, type Colour, type Evaluation, type LivePosition } from '@/lib/live/pgn';

export interface ChartPoint {
  pos: LivePosition;
  complexity: number | null;
  evaluation: Evaluation | null;
}

interface Props {
  points: ChartPoint[];
  selected: number;
  onSelect: (ply: number) => void;
  names: Record<Colour, string>;
  colours: Record<Colour, string>;
}

/** "12. Nf3" / "12… Nc6" */
export function moveLabel(p: LivePosition): string {
  if (p.ply === 0) return 'Start';
  return `${Math.ceil(p.ply / 2)}${p.ply % 2 ? '.' : '…'} ${p.san}`;
}

const L = 34, R = 14;
const TOP = { y0: 8, h: 190 };
const GAP = 34;
const BOT = { h: 130 };

/** Elocator complexity per position (one line per player) above the Stockfish evaluation; shared move axis. */
export default function LiveCharts({ points, selected, onSelect, names, colours }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setWidth(Math.floor(entries[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(width, 280);
  const botY = TOP.y0 + TOP.h + GAP;
  const H = botY + BOT.h + 22;
  const last = points.length - 1;
  // Keep some room to grow early on; a full game then uses the whole width.
  const span = Math.max(last, 40);
  const x = (ply: number) => L + (ply / span) * (W - L - R);
  const yC = (v: number) => TOP.y0 + TOP.h * (1 - v / 100);
  const maxAbs = Math.max(0, ...points.map(p => (p.evaluation ? Math.abs(evalPawns(p.evaluation, 8)) : 0)));
  const cap = maxAbs <= 1.8 ? 2 : maxAbs <= 3.6 ? 4 : 8;
  const yE = (v: number) => botY + BOT.h * (1 - (v + cap) / (2 * cap));

  const series = (['w', 'b'] as Colour[]).map(c => ({
    c, pts: points.filter(p => p.pos.toMove === c && p.complexity !== null),
  }));
  const evals = points.filter(p => p.evaluation !== null);
  const evalLine = evals.map(p => `${x(p.pos.ply).toFixed(1)},${yE(evalPawns(p.evaluation as Evaluation, cap)).toFixed(1)}`);

  const active = hover !== null && hover <= last ? hover : Math.min(selected, last);
  const a = points[active];
  const step = span > 120 ? 20 : span > 60 ? 10 : 5; // in moves
  const ticks = Array.from({ length: Math.floor(span / 2 / step) }, (_, i) => (i + 1) * step);

  const plyAt = (clientX: number) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return 0;
    const t = ((clientX - box.left - L) / (W - L - R)) * span;
    return Math.max(0, Math.min(last, Math.round(t)));
  };
  const avg = (pts: ChartPoint[]) => (pts.length ? Math.round(pts.reduce((s, p) => s + (p.complexity as number), 0) / pts.length) : null);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--text-secondary)] mb-2">
        {series.map(({ c, pts }) => (
          <span key={c} className="inline-flex items-center gap-1.5">
            <span className="w-4 h-[3px] rounded-full" style={{ background: colours[c] }} aria-hidden />
            {names[c]} to move
            {avg(pts) !== null && <span className="text-[var(--text-muted)] tabular-nums">avg {avg(pts)}</span>}
          </span>
        ))}
        {a && (
          <span className="sm:ml-auto tabular-nums text-[var(--text-muted)]" aria-live="off">
            <span className="font-semibold text-[var(--text-primary)]">{moveLabel(a.pos)}</span>
            {' · '}complexity {a.complexity ?? '–'}
            {' · '}eval {a.evaluation ? fmtEval(a.evaluation) : '–'}
          </span>
        )}
      </div>

      <div ref={wrapRef} style={{ height: H }}>
        {width > 0 && (
          <svg
            width={W} height={H} className="block cursor-crosshair touch-pan-y"
            role="img"
            aria-label={`Complexity and evaluation after each move, ${last} plies so far. Full values are in the table below.`}
            onPointerMove={e => setHover(plyAt(e.clientX))}
            onPointerLeave={() => setHover(null)}
            onClick={e => onSelect(plyAt(e.clientX))}
          >
            {/* complexity */}
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line x1={L} x2={W - R} y1={yC(v)} y2={yC(v)} stroke="var(--border)" strokeWidth={1} opacity={0.6} />
                <text x={L - 6} y={yC(v) + 3.5} textAnchor="end" fontSize={10} fill="var(--text-muted)">{v}</text>
              </g>
            ))}
            <text x={L + 4} y={TOP.y0 + 10} fontSize={11} fontWeight={600} fill="var(--text-secondary)">Complexity of the position</text>
            {series.map(({ c, pts }) => (
              <g key={c}>
                <polyline
                  points={pts.map(p => `${x(p.pos.ply).toFixed(1)},${yC(p.complexity as number).toFixed(1)}`).join(' ')}
                  fill="none" stroke={colours[c]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
                />
                {pts.length > 0 && <circle cx={x(pts[pts.length - 1].pos.ply)} cy={yC(pts[pts.length - 1].complexity as number)} r={4} fill={colours[c]} stroke="var(--bg-surface-1)" strokeWidth={2} />}
              </g>
            ))}

            {/* evaluation */}
            {[cap, 0, -cap].map(v => (
              <g key={v}>
                <line x1={L} x2={W - R} y1={yE(v)} y2={yE(v)} stroke={v === 0 ? 'var(--text-muted)' : 'var(--border)'} strokeWidth={1} opacity={v === 0 ? 0.7 : 0.6} />
                <text x={L - 6} y={yE(v) + 3.5} textAnchor="end" fontSize={10} fill="var(--text-muted)">{v > 0 ? `+${v}` : v < 0 ? `−${-v}` : 0}</text>
              </g>
            ))}
            <text x={L + 4} y={botY - 7} fontSize={11} fontWeight={600} fill="var(--text-secondary)">
              Stockfish evaluation <tspan fontWeight={400} fill="var(--text-muted)">{W < 520 ? `up: ${names.w}` : `pawns · up is better for White (${names.w})`}</tspan>
            </text>
            {evals.length > 1 && (
              <path
                d={`M${x(evals[0].pos.ply)},${yE(0)} L${evalLine.join(' L')} L${x(evals[evals.length - 1].pos.ply)},${yE(0)} Z`}
                fill="var(--text-muted)" opacity={0.18}
              />
            )}
            <polyline points={evalLine.join(' ')} fill="none" stroke="var(--text-primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {evals.length > 0 && <circle cx={x(evals[evals.length - 1].pos.ply)} cy={yE(evalPawns(evals[evals.length - 1].evaluation as Evaluation, cap))} r={4} fill="var(--text-primary)" stroke="var(--bg-surface-1)" strokeWidth={2} />}

            {/* move axis */}
            {ticks.map(m => (
              <text key={m} x={x(m * 2)} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--text-muted)">{m}</text>
            ))}
            <text x={L} y={H - 6} fontSize={10} fill="var(--text-muted)">Move</text>

            {/* crosshair */}
            {a && (
              <g pointerEvents="none">
                <line x1={x(active)} x2={x(active)} y1={TOP.y0} y2={botY + BOT.h} stroke="var(--text-secondary)" strokeWidth={1} strokeDasharray="3 3" />
                {a.complexity !== null && <circle cx={x(active)} cy={yC(a.complexity)} r={5} fill={colours[a.pos.toMove]} stroke="var(--bg-surface-1)" strokeWidth={2} />}
                {a.evaluation && <circle cx={x(active)} cy={yE(evalPawns(a.evaluation, cap))} r={5} fill="var(--text-primary)" stroke="var(--bg-surface-1)" strokeWidth={2} />}
              </g>
            )}
          </svg>
        )}
      </div>

      <TableFallback>
        <table className="w-full max-w-md">
          <thead><tr><th className={thCls}>After</th><th className={thCls}>To move</th><th className={thCls}>Complexity</th><th className={thCls}>Evaluation</th></tr></thead>
          <tbody>
            {points.map(p => (
              <tr key={p.pos.ply} className="border-t border-[var(--border)]">
                <td className={tdCls}>{moveLabel(p.pos)}</td>
                <td className={tdCls}>{names[p.pos.toMove]}</td>
                <td className={tdCls}>{p.complexity ?? '–'}</td>
                <td className={tdCls}>{p.evaluation ? fmtEval(p.evaluation) : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableFallback>
    </div>
  );
}
