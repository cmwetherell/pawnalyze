import { Pips, type PipItem } from '@/components/ui/Pips';
import { MIN_GAMES_FOR_PRIZE } from '@/lib/olympiad/tpr';

interface EligibilityPipsProps {
  games: number;
  needed: number;
  canReach: boolean;
  roundsLeft: number;
  className?: string;
}

export function eligibilityLabel(needed: number, canReach: boolean): string {
  if (needed === 0) return 'Eligible';
  if (!canReach) return `Can’t reach ${MIN_GAMES_FOR_PRIZE}`;
  return `Needs ${needed} more`;
}

/** Eight pips for the eight-game minimum: filled when played, outlined while still within reach, a line once out of reach. */
export function EligibilityPips({ games, needed, canReach, roundsLeft, className }: EligibilityPipsProps) {
  const words = `${games} ${games === 1 ? 'game' : 'games'} of the ${MIN_GAMES_FOR_PRIZE} needed. ${eligibilityLabel(needed, canReach)}`;
  const played = Math.min(games, MIN_GAMES_FOR_PRIZE);
  const reachable = canReach ? needed : Math.min(needed, roundsLeft);
  const items = Array.from({ length: MIN_GAMES_FOR_PRIZE }, (_, i): PipItem => ({
    label: words,
    tone: i < played ? (needed === 0 ? 'ink' : 'context') : i < played + reachable ? 'none' : 'rest',
  }));
  return <Pips kind="eligibility" size={12} asImage ariaLabel={words} items={items} className={className} />;
}
