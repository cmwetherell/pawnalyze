import { MIN_GAMES_FOR_PRIZE } from '@/lib/olympiad/tpr';

interface EligibilityPipsProps {
  games: number;
  needed: number;
  canReach: boolean;
  roundsLeft: number;
  /** Hide the text label (pips still carry an accessible label) */
  compact?: boolean;
}

export function eligibilityLabel(games: number, needed: number, canReach: boolean): string {
  if (needed === 0) return games > MIN_GAMES_FOR_PRIZE ? `Eligible · ${games} games` : 'Eligible';
  if (!canReach) return `Can’t reach ${MIN_GAMES_FOR_PRIZE}`;
  return `Needs ${needed} more`;
}

/** Eight dots for the eight-game minimum: filled = played, dashed = still reachable, faded = out of reach. */
export default function EligibilityPips({ games, needed, canReach, roundsLeft, compact }: EligibilityPipsProps) {
  const played = Math.min(games, MIN_GAMES_FOR_PRIZE);
  const reachable = canReach ? needed : Math.min(needed, roundsLeft);
  const label = eligibilityLabel(games, needed, canReach);
  return (
    <span className="inline-flex flex-col gap-0.5" title={`${games} of ${MIN_GAMES_FOR_PRIZE} games · ${label}`}>
      <span className="inline-flex items-center gap-[3px]" role="img" aria-label={`${games} of ${MIN_GAMES_FOR_PRIZE} games played. ${label}`}>
        {Array.from({ length: MIN_GAMES_FOR_PRIZE }, (_, i) => {
          const cls = i < played
            ? (needed === 0 ? 'bg-gold-ink' : 'bg-[var(--text-secondary)]')
            : i < played + reachable
              ? 'border border-dashed border-[var(--text-muted)]'
              : 'border border-rose-400/40 opacity-60';
          return <span key={i} className={`w-2 h-2 rounded-[3px] ${cls}`} />;
        })}
      </span>
      {!compact && (
        <span className={`text-[11px] leading-tight ${needed === 0 ? 'text-emerald-500' : canReach ? 'text-[var(--text-muted)]' : 'text-rose-400'}`}>{label}</span>
      )}
    </span>
  );
}
