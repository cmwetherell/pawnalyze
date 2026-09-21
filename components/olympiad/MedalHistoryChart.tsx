'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import type { HistoryPoint, Team } from '@/lib/olympiad/types';

type Metric = 'pGold' | 'pMedal' | 'pTop10';
const METRICS: { key: Metric; label: string; word: string }[] = [
  { key: 'pGold', label: 'Gold', word: 'Gold-medal' },
  { key: 'pMedal', label: 'Medal', word: 'Podium' },
  { key: 'pTop10', label: 'Top 10', word: 'Top-10' },
];

/** Categorical slots defined per theme in globals.css (validated for both surfaces); the leader always wears gold. */
const SERIES = Array.from({ length: 8 }, (_, i) => `var(--series-${i + 1})`);
const GOLD = 'rgb(var(--gold-ink-rgb))';
const EXTRA = 'var(--text-muted)';

interface MedalHistoryChartProps {
  history: HistoryPoint[];
  teamsById: Map<number, Team>;
  topN?: number;
  /** Always include this team's line (the spotlighted team) */
  extraTeamId?: number | null;
  /** Rendered inside another card: no outer card chrome or title */
  embedded?: boolean;
  onSelect?: (teamId: number) => void;
}

interface Series {
  teamId: number;
  color: string;
  values: (number | null)[];
  latest: number;
  isLeader: boolean;
}

function roundLabel(r: number): string {
  return r === 0 ? 'Pre' : `R${r}`;
}

function shortName(team: Team | undefined, teamId: number): string {
  return (team?.name ?? `Team ${teamId}`).replace('United States of America', 'United States');
}

/** Phone label: federation code, plus the squad number for second/third teams ("UZB 2"). */
function codeLabel(team: Team | undefined, teamId: number): string {
  if (!team) return String(teamId);
  const suffix = /\s(\d)$/.exec(team.name)?.[1];
  return suffix ? `${team.fedCode} ${suffix}` : team.fedCode;
}

