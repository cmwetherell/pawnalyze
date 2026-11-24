'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { HistoryPoint, MarketRow } from '@/lib/wcc/types';
import { Section, Swatch, TableFallback, formatPct, tdCls, thCls, type Players } from './ui';

const SLOTS = ['Pre', ...Array.from({ length: 14 }, (_, i) => `G${i + 1}`), 'TB'];
const slotOf = (h: { afterGame: number; tbGames: number }) => (h.tbGames > 0 ? 15 : h.afterGame);
const MARKET_SHAPES: Record<string, 'circle' | 'square' | 'triangle'> = { kalshi: 'circle', polymarket: 'square', bet365: 'triangle' };
const MARKET_LABEL: Record<string, string> = { kalshi: 'Kalshi', polymarket: 'Polymarket', bet365: 'bet365' };

/** raw.after_game written by the market snapshot cron, if any. */
function taggedSlot(raw: unknown): number | null {
  const v = raw && typeof raw === 'object' ? (raw as { after_game?: unknown }).after_game : undefined;
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 14 ? v : null;
}

function Marker({ shape, x, y, r = 4.5 }: { shape: 'circle' | 'square' | 'triangle'; x: number; y: number; r?: number }) {
  const common = { fill: 'var(--bg-surface-1)', stroke: 'var(--text-secondary)', strokeWidth: 1.75 };
  if (shape === 'square') return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={1.5} {...common} />;
  if (shape === 'triangle') return <path d={`M${x},${y - r - 1} L${x + r + 1},${y + r} L${x - r - 1},${y + r} Z`} {...common} />;
  return <circle cx={x} cy={y} r={r} {...common} />;
}

