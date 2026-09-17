import type { FormEntryLite } from '@/lib/olympiad/types';

interface FormPipsProps {
  form: FormEntryLite[];
  /** Rounds to draw (1..lastRound); rounds without a game show as hollow */
  lastRound: number;
  size?: 'sm' | 'md';
}

const COLOUR = { 1: 'bg-emerald-500', 0.5: 'bg-[var(--text-muted)]', 0: 'bg-rose-500' } as const;
const WORD = { 1: 'Win', 0.5: 'Draw', 0: 'Loss' } as const;

/** One dot per round: green win, grey draw, red loss, hollow when the player sat out. */
export default function FormPips({ form, lastRound, size = 'sm' }: FormPipsProps) {
  const byRound = new Map(form.map(f => [f.round, f]));
  const dim = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
  const rounds = Array.from({ length: Math.max(lastRound, 1) }, (_, i) => i + 1);
  return (
    <span className="inline-flex items-center gap-[3px]" role="img" aria-label={form.map(f => `R${f.round} ${WORD[f.score]} vs ${f.oppFedCode ?? 'opponent'} ${f.oppRating || 'unrated'}`).join(', ') || 'No games yet'}>
      {rounds.map(r => {
        const f = byRound.get(r);
        return f ? (
          <span
            key={r}
            title={`R${r}: ${WORD[f.score]} vs ${f.oppFedCode ?? 'opponent'} ${f.oppRating || 'unrated'}, ${f.colour === 'w' ? 'white' : 'black'}`}
            className={`${dim} rounded-full ${COLOUR[f.score]}`}
          />
        ) : (
          <span key={r} title={`R${r}: sat out`} className={`${dim} rounded-full border border-[var(--border)]`} />
        );
      })}
    </span>
  );
}