export default function MedalHistoryChart({
  history, teamsById, topN = 8, extraTeamId = null, embedded = false, onSelect,
}: MedalHistoryChartProps) {
  const [metric, setMetric] = useState<Metric>('pGold');
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setWidth(Math.floor(entries[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const model = useMemo(() => {
    const rounds = Array.from(new Set(history.map(h => h.roundsCompleted))).sort((a, b) => a - b);
    if (rounds.length < 2) return null;
    const latest = rounds[rounds.length - 1];
    const byTeam = new Map<number, Map<number, HistoryPoint>>();
    for (const h of history) {
      const m = byTeam.get(h.teamId) ?? new Map<number, HistoryPoint>();
      m.set(h.roundsCompleted, h);
      byTeam.set(h.teamId, m);
    }
    const latestRows = history.filter(h => h.roundsCompleted === latest);
    // Colour slots follow gold rank at the latest run, so switching metric never repaints a team.
    const goldOrder = [...latestRows].sort((a, b) => b.pGold - a.pGold).map(r => r.teamId);
    const shown = [...latestRows].sort((a, b) => b[metric] - a[metric]).slice(0, topN).map(r => r.teamId);
    const extraAdded = extraTeamId !== null && !shown.includes(extraTeamId) && byTeam.has(extraTeamId);
    if (extraAdded) shown.push(extraTeamId);
    const leader = shown[0];
    const series: Series[] = shown.map(teamId => {
      const slot = goldOrder.indexOf(teamId);
      const color = teamId === leader ? GOLD : slot >= 0 && slot < SERIES.length ? SERIES[slot] : EXTRA;
      const values = rounds.map(r => byTeam.get(teamId)?.get(r)?.[metric] ?? null);
      return { teamId, color, values, latest: values[values.length - 1] ?? 0, isLeader: teamId === leader };
    });
    const max = Math.max(0.05, ...series.flatMap(s => s.values.filter((v): v is number => v !== null)));
    return { rounds, series, max, extraAdded };
  }, [history, metric, topN, extraTeamId]);

  if (!model) return null;
  const { rounds, series, max, extraAdded } = model;
  const metricWord = METRICS.find(m => m.key === metric)?.word ?? 'Gold-medal';

  // ---- layout (responsive: names on wide screens, federation codes on phones)
  const narrow = width < 560;
  const W = Math.max(width, 280);
  const H = narrow ? 300 : 380;
  const L = narrow ? 30 : 40;
  const R = narrow ? 104 : 196;
  const T = 16;
  const B = 28;
  const plotW = Math.max(60, W - L - R);
  const yMax = max * 1.1;
  const x = (i: number) => L + (rounds.length === 1 ? plotW / 2 : (i / (rounds.length - 1)) * plotW);
  const y = (v: number) => T + (H - T - B) * (1 - v / yMax);
  const gridStep = yMax > 0.4 ? 0.1 : yMax > 0.2 ? 0.05 : 0.02;
  const gridVals: number[] = [];
  for (let v = 0; v <= yMax + 1e-9; v += gridStep) gridVals.push(Number(v.toFixed(4)));

  // ---- end labels: push overlapping labels down, then back up from the bottom edge, then down from
  // the top edge — so a crowded tail near 0% compresses upward without shoving the leader off the plot.
  const minGap = narrow ? 22 : 26;
  const labelTop = T + minGap / 2;
  const labelBottom = H - B - 6;
  const labels = series.map(s => ({ s, y: y(s.latest), target: y(s.latest) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) labels[i].y = Math.max(labels[i].y, labels[i - 1].y + minGap);
  for (let i = labels.length - 1; i >= 0; i--) {
    labels[i].y = Math.min(labels[i].y, i === labels.length - 1 ? labelBottom : labels[i + 1].y - minGap);
  }
  for (let i = 0; i < labels.length; i++) {
    labels[i].y = Math.max(labels[i].y, i === 0 ? labelTop : labels[i - 1].y + minGap);
  }

  const hoverIndex = hover !== null && hover >= 0 && hover < rounds.length ? hover : null;
  const tickEvery = narrow && rounds.length > 6 ? 2 : 1;
  const labelX = L + plotW + 10;
  const flagW = narrow ? 19 : 24;
  const flagH = narrow ? 14 : 18;

  const onMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const px = clientX - svg.getBoundingClientRect().left;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < rounds.length; i++) {
      const d = Math.abs(px - x(i));
      if (d < bestD) { bestD = d; best = i; }
    }
    setHover(best);
  };

  const leaderTeam = teamsById.get(series[0].teamId);
  const summary = `${metricWord} probability by round for ${series.length} teams. ${leaderTeam?.name ?? 'The leader'} leads at ${formatPct(series[0].latest)}.`;

  return (
    <div className={embedded ? '' : 'surface-card p-4 sm:p-6'}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
        <div>
          {!embedded && <h2 className="text-xl font-heading text-[var(--text-primary)]">Odds Over Time</h2>}
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {metricWord} probability after each round · leader in gold{extraAdded ? ' · plus the spotlighted team' : ''}
          </p>
        </div>
        <div role="tablist" aria-label="Metric" className="inline-flex rounded-lg bg-[var(--bg-surface-2)] p-0.5 text-xs">
          {METRICS.map(m => (
            <button
              key={m.key}
              role="tab"
              aria-selected={metric === m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={`h-10 px-2.5 rounded-md font-medium transition-colors ${
                metric === m.key ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={wrapRef} className="relative w-full" onMouseLeave={() => setHover(null)}>
        {width > 0 && (
          <svg
            ref={svgRef}
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={summary}
            onMouseMove={e => onMove(e.clientX)}
            onTouchStart={e => onMove(e.touches[0].clientX)}
            onTouchMove={e => onMove(e.touches[0].clientX)}
            onTouchEnd={() => setHover(null)}
            className="block select-none max-w-full"
          >
            {gridVals.map(v => (
              <g key={v}>
                <line x1={L} x2={L + plotW} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" strokeDasharray="3 5" />
                <text x={L - 6} y={y(v) + 3.5} fontSize={narrow ? 10 : 11} fill="var(--text-muted)" textAnchor="end">
                  {Math.round(v * 100)}{narrow && v !== gridVals[gridVals.length - 1] ? '' : '%'}
                </text>
              </g>
            ))}
            {rounds.map((r, i) => (i % tickEvery === 0 || i === rounds.length - 1) && (
              <text key={r} x={x(i)} y={H - 8} fontSize={narrow ? 10 : 12} textAnchor="middle"
                    fill={hoverIndex === i ? 'var(--text-primary)' : 'var(--text-muted)'}>
                {roundLabel(r)}
              </text>
            ))}
            {hoverIndex !== null && (
              <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={T} y2={H - B} stroke="var(--text-muted)" strokeOpacity={0.5} />
            )}

            {series.map(s => {
              const pts = s.values
                .map((v, i) => (v === null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`))
                .filter(Boolean)
                .join(' ');
              return (
                <g key={s.teamId}>
                  {s.isLeader && (
                    <polyline points={pts} fill="none" stroke={s.color} strokeWidth={7} strokeOpacity={0.18} strokeLinejoin="round" strokeLinecap="round" />
                  )}
                  <polyline points={pts} fill="none" stroke={s.color} strokeWidth={s.isLeader ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" />
                  {s.values.map((v, i) => v === null ? null : (
                    <circle key={i} cx={x(i)} cy={y(v)} r={hoverIndex === i ? 5 : narrow ? 2.5 : 3.5}
                            fill={s.color} stroke="var(--bg-surface-1)" strokeWidth={1.5} />
                  ))}
                </g>
              );
            })}

            {labels.map(({ s, y: ly, target }) => {
              const team = teamsById.get(s.teamId);
              const text = narrow ? codeLabel(team, s.teamId) : shortName(team, s.teamId);
              const endX = L + plotW;
              return (
                <g
                  key={s.teamId}
                  role={onSelect ? 'button' : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  aria-label={onSelect ? `${shortName(team, s.teamId)} ${formatPct(s.latest)}, open details` : undefined}
                  className={onSelect ? 'cursor-pointer outline-none focus-visible:[&>rect]:stroke-[rgb(var(--gold-ink-rgb))]' : undefined}
                  onClick={() => onSelect?.(s.teamId)}
                  onKeyDown={e => {
                    if (onSelect && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(s.teamId); }
                  }}
                >
                  <path
                    d={`M${endX},${target.toFixed(1)} C${endX + 6},${target.toFixed(1)} ${endX + 4},${ly.toFixed(1)} ${labelX - 2},${ly.toFixed(1)}`}
                    fill="none" stroke={s.color} strokeWidth={1} strokeOpacity={0.6}
                  />
                  <rect x={labelX - 4} y={ly - minGap / 2} width={R - 6} height={minGap} rx={4} fill="transparent" stroke="none" strokeWidth={1.5} />
                  <foreignObject x={labelX} y={ly - flagH / 2 - 1} width={flagW + 2} height={flagH + 2}>
                    {team && <Flag code={team.fedCode} size={narrow ? 'xs' : 'sm'} className="!ring-0 !rounded-[2px]" aria-hidden />}
                  </foreignObject>
                  <text x={labelX + flagW + 6} y={ly + 4} fontSize={narrow ? 11 : 12.5} fontWeight={s.isLeader ? 600 : 500}
                        fill={s.isLeader ? 'var(--text-primary)' : 'var(--text-secondary)'}>
                    {text}
                  </text>
                  <text x={W - 2} y={ly + 4} fontSize={narrow ? 11 : 12.5} fontWeight={600} textAnchor="end"
                        fill={s.isLeader ? GOLD : 'var(--text-secondary)'} className="tabular-nums">
                    {formatPct(s.latest)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-1)]/95 backdrop-blur px-2.5 py-2 text-[11px] shadow-lg"
            style={{ left: Math.min(Math.max(x(hoverIndex) + 12, 4), Math.max(4, W - 168)), top: 8, width: 160 }}
          >
            <div className="text-[var(--text-muted)] mb-1">
              {rounds[hoverIndex] === 0 ? 'Pre-tournament' : `After round ${rounds[hoverIndex]}`}
            </div>
            {[...series]
              .sort((a, b) => (b.values[hoverIndex] ?? -1) - (a.values[hoverIndex] ?? -1))
              .map(s => {
                const v = s.values[hoverIndex];
                return (
                  <div key={s.teamId} className="flex items-center gap-1.5 leading-5">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="truncate text-[var(--text-secondary)] flex-1">{codeLabel(teamsById.get(s.teamId), s.teamId)}</span>
                    <span className="tabular-nums text-[var(--text-primary)]">{v === null ? '—' : formatPct(v)}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <details className="mt-2 text-xs text-[var(--text-muted)]">
        <summary className="cursor-pointer hover:text-[var(--text-secondary)] inline-flex items-center h-8">
          {onSelect ? 'Tap a team label to open its profile · ' : ''}Show as a table
        </summary>
        <table className="mt-2 w-full text-[11px] tabular-nums">
          <thead>
            <tr className="text-left text-[var(--text-muted)]">
              <th className="pr-2 py-1 font-medium">Team</th>
              {rounds.map(r => <th key={r} className="px-1 py-1 font-medium text-right">{roundLabel(r)}</th>)}
            </tr>
          </thead>
          <tbody>
            {series.map(s => (
              <tr key={s.teamId} className="border-t border-[var(--border)]">
                <td className="pr-2 py-1 text-[var(--text-secondary)] whitespace-nowrap">{shortName(teamsById.get(s.teamId), s.teamId)}</td>
                {s.values.map((v, i) => <td key={i} className="px-1 py-1 text-right text-[var(--text-primary)]">{v === null ? '—' : formatPct(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
