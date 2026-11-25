import { Pips, type PipItem } from '@/components/ui/Pips';
import type { FormEntryLite } from '@/lib/olympiad/types';

interface FormPipsProps {
  form: FormEntryLite[];
  /** Rounds to draw (1..lastRound); a round without a game was sat out. */
  lastRound: number;
  /** md: lettered, read game by game. sm: for tables, read as one line. */
  size?: 'sm' | 'md';
  className?: string;
}

const RESULT = {
  1: { word: 'Win', letter: 'W', tone: 'win' },
  0.5: { word: 'Draw', letter: 'D', tone: 'draw' },
  0: { word: 'Loss', letter: 'L', tone: 'loss' },
} as const;

export const resultOf = (score: 0 | 0.5 | 1) => RESULT[score];

const against = (f: FormEntryLite) => `${RESULT[f.score].word} vs ${f.oppFedCode ?? 'opponent'} ${f.oppRating || 'unrated'}`;

/** One pip per round. */
export function FormPips({ form, lastRound, size = 'sm', className }: FormPipsProps) {
  const byRound = new Map(form.map(f => [f.round, f]));
  const items = Array.from({ length: Math.max(lastRound, 1) }, (_, i): PipItem => {
    const f = byRound.get(i + 1);
    return f
      ? { label: `R${f.round}: ${against(f)}, ${f.colour === 'w' ? 'white' : 'black'}`, letter: RESULT[f.score].letter, tone: RESULT[f.score].tone }
      : { label: `R${i + 1}: sat out`, tone: 'rest' };
  });
  const summary = form.map(f => `R${f.round} ${against(f)}`).join(', ') || 'No games yet';
  return <Pips kind="form" size={size === 'md' ? 20 : 12} asImage={size === 'sm'} ariaLabel={summary} items={items} className={className} />;
}
