export type ProbTint = 'gold' | 'silver' | 'bronze' | 'neutral' | 'green';

const TINT: Record<ProbTint, string> = {
  gold: 'bg-medal-gold',
  silver: 'bg-medal-silver',
  bronze: 'bg-medal-bronze',
  neutral: 'bg-[var(--text-muted)]',
  green: 'bg-emerald-500',
};

interface ProbBarProps {
  /** 0..1 */
  value: number;
  /** Optional baseline (0..1) drawn as a ghost bar when it differs from value. */
  baseline?: number | null;
  tint?: ProbTint;
  /** Scale the bar so `max` fills the track (defaults to 1). */
  max?: number;
  showLabel?: boolean;
  /** Larger, gold label for the headline column */
  emphasis?: boolean;
  className?: string;
}

export function formatPct(value: number, digits = 1): string {
  const pct = value * 100;
  if (pct > 0 && pct < 0.05) return '<0.1%';
  if (pct >= 99.95 && pct < 100) return '>99.9%';
  return `${pct.toFixed(digits)}%`;
}

export function formatDelta(value: number, baseline: number): string | null {
  const d = (value - baseline) * 100;
  if (Math.abs(d) < 0.05) return null;
  return `${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}`;
}

export default function ProbBar({
  value,
  baseline = null,
  tint = 'gold',
  max = 1,
  showLabel = true,
  emphasis = false,
  className = '',
}: ProbBarProps) {
  const width = Math.min(100, Math.max(0, (value / max) * 100));
  const baseWidth = baseline !== null ? Math.min(100, Math.max(0, (baseline / max) * 100)) : null;
  const delta = baseline !== null ? formatDelta(value, baseline) : null;
  const up = baseline !== null && value > baseline;

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      <div className={`relative flex-1 rounded-full bg-[var(--bg-surface-3)] overflow-hidden min-w-[36px] ${emphasis ? 'h-2.5' : 'h-1.5'}`}>
        {baseWidth !== null && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[var(--text-muted)]/35"
            style={{ width: `${baseWidth}%` }}
          />
        )}
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${TINT[tint]} transition-[width] duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel && (
        <span className={`tabular-nums text-right shrink-0 ${emphasis ? 'text-sm font-semibold text-chess-gold w-[3.5rem]' : 'text-xs text-[var(--text-primary)] w-[3.25rem]'}`}>
          {formatPct(value)}
        </span>
      )}
      {baseline !== null && (
        <span className={`tabular-nums text-[10px] font-semibold w-8 text-right shrink-0 ${up ? 'text-emerald-500' : 'text-rose-400'}`}>
          {delta ?? ''}
        </span>
      )}
    </div>
  );
}
