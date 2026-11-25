'use client';

import { ChartGroup } from '@/components/charts/ChartGroup';
import { LineChart } from '@/components/charts/LineChart';
import { ComplexityChart } from '@/components/chess/ComplexityChart';
import { moveAxis, moveLabel } from '@/lib/chess/moves';
import { evalPawns, fmtEval, type Colour, type Evaluation, type LivePosition } from '@/lib/live/pgn';
import type { Tone } from '@/lib/theme/tones';

export interface ChartPoint {
  pos: LivePosition;
  complexity: number | null;
  evaluation: Evaluation | null;
}

interface LiveChartsProps {
  points: ChartPoint[];
  selected: number;
  onSelect: (ply: number) => void;
  sides: Record<Colour, { name: string; tone: Tone }>;
  /** Leaves room on the axis for the moves to come. */
  inPlay: boolean;
}

/** Enough for a short game, so the first moves do not fill the width. */
const ROOM_PLIES = 40;

/** Elocator complexity (one line per player) over the Stockfish evaluation, on one move axis. */
export function LiveCharts({ points, selected, onSelect, sides, inPlay }: LiveChartsProps) {
  const last = points.length - 1;
  const plies = inPlay ? Math.max(last, ROOM_PLIES) : last;
  const { labels, every } = moveAxis(plies);
  const most = Math.max(0, ...points.map(p => (p.evaluation ? Math.abs(evalPawns(p.evaluation, 8)) : 0)));
  const cap = most <= 1.8 ? 2 : most <= 3.6 ? 4 : 8;
  const evals = points.map(p => p.evaluation);
  const newest = evals.filter(e => e !== null).at(-1) ?? null;

  return (
    <ChartGroup className="flex flex-col gap-8">
      <ComplexityChart
        points={points.map(p => ({ ply: p.pos.ply, san: p.pos.san, toMove: p.pos.toMove, complexity: p.complexity }))}
        sides={sides} selected={selected} onSelect={onSelect} atLeast={plies}
      />
      <LineChart
        series={[{
          id: 'eval', label: 'Stockfish', tone: 'ink',
          values: labels.map((_, i) => { const e = evals[i]; return e ? evalPawns(e, cap) : null; }),
          texts: labels.map((_, i) => { const e = evals[i]; return e ? fmtEval(e) : null; }),
        }]}
        x={{ labels, titles: labels.map((_, i) => (points[i] ? moveLabel(points[i].pos) : '')), every }}
        y={{ min: -cap, max: cap, ticks: [-cap, 0, cap], format: 'signed' }}
        height={{ desktop: 200, phone: 180 }} area={{ series: 'eval', mode: 'zero' }}
        now={plies > last ? last : undefined} selected={selected} onSelect={onSelect}
        caption={`Stockfish evaluation in pawns. Up is better for White, ${sides.w.name}`}
        ariaLabel={`Stockfish evaluation after each move${newest ? `, now ${fmtEval(newest)}` : ''}. Full values are in the table below.`}
        table={{
          columns: ['After', 'To move', 'Complexity', 'Evaluation'],
          rows: points.map(p => [moveLabel(p.pos), sides[p.pos.toMove].name, p.complexity ?? '–', p.evaluation ? fmtEval(p.evaluation) : '–']),
        }}
      />
    </ChartGroup>
  );
}
