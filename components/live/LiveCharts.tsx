'use client';

import { ChartFrame, type ChartTable } from '@/components/charts/ChartFrame';
import { ChartGroup, useChartGroup } from '@/components/charts/ChartGroup';
import { LineChart } from '@/components/charts/LineChart';
import { Board } from '@/components/chess/Board';
import { ChartPending, ComplexityChart } from '@/components/chess/ComplexityChart';
import { ComplexityScale } from '@/components/chess/ComplexityScale';
import { Heading } from '@/components/ui/Heading';
import { moveAxis, moveLabel, positionLabel } from '@/lib/chess/moves';
import { evalPawns, fmtEval, type Color, type Evaluation, type LivePosition } from '@/lib/live/pgn';
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
  sides: Record<Color, { name: string; tone: Tone }>;
  /** Leaves room on the axis for the moves to come. */
  inPlay: boolean;
  flipped: boolean;
  /** A source that does not answer. */
  failing: { complexity: boolean; evaluation: boolean };
}

/** Enough for a short game, so the first moves do not fill the width. */
const ROOM_PLIES = 40;
const EVAL_HEIGHT = { desktop: 200, phone: 180 };

/** Elocator complexity (one line per player) over the Stockfish evaluation, on one move axis. */
export function LiveCharts({ points, selected, onSelect, sides, inPlay, flipped, failing }: LiveChartsProps) {
  const last = points.length - 1;
  const plies = inPlay ? Math.max(last, ROOM_PLIES) : last;
  const { labels, every } = moveAxis(plies);
  const most = Math.max(0, ...points.map(p => (p.evaluation ? Math.abs(evalPawns(p.evaluation, 8)) : 0)));
  const cap = most <= 1.8 ? 2 : most <= 3.6 ? 4 : 8;
  const evals = points.map(p => p.evaluation);
  const newest = evals.filter(e => e !== null).at(-1) ?? null;

  const caption = `Stockfish evaluation in pawns. Up is better for White, ${sides.w.name}`;
  const table: ChartTable = {
    columns: ['After', 'To move', 'Complexity', 'Evaluation'],
    rows: points.map(p => [moveLabel(p.pos), sides[p.pos.toMove].name, p.complexity ?? '–', p.evaluation ? fmtEval(p.evaluation) : '–']),
  };

  return (
    <ChartGroup className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-12">
      <PointedAt points={points} selected={selected} sides={sides} flipped={flipped} />
      <div className="flex min-w-0 flex-col gap-8 lg:col-span-9 lg:col-start-1 lg:row-start-1">
        <ComplexityChart
          pending={failing.complexity ? 'Elocator is waking up, retrying' : 'Scoring the positions'}
          points={points.map(p => ({ ply: p.pos.ply, san: p.pos.san, toMove: p.pos.toMove, complexity: p.complexity }))}
          sides={sides} selected={selected} onSelect={onSelect} atLeast={plies}
        />
        {newest === null ? (
          <ChartFrame caption={caption} ariaLabel="Stockfish evaluation, not available yet" height={EVAL_HEIGHT} table={table} empty={<ChartPending title={failing.evaluation ? 'Evaluation source unreachable, retrying' : 'Waiting for an evaluation'} height={EVAL_HEIGHT} />}>{() => null}</ChartFrame>
        ) : (
          <LineChart
            series={[{
              id: 'eval', label: 'Stockfish', tone: 'ink',
              values: labels.map((_, i) => { const e = evals[i]; return e ? evalPawns(e, cap) : null; }),
              texts: labels.map((_, i) => { const e = evals[i]; return e ? fmtEval(e) : null; }),
            }]}
            x={{ labels, titles: labels.map((_, i) => (points[i] ? moveLabel(points[i].pos) : '')), every }}
            y={{ min: -cap, max: cap, ticks: [-cap, 0, cap], format: 'signed' }}
            height={EVAL_HEIGHT} area={{ series: 'eval', mode: 'zero' }}
            now={plies > last ? last : undefined} selected={selected} onSelect={onSelect}
            caption={caption}
            ariaLabel={`Stockfish evaluation after each move, now ${fmtEval(newest)}. Full values are in the table below.`}
            table={table}
          />
        )}
      </div>
    </ChartGroup>
  );
}

type PointedAtProps = Pick<LiveChartsProps, 'points' | 'selected' | 'sides' | 'flipped'>;

/** The position under the crosshair, or the selected one: the big board is a screen away from the charts. */
function PointedAt({ points, selected, sides, flipped }: PointedAtProps) {
  const hover = useChartGroup()?.hover ?? null;
  const { pos, complexity, evaluation } = points[hover ?? selected] ?? points[selected];
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 lg:sticky lg:top-24 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:grid-cols-1 lg:self-start">
      <Board fen={pos.fen} from={pos.from} to={pos.to} flipped={flipped} label={positionLabel(pos)} coords={false} />
      <div className="flex min-w-0 flex-col gap-1">
        <Heading level={3} style="h3">{moveLabel(pos)}</Heading>
        <p className="type-small text-ink-2">{pos.over ? 'Game over on the board' : `${sides[pos.toMove].name} to move`}</p>
        <p className="type-small text-ink-2 tnum">Stockfish <span className="font-medium text-ink">{evaluation ? fmtEval(evaluation) : '–'}</span></p>
        <ComplexityScale score={complexity} className="mt-1" />
      </div>
    </div>
  );
}
