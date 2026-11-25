import type { ReactNode } from 'react';

import type { Evaluation } from '@/lib/live/pgn';
import { cn } from '@/lib/utils';
import { Board } from './Board';
import { EvalBar } from './EvalBar';

interface BoardPaneProps {
  fen: string;
  from?: string | null;
  to?: string | null;
  flipped?: boolean;
  label: string;
  /** Name lines of the two players, over and under the board. */
  top?: ReactNode;
  bottom?: ReactNode;
  /** Shows the evaluation bar; null holds its place until there is one. */
  evaluation?: Evaluation | null;
  stale?: boolean;
  controls?: ReactNode;
  className?: string;
}

/** A board with what belongs to it: evaluation bar, names and clocks, controls. Fills its container. */
export function BoardPane({ fen, from, to, flipped = false, label, top, bottom, evaluation, stale = false, controls, className }: BoardPaneProps) {
  return (
    <div className={cn('min-w-0', className)}>
      {top}
      <div className="flex items-stretch gap-2">
        {evaluation !== undefined && <EvalBar evaluation={evaluation} stale={stale} flipped={flipped} />}
        <Board fen={fen} from={from} to={to} flipped={flipped} label={label} className="min-w-0 flex-1" />
      </div>
      {bottom}
      {controls && <div className={bottom ? undefined : 'mt-2'}>{controls}</div>}
    </div>
  );
}
