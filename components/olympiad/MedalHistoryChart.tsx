'use client';

import { useMemo, useState } from 'react';

import { LineChart, type LineSeries } from '@/components/charts/LineChart';
import { Segmented } from '@/components/ui/Segmented';
import { formatPct } from '@/lib/format';
import { medalTone, seriesTone, type Tone } from '@/lib/theme/tones';
import type { HistoryPoint, Team } from '@/lib/olympiad/types';
import { codeLabel, shortTeamName } from './teams';

type Metric = 'pGold' | 'pMedal' | 'pTop10';
const METRICS: { value: Metric; label: string; caption: string }[] = [
  { value: 'pGold', label: 'Gold', caption: 'Chance of winning gold after each round' },
  { value: 'pMedal', label: 'Medal', caption: 'Chance of a medal after each round' },
  { value: 'pTop10', label: 'Top 10', caption: 'Chance of a top-10 finish after each round' },
];
const TOP_N = 8;
/** A team still at this chance or better is named where its line ends; one below it, where its line was highest. */
const ENDS = 0.02;
/** A team that never had this chance is named in the tooltip and the table only. */
const NAMED = 0.1;

interface MedalHistoryChartProps {
  history: HistoryPoint[];
  teamsById: Map<number, Team>;
  /** Always include this team's line (the one in the spotlight). */
  extraTeamId?: number | null;
  /** Final places 1 to 3: those teams take their medal's tone and the champion leads. */
  medalists?: number[];
  /** Beside the podium: as tall as that column. */
  fill?: boolean;
  onSelect: (teamId: number) => void;
}

export const hasTrend = (history: HistoryPoint[]) => new Set(history.map(h => h.roundsCompleted)).size >= 2;

const short = (r: number) => (r === 0 ? 'Pre' : `R${r}`);

/** Every team's odds after every round. The leader is strong; the rest are context until pointed at. */
export function MedalHistoryChart({ history, teamsById, extraTeamId = null, medalists, fill, onSelect }: MedalHistoryChartProps) {
  const [metric, setMetric] = useState<Metric>('pGold');

  const model = useMemo(() => {
    const rounds = [...new Set(history.map(h => h.roundsCompleted))].sort((a, b) => a - b);
    if (rounds.length < 2) return null;
    const byTeam = new Map<number, Map<number, HistoryPoint>>();
    for (const h of history) {
      const m = byTeam.get(h.teamId) ?? new Map<number, HistoryPoint>();
      m.set(h.roundsCompleted, h);
      byTeam.set(h.teamId, m);
    }
    const values = (id: number, key: Metric) => rounds.map(r => byTeam.get(id)?.get(r)?.[key] ?? null);
    const last = (id: number, key: Metric) => byTeam.get(id)?.get(rounds[rounds.length - 1])?.[key] ?? -1;
    const peak = (id: number, key: Metric) => Math.max(...values(id, key).map(v => v ?? 0));
    // Once the event is over nearly every team ends level on 0%, so the highest chance it ever had breaks the tie.
    const order = (key: Metric) => [...byTeam.keys()].sort((a, b) => last(b, key) - last(a, key) || peak(b, key) - peak(a, key) || a - b);
    const shown = order(metric).slice(0, TOP_N);
    const extra = extraTeamId !== null && byTeam.has(extraTeamId) && !shown.includes(extraTeamId);
    if (extra) shown.push(extraTeamId);
    const lead = medalists?.[0] !== undefined && shown.includes(medalists[0]) ? medalists[0] : shown[0];
    // Level at the end, the leader's label comes first.
    shown.sort((x, y) => Number(y === lead) - Number(x === lead));
    // Tones follow the gold order, so switching metric never repaints a team.
    const slots = order('pGold');
    const tone = (id: number): Tone => {
      const medal = medalists?.indexOf(id) ?? -1;
      return medal >= 0 ? medalTone((medal + 1) as 1 | 2 | 3) : seriesTone(slots.indexOf(id));
    };
    const series = shown.map((id): LineSeries => {
      const vs = values(id, metric);
      const strong = id === lead;
      const top = vs.reduce<number>((best, v, i) => ((v ?? -1) > (vs[best] ?? -1) ? i : best), 0);
      const team = teamsById.get(id);
      return {
        id: String(id), label: team ? shortTeamName(team.name) : `Team ${id}`, short: team ? codeLabel(team) : String(id),
        values: vs, tone: tone(id), emphasis: strong ? 'strong' : id === extraTeamId ? 'normal' : 'context',
        labelAt: strong || id === extraTeamId || last(id, metric) >= ENDS ? 'end' : peak(id, metric) >= NAMED ? top : 'none',
      };
    });
    return { rounds, series, lead: series.find(s => s.id === String(lead)) ?? series[0], extra };
  }, [history, teamsById, metric, extraTeamId, medalists]);

  if (!model) return null;
  const { rounds, series, lead, extra } = model;
  const { caption } = METRICS.find(m => m.value === metric) ?? METRICS[0];
  const end = lead.values[lead.values.length - 1] ?? 0;

  return (
    <LineChart
      series={series}
      x={{ labels: rounds.map(short), titles: rounds.map(r => (r === 0 ? 'Before round 1' : `After round ${r}`)) }}
      y={{ min: 0, format: 'pct' }}
      height={{ desktop: 380, phone: 300 }}
      fill={fill}
      caption={`${caption}${extra ? ', with the selected team' : ''}`}
      tools={<Segmented role="tablist" size="sm" ariaLabel="Metric" items={METRICS} value={metric} onChange={setMetric} />}
      ariaLabel={`${caption}, ${series.length} teams. ${lead.label} ${medalists ? 'ends' : 'leads'} at ${formatPct(end)}.`}
      onSeries={id => onSelect(Number(id))}
      seriesAction="open details"
      table={{
        columns: ['Team', ...rounds.map(short)],
        rows: series.map(s => [s.label, ...s.values.map(v => (v === null ? '—' : formatPct(v)))]),
      }}
    />
  );
}
