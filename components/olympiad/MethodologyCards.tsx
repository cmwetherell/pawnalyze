export default function MethodologyCards() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-4 w-full">
      <div className="max-w-3xl">
        <div className="border-t border-[var(--border)] pt-8">
          <h2 className="text-lg font-heading text-[var(--text-primary)] mb-6">How it works</h2>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="surface-card p-4">
              <div className="w-8 h-8 rounded-lg bg-chess-gold/10 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-chess-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Board-by-board Monte Carlo</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Every remaining match is played out on all four boards from the players&apos; ratings, colour and draw tendencies, then scored 2/1/0 in match points.
              </p>
            </div>
            <div className="surface-card p-4">
              <div className="w-8 h-8 rounded-lg bg-chess-gold/10 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-chess-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h10M4 17h6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Swiss pairings, simulated</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Each simulation re-pairs the field round after round by score group, so future opponents are uncertain — exactly as in the real event.
              </p>
            </div>
            <div className="surface-card p-4">
              <div className="w-8 h-8 rounded-lg bg-chess-gold/10 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-chess-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Scenario explorer</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Picking a result keeps only the simulations where it happened. Pick a published pairing, or a team&apos;s result in a round whose pairings aren&apos;t out yet.
              </p>
            </div>
          </div>

          <p className="text-sm text-[var(--text-muted)]">
            Standings shown during the event are computed from match results (match points, then game points) and may differ from
            the official tiebreaks. For the model details see{' '}
            <a
              href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py"
              className="text-chess-gold hover:text-chess-gold-light underline decoration-chess-gold/30 hover:decoration-chess-gold/60 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              the simulation code
            </a>{' '}
            and{' '}
            <a
              href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html"
              className="text-chess-gold hover:text-chess-gold-light underline decoration-chess-gold/30 hover:decoration-chess-gold/60 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              How Our Chess Tournament Predictions Work
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
