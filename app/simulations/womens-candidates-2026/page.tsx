import SimulationResults from "@/components/SimulationResults";
import TournamentHeader from "@/components/simulation/TournamentHeader";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-gray-50">
            <TournamentHeader
                name="2026 Women's Candidates Tournament"
                website="https://candidates.fide.com/"
                description="The Women's Candidates Tournament determines the challenger for the World Chess Championship, who will face Ju Wenjun."
                format="8-player double round-robin"
            />

            {/* Intro */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-2">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                    Who will challenge Ju Wenjun for the title? We ran <strong className="text-gray-800">over one million Monte Carlo
                    simulations</strong> of the Women&rsquo;s Candidates Tournament to find out. Use the <strong className="text-gray-800">Scenario
                    Builder</strong> to set game outcomes and see how the probabilities shift in real time.
                </p>
            </div>

            <SimulationResults eventTable="womens_candidates_2026" />

            {/* Methodology */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-4">
                <div className="max-w-3xl">
                    <div className="border-t border-gray-200 pt-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">How it works</h2>

                        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <p>
                                Each simulation plays out every remaining game of the 14-round double
                                round-robin. Individual game outcomes are drawn from a model that
                                accounts for each player&rsquo;s Elo rating, color advantage, and
                                historical draw rates at the elite level. After over a million full tournament
                                simulations, we tally how often each player finishes first to produce
                                win probabilities.
                            </p>
                            <p>
                                When you lock in results with the Scenario Builder, those outcomes
                                become fixed &mdash; simulations only randomize the games you
                                haven&rsquo;t set. This lets you explore &ldquo;what if&rdquo;
                                scenarios: <em>What happens if Goryachkina wins her next game? What if
                                Koneru draws?</em> The chart updates instantly to reflect your
                                custom scenario.
                            </p>
                            <p>
                                As the real tournament progresses, actual results are baked into the
                                model automatically. The chart tracks how each player&rsquo;s chances
                                evolve round by round &mdash; spikes, collapses, and everything in
                                between.
                            </p>
                            <p className="text-gray-500">
                                For a deeper dive into the underlying model and methodology, check
                                out{" "}
                                <a
                                    href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html"
                                    className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    How Our Chess Tournament Predictions Work
                                </a>{" "}
                                on the Pawnalyze blog.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
export default Sims;
