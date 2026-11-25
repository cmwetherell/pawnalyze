'use client';

import type { ChartTable } from '@/components/charts/ChartFrame';
import { LineChart } from '@/components/charts/LineChart';
import { moveAxis, moveLabel } from '@/lib/chess/moves';
import type { Tone } from '@/lib/theme/tones';

export interface ComplexityPoint { ply: number; san: string | null; toMove: 'w' | 'b'; complexity: number | null }

interface ComplexityChartProps {
  points: ComplexityPoint[];
  sides: Record<'w' | 'b', { name: string; tone: Tone }>;
  selected: number;
  onSelect: (ply: number) => void;
  /** The axis is at least this many half-moves long while the game goes on. */
  atLeast?: number;
  height?: { desktop: number; phone: number };
  caption?: string;
  ariaLabel?: string;
  /** Leave out inside a ChartGroup whose last chart has the table of all of them. */
  table?: ChartTable;
}

/** Family name, for a phone: "Byrne" of "Donald Byrne" and of "Byrne, Donald". */
const shortName = (name: string) => (name.includes(',') ? name.split(',')[0] : name.split(' ').at(-1) ?? name);

export const averageComplexity = (points: ComplexityPoint[], side: 'w' | 'b'): number | null => {
  const own = points.filter(p => p.toMove === side && p.complexity !== null);
  return own.length ? own.reduce((s, p) => s + (p.complexity as number), 0) / own.length : null;
};

/** Elocator complexity after each move, one line per player to move; the averages stand beside the names. */
export function ComplexityChart({ points, sides, selected, onSelect, atLeast = 0, height = { desktop: 300, phone: 240 }, caption = 'Complexity of the position, 0 to 100, for the player to move', ariaLabel, table }: ComplexityChartProps) {
  const last = points.length - 1;
  const plies = Math.max(last, atLeast);
  const { labels, every } = moveAxis(plies);
  const series = (['w', 'b'] as const).map(side => {
    const avg = averageComplexity(points, side);
    return {
      id: side, label: sides[side].name, short: shortName(sides[side].name), tone: sides[side].tone,
      values: labels.map((_, i) => (points[i]?.toMove === side ? points[i].complexity : null)),
      endValue: avg === null ? undefined : `avg ${Math.round(avg)}`,
    };
  });
  const said = series.flatMap(s => (s.endValue ? [`${s.label} ${s.endValue}`] : [])).join(', ');
  return (
    <LineChart
      series={series}
      x={{ labels, titles: labels.map((_, i) => (points[i] ? moveLabel(points[i]) : '')), every }}
      y={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], format: 'int' }}
      height={height} now={plies > last ? last : undefined} selected={selected} onSelect={onSelect}
      caption={caption} table={table}
      ariaLabel={ariaLabel ?? `Complexity after each move, ${last} plies so far. ${said}. Full values are in the table below.`}
    />
  );
}
