'use client';

import { useEffect, useRef, useState } from 'react';

import { ordinal } from '@/lib/olympiad/odds';

interface TprTrendProps {
  tprByRound: (number | null)[];
  rankByRound: (number | null)[];
  rating: number;
}

/** Single-series line of a player's TPR after each round, with the list rating as a reference line. */
export default function TprTrend({ tprByRound, rankByRound, rating }: TprTrendProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(e => setWidth(Math.floor(e[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const points = tprByRound.map((v, i) => ({ round: i + 1, tpr: v, rank: rankByRound[i] ?? null })).filter(p => p.tpr !== null) as { round: number; tpr: number; rank: number | null }[];
  const rounds = tprByRound.length;
  const W = width > 0 ? Math.max(width, 240) : 320;
  const H = 180;
  const L = 44, R = 16, T = 18, B = 26;
  const values = [...points.map(p => p.tpr), rating || points[0]?.tpr || 2000];
  const lo = Math.floor((Math.min(...values) - 40) / 50) * 50;
  const hi = Math.ceil((Math.max(...values) + 40) / 50) * 50;
  const x = (r: number) => L + (rounds <= 1 ? (W - L - R) / 2 : ((r - 1) / (rounds - 1)) * (W - L - R));
  const y = (v: number) => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const step = hi - lo > 600 ? 200 : hi - lo > 300 ? 100 : 50;
  const grid: number[] = [];
  for (let v = lo; v <= hi; v += step) grid.push(v);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.round).toFixed(1)},${y(p.tpr).toFixed(1)}`).join(' ');

  return (
    <div ref={ref} className="w-full min-w-0 overflow-hidden">
      {points.length > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block max-w-full"
             aria-label={`Performance rating by round: ${points.map(p => `after round ${p.round} ${p.tpr}${p.rank ? `, ${ordinal(p.rank)} on the board` : ''}`).join('; ')}`}>
          {grid.map(v => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" strokeDasharray="3 5" />
              <text x={L - 6} y={y(v) + 3.5} fontSize={10} fill="var(--text-muted)" textAnchor="end">{v}</text>
            </g>
          ))}
          {rating > 0 && (
            <g>
              <line x1={L} x2={W - R} y1={y(rating)} y2={y(rating)} stroke="var(--text-muted)" strokeOpacity={0.6} strokeDasharray="2 3" />
              <text x={W - R} y={y(rating) - 4} fontSize={10} fill="var(--text-muted)" textAnchor="end">rating {rating}</text>
            </g>
          )}
          {Array.from({ length: rounds }, (_, i) => (
            <text key={i} x={x(i + 1)} y={H - 8} fontSize={11} fill="var(--text-muted)" textAnchor="middle">R{i + 1}</text>
          ))}
          <path d={path} fill="none" stroke="rgb(var(--gold-ink-rgb))" strokeWidth={7} strokeOpacity={0.18} strokeLinejoin="round" strokeLinecap="round" />
          <path d={path} fill="none" stroke="rgb(var(--gold-ink-rgb))" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {points.map(p => (
            <g key={p.round}>
              <circle cx={x(p.round)} cy={y(p.tpr)} r={4} fill="rgb(var(--gold-ink-rgb))" stroke="var(--bg-surface-1)" strokeWidth={1.5} />
              <text x={x(p.round)} y={y(p.tpr) - 9} fontSize={11} fontWeight={600} fill="var(--text-primary)" textAnchor="middle" className="tabular-nums">{p.tpr}</text>
              {p.rank !== null && <text x={x(p.round)} y={y(p.tpr) + 16} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{ordinal(p.rank)}</text>}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