/** P(Gukesh wins) after each game, with prediction-market prices as markers. Hidden until 2+ runs. */
export default function WinProbHistoryChart({ history, markets, players }: { history: HistoryPoint[]; markets: MarketRow[]; players: Players }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  const model = useMemo(() => {
    const bySlot = new Map<number, HistoryPoint>();
    for (const h of [...history].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) bySlot.set(slotOf(h), h);
    const points = Array.from(bySlot.entries()).sort((a, b) => a[0] - b[0]).map(([slot, h]) => ({ slot, h }));
    // Each market snapshot belongs to the match state in force when it was taken: the game it was
    // tagged with by the snapshot cron, else the latest run before it. The latest snapshot per slot wins.
    const runs = [...history].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const dots = new Map<string, { slot: number; source: string; p: number }>();
    for (const m of [...markets].sort((a, b) => a.asOf.localeCompare(b.asOf))) {
      if (!MARKET_SHAPES[m.source]) continue;
      let slot = taggedSlot(m.raw);
      if (slot === null) {
        const before = runs.filter(r => r.createdAt <= m.asOf).pop() ?? runs[0];
        if (!before) continue;
        slot = slotOf(before);
      }
      dots.set(`${m.source}-${slot}`, { slot, source: m.source, p: m.pWin1 });
    }
    const dotList = Array.from(dots.values()).sort((a, b) => a.slot - b.slot);
    const slots = Array.from(new Set([...points.map(p => p.slot), ...dotList.map(d => d.slot)])).sort((a, b) => a - b);
    return { points, dots: dotList, slots };
  }, [history, markets]);

  const show = model.points.length >= 2;
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setWidth(Math.floor(entries[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [show]);

  if (!show) return null;
  const { points, dots, slots } = model;
  const sources = Array.from(new Set(dots.map(d => d.source)));

  const narrow = width < 560;
  const W = Math.max(width, 280);
  const H = narrow ? 240 : 300;
  const L = 36, R = 12, T = 12, B = 26;
  const plotW = W - L - R;
  const x = (slot: number) => L + (slot / (SLOTS.length - 1)) * plotW;
  const y = (p: number) => T + (H - T - B) * (1 - p);
  const line = points.map(p => `${x(p.slot).toFixed(1)},${y(p.h.pWin1).toFixed(1)}`).join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const areaBelow = `M${x(first.slot)},${y(0)} L${line.replace(/ /g, ' L')} L${x(last.slot)},${y(0)} Z`;
  const areaAbove = `M${x(first.slot)},${y(1)} L${line.replace(/ /g, ' L')} L${x(last.slot)},${y(1)} Z`;
  const hoverPt = hover !== null ? points.find(p => p.slot === hover) : undefined;
  const marketLines = sources.map(src => ({ src, pts: dots.filter(d => d.source === src) })).filter(l => l.pts.length >= 2);

  const onMove = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left;
    let best = slots[0], bestD = Infinity;
    for (const sl of slots) { const d = Math.abs(px - x(sl)); if (d < bestD) { bestD = d; best = sl; } }
    setHover(best);
  };

  return (
    <Section
      id="history"
      eyebrow="Odds over time"
      title="How the odds have moved"
      description={<>{players[1].shortName}’s chance to win the match after each game. Markers show prediction-market prices at the time.</>}
    >
      <div ref={wrapRef} className="relative w-full" onMouseLeave={() => setHover(null)}>
        {width > 0 && (
          <svg
            width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block select-none"
            aria-label={`${players[1].shortName} win probability from ${formatPct(first.h.pWin1)} before the match to ${formatPct(last.h.pWin1)} now.`}
            onMouseMove={e => onMove(e.clientX, e.currentTarget.getBoundingClientRect())}
            onTouchStart={e => onMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
            onTouchMove={e => onMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          >
            <path d={areaAbove} fill="var(--wcc-p2)" fillOpacity={0.14} />
            <path d={areaBelow} fill="var(--wcc-p1)" fillOpacity={0.18} />
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <g key={v}>
                <line x1={L} x2={L + plotW} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" strokeDasharray={v === 0.5 ? '0' : '3 5'} strokeWidth={v === 0.5 ? 1.5 : 1} />
                <text x={L - 6} y={y(v) + 3.5} fontSize={10} fill="var(--text-muted)" textAnchor="end">{Math.round(v * 100)}%</text>
              </g>
            ))}
            {SLOTS.map((s, i) => (!narrow || i % 3 === 0 || i === SLOTS.length - 1) && (
              <text key={s} x={x(i)} y={H - 8} fontSize={10} textAnchor="middle" fill={hover === i ? 'var(--text-primary)' : 'var(--text-muted)'}>{s}</text>
            ))}
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="var(--text-muted)" strokeOpacity={0.5} />}
            <polyline points={line} fill="none" stroke="var(--wcc-p1)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {points.map(p => (
              <circle key={p.slot} cx={x(p.slot)} cy={y(p.h.pWin1)} r={hover === p.slot ? 5 : 3.5} fill="var(--wcc-p1)" stroke="var(--bg-surface-1)" strokeWidth={2} />
            ))}
            {marketLines.map(l => (
              <polyline key={l.src} points={l.pts.map(d => `${x(d.slot).toFixed(1)},${y(d.p).toFixed(1)}`).join(' ')}
                fill="none" stroke="var(--text-secondary)" strokeOpacity={0.45} strokeWidth={1.25} strokeDasharray="4 4" />
            ))}
            {dots.map(d => <Marker key={`${d.source}-${d.slot}`} shape={MARKET_SHAPES[d.source]} x={x(d.slot)} y={y(d.p)} />)}
          </svg>
        )}
        {hover !== null && (
          <div className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-1)]/95 backdrop-blur px-2.5 py-2 text-[11px] shadow-lg"
            style={{ left: Math.min(Math.max(x(hover) + 12, 4), Math.max(4, W - 176)), top: 8, width: 168 }}>
            <p className="text-[var(--text-muted)] mb-1">{hover === 0 ? 'Before the match' : hover === 15 ? 'During the tiebreaks' : `After game ${hover}`}</p>
            {hoverPt && <>
              <p className="flex justify-between"><span>{players[1].shortName}</span><span className="tabular-nums text-[var(--text-primary)]">{formatPct(hoverPt.h.pWin1)}</span></p>
              <p className="flex justify-between"><span>{players[2].shortName}</span><span className="tabular-nums text-[var(--text-primary)]">{formatPct(1 - hoverPt.h.pWin1)}</span></p>
            </>}
            {dots.filter(d => d.slot === hover).map(d => (
              <p key={d.source} className="flex justify-between text-[var(--text-muted)]"><span>{MARKET_LABEL[d.source]}</span><span className="tabular-nums">{formatPct(d.p)}</span></p>
            ))}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5"><Swatch player={1} /> {players[1].shortName} (model)</span>
        <span className="inline-flex items-center gap-1.5"><Swatch player={2} /> {players[2].shortName} (the rest)</span>
        {sources.map(s => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <svg width="12" height="12" aria-hidden><Marker shape={MARKET_SHAPES[s]} x={6} y={6} r={4} /></svg>{MARKET_LABEL[s]}
          </span>
        ))}
      </div>
      <TableFallback>
        <table className="w-full text-[11px]">
          <thead><tr><th className={thCls}>After</th><th className={thCls}>{players[1].shortName}</th><th className={thCls}>Tiebreak</th>{sources.map(s => <th key={s} className={thCls}>{MARKET_LABEL[s]}</th>)}</tr></thead>
          <tbody>
            {slots.map(sl => {
              const p = points.find(z => z.slot === sl);
              return (
                <tr key={sl} className="border-t border-[var(--border)]">
                  <td className={tdCls}>{SLOTS[sl]}</td><td className={tdCls}>{p ? formatPct(p.h.pWin1) : '—'}</td><td className={tdCls}>{p ? formatPct(p.h.pTb) : '—'}</td>
                  {sources.map(s => { const d = dots.find(z => z.slot === sl && z.source === s); return <td key={s} className={tdCls}>{d ? formatPct(d.p) : '—'}</td>; })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableFallback>
    </Section>
  );
}
