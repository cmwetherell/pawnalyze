import { MIN_GAMES_FOR_PRIZE, UNRATED_OPP_RATING } from '@/lib/olympiad/tpr';

const cards = [
  {
    title: 'Performance rating decides',
    body: 'Each board medal goes to the highest tournament performance rating (TPR): the average rating of a player’s opponents plus FIDE’s bonus for their percentage score. A 75% score is worth about +190 points; a perfect score +800.',
  },
  {
    title: `${MIN_GAMES_FOR_PRIZE} games to qualify`,
    body: `Only players with at least ${MIN_GAMES_FOR_PRIZE} of the 11 games are eligible, and ties are broken by the greater number of games. Captains who rest a star too often can talk them out of a medal.`,
  },
  {
    title: 'Early leaders come from small teams',
    body: 'Two wins against lower-rated opponents can top the table after round two. The pairings soon bring stronger opposition, and the eight-game rule sorts out who is really in the race.',
  },
];

export default function BoardRaceExplainer() {
  return (
    <section className="mt-8 border-t border-[var(--border)] pt-8 max-w-3xl" aria-labelledby="board-race-how">
      <h2 id="board-race-how" className="text-lg font-heading text-[var(--text-primary)] mb-4">How board medals work</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.title} className="surface-card p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{c.title}</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--text-muted)] leading-relaxed">
        Players compete on the board they hold in their team list, with the reserve as a fifth category. Ratings and results come from the
        official broadcast; unrated opponents count as {UNRATED_OPP_RATING}, and unplayed games (forfeits) are excluded, following the FIDE
        rating regulations. Source: {' '}
        <a href="https://handbook.fide.com/files/handbook/Olympiad2026MainCompetition.pdf" target="_blank" rel="noopener noreferrer" className="text-gold-ink underline decoration-chess-gold/30 hover:text-chess-gold-light">
          FIDE Chess Olympiad 2026 regulations
        </a>, article 4.6.3.
      </p>
    </section>
  );
}
