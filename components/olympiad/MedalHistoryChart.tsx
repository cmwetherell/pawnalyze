'use client';

import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

import { useChartTheme } from '@/hooks/useChartTheme';
import type { HistoryPoint, Team } from '@/lib/olympiad/types';

type Metric = 'pGold' | 'pMedal' | 'pTop10';

const PALETTE = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

interface MedalHistoryChartProps {
  history: HistoryPoint[];
  teamsById: Map<number, Team>;
  topN?: number;
  /** Always include this team's line (the spotlighted team) */
  extraTeamId?: number | null;
  /** Rendered inside another card: no outer card chrome or title */
  embedded?: boolean;
}

export default function MedalHistoryChart({ history, teamsById, topN = 8, extraTeamId = null, embedded = false }: MedalHistoryChartProps) {
  const [metric, setMetric] = useState<Metric>('pGold');
  const theme = useChartTheme();

  const { labels, datasets, rounds } = useMemo(() => {
    const rounds = Array.from(new Set(history.map(h => h.roundsCompleted))).sort((a, b) => a - b);
    const latest = rounds[rounds.length - 1];
    const latestRows = history.filter(h => h.roundsCompleted === latest);
    const top = [...latestRows].sort((a, b) => b[metric] - a[metric]).slice(0, topN).map(r => r.teamId);
    if (extraTeamId !== null && !top.includes(extraTeamId) && latestRows.some(r => r.teamId === extraTeamId)) top.push(extraTeamId);
    const labels = rounds.map(r => (r === 0 ? 'Pre' : `R${r}`));
    const datasets = top.map((teamId, i) => {
      const team = teamsById.get(teamId);
      const data = rounds.map(r => {
        const pt = history.find(h => h.roundsCompleted === r && h.teamId === teamId);
        return pt ? Math.round(pt[metric] * 1000) / 10 : null;
      });
      const last = data[data.length - 1] ?? 0;
      return {
        label: `(${(last ?? 0).toFixed(1)}%) ${team?.name ?? teamId}`,
        data,
        borderColor: PALETTE[i % PALETTE.length],
        backgroundColor: PALETTE[i % PALETTE.length],
        borderWidth: 2.5,
        tension: 0,
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: true,
        fill: false,
      };
    });
    return { labels, datasets, rounds };
  }, [history, metric, teamsById, topN, extraTeamId]);

  if (rounds.length < 2) return null;

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'start' as const,
        labels: { color: theme.textColor, usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipBody,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            `${(ctx.dataset.label ?? '').replace(/\(.*?\)\s*/, '')}: ${ctx.parsed.y ?? 0}%`,
        },
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'After round', color: theme.textColor, font: { size: 12 } },
        grid: { color: theme.gridColor },
        ticks: { color: theme.textColor },
      },
      y: {
        title: { display: true, text: '%', color: theme.textColor, font: { size: 12 } },
        min: 0,
        grid: { color: theme.gridColor },
        ticks: { color: theme.textColor },
      },
    },
  };

  return (
    <div className={embedded ? '' : 'surface-card p-4 sm:p-6'}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <div>
          {!embedded && <h2 className="text-xl font-heading text-[var(--text-primary)]">Odds Over Time</h2>}
          <p className="text-xs text-[var(--text-muted)] mt-0.5">How the favourites&apos; chances moved round by round{extraTeamId !== null ? ' · includes the spotlighted team' : ''}</p>
        </div>
        <div role="tablist" aria-label="Metric" className="inline-flex rounded-lg bg-[var(--bg-surface-2)] p-0.5 text-xs">
          {([['pGold', 'Gold'], ['pMedal', 'Medal'], ['pTop10', 'Top 10']] as [Metric, string][]).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={metric === k}
              type="button"
              onClick={() => setMetric(k)}
              className={`h-8 px-2.5 rounded-md font-medium transition-colors ${
                metric === k ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 380 }}>
        <Line data={{ labels, datasets }} options={options} />
      </div>
    </div>
  );
}
