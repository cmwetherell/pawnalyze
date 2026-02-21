import SimulationResults from "@/components/SimulationResults";
import TournamentHeader from "@/components/simulation/TournamentHeader";
import { getBaseSimulationData } from "@/lib/simulations";

const players = [
  "Nakamura, Hikaru", "Caruana, Fabiano", "Giri, Anish", "Praggnanandhaa R",
  "Wei, Yi", "Esipenko, Andrey", "Bluebaum, Matthias", "Sindarov, Javokhir"
];

export default async function Sims() {
    const initialData = await getBaseSimulationData('candidates_2026');
    return (
        <main className="flex-1 flex flex-col min-h-screen">
            <TournamentHeader
                name="2026 Candidates Tournament"
                website="https://candidates.fide.com/"
                description="The Candidates Tournament determines the challenger for the World Chess Championship, who will face D. Gukesh."
                format="8-player double round-robin"
                players={players}
            />

            {/* Intro */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2">
                <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-3xl">
                    Who will challenge Gukesh for the crown? We ran <strong className="text-chess-gold">over one million Monte Carlo
                    simulations</strong> of the Candidates Tournament to find out. Use the <span className="text-[var(--text-primary)] font-medium">Scenario
                    Builder</span> to set game outcomes and see how the probabilities shift in real time.
                </p>
            </div>

            <SimulationResults eventTable="candidates_2026" initialData={initialData} />

            {/* Methodology */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-4">
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
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Monte Carlo Sims</h3>
                                <p className="text-xs text-[var(--text-muted)]">Over 1M simulations using Elo, color advantage, and draw rates.</p>
                            </div>
                            <div className="surface-card p-4">
                                <div className="w-8 h-8 rounded-lg bg-chess-gold/10 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-chess-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Scenario Explorer</h3>
                                <p className="text-xs text-[var(--text-muted)]">Lock in results and explore &ldquo;what if&rdquo; scenarios.</p>
                            </div>
                            <div className="surface-card p-4">
                                <div className="w-8 h-8 rounded-lg bg-chess-gold/10 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-chess-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Live Tracking</h3>
                                <p className="text-xs text-[var(--text-muted)]">Actual results baked in automatically as rounds complete.</p>
                            </div>
                        </div>

                        <p className="text-sm text-[var(--text-muted)]">
                            For a deeper dive, check out{" "}
                            <a
                                href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html"
                                className="text-chess-gold hover:text-chess-gold-light underline decoration-chess-gold/30 hover:decoration-chess-gold/60 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                How Our Chess Tournament Predictions Work
                            </a>{" "}
                            on the blog.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
