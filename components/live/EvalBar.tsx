import { fmtEval, whiteShare, type Evaluation } from '@/lib/live/pgn';

/** Vertical bar beside the board: White's share of the winning chances. */
export default function EvalBar({ evaluation, stale, flipped }: { evaluation: Evaluation | null; stale: boolean; flipped: boolean }) {
  const share = evaluation ? whiteShare(evaluation) : 0.5;
  const label = evaluation ? fmtEval(evaluation) : '…';
  const whiteAhead = share >= 0.5;
  const whiteEnd = flipped ? 'top' : 'bottom';
  const blackEnd = flipped ? 'bottom' : 'top';
  return (
    <div
      className={`relative w-7 shrink-0 rounded-md overflow-hidden border border-[var(--border)] transition-opacity ${stale ? 'opacity-60' : ''}`}
      style={{ background: '#2b2f36' }}
      role="img"
      aria-label={evaluation ? `Stockfish evaluation ${label}` : 'Evaluation not available yet'}
    >
      <div className="absolute inset-x-0 bg-[#f3f4f6] motion-safe:transition-[height] motion-safe:duration-500" style={{ [whiteEnd]: 0, height: `${share * 100}%` }} />
      <span
        className="absolute inset-x-0 text-center text-[9px] font-semibold tabular-nums"
        style={{ [whiteAhead ? whiteEnd : blackEnd]: 3, color: whiteAhead ? '#111827' : '#f3f4f6' }}
      >
        {label}
      </span>
    </div>
  );
}
