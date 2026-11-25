import { fmtEval, whiteShare, type Evaluation } from '@/lib/live/pgn';
import { cn } from '@/lib/utils';

interface EvalBarProps { evaluation: Evaluation | null; stale: boolean; flipped: boolean; className?: string }

/** 28px holds four characters: "1.2", "14", "M12". Which end it stands at says who is better. */
function short(e: Evaluation): string {
  const full = fmtEval(e);
  if (e.mate !== undefined) return e.mate === 0 ? full : `M${Math.abs(e.mate)}`;
  const v = Math.abs((e.cp ?? 0) / 100);
  return v >= 10 ? v.toFixed(0) : v.toFixed(1);
}

/** Beside the board: White's share of the winning chances. */
export function EvalBar({ evaluation, stale, flipped, className }: EvalBarProps) {
  const share = evaluation ? whiteShare(evaluation) : 0.5;
  const whiteAhead = share >= 0.5;
  const labelAtTop = whiteAhead === flipped;
  return (
    <div
      role="img"
      aria-label={evaluation ? `Stockfish evaluation ${fmtEval(evaluation)}${stale ? ', previous move' : ''}` : 'Evaluation not available yet'}
      className={cn('relative w-7 shrink-0 overflow-hidden rounded-sm border border-control bg-eval-black transition-opacity duration-in', stale && 'opacity-60', className)}
    >
      <div className={cn('absolute inset-x-0 bg-eval-white transition-[height] duration-data', flipped ? 'top-0' : 'bottom-0')} style={{ height: `${share * 100}%` }} />
      {/* Level: where the two halves would meet. */}
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-control" />
      <span aria-hidden className={cn('absolute inset-x-0 text-center type-label font-medium tnum', labelAtTop ? 'top-1' : 'bottom-1', whiteAhead ? 'text-piece-black' : 'text-eval-white')}>
        {evaluation ? short(evaluation) : '–'}
      </span>
    </div>
  );
}
