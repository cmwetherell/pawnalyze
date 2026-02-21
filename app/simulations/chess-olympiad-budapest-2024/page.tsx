import OlympiadSims from "@/components/OlympiadSims";
import TournamentHeader from "@/components/simulation/TournamentHeader";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen">
            <TournamentHeader
                name="Chess Olympiad Budapest 2024"
                website="https://chessolympiad2024.fide.com/"
                description="Countries battle it out 4v4 to find the best chess nation."
                format="11 rounds of 4v4 team battles"
            />

            {/* Victory banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 w-full">
                <div className="surface-card p-4 border-chess-gold/30">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <p className="text-sm text-[var(--text-primary)] font-medium">
                            Congrats to India for winning Gold in both the Open and Women&apos;s event!
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
                <OlympiadSims />
            </div>

            {/* Methodology */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full">
                <div className="max-w-3xl">
                    <div className="border-t border-[var(--border)] pt-8">
                        <h2 className="text-lg font-heading text-[var(--text-primary)] mb-4">How it works</h2>
                        <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
                            <p>
                                Before the Olympiad kicked off, we ran 5,000 simulations of the tournament to predict
                                the probabilities that each country wins gold, silver, or bronze. After each round,
                                new simulations were run based on the current results, accounting for the official
                                FIDE pairing logic.
                            </p>
                            <p>
                                Read{' '}
                                <a className="text-chess-gold hover:text-chess-gold-light transition-colors" href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html">
                                    more about the methodology
                                </a>{' '}
                                or view the{' '}
                                <a className="text-chess-gold hover:text-chess-gold-light transition-colors" href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py">
                                    code on GitHub
                                </a>.
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                                <strong>Note:</strong> If a country appears in the table, it won at least one medal in at least one simulation, even if the percentage shows 0.0%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Sims;
