import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

export default function WomensCandidatesPage() {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="section-container">
        {/* Back Link */}
        <Link 
          href="/simulations"
          className="inline-flex items-center gap-2 text-obsidian-400 hover:text-amber-400 text-sm transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Simulations
        </Link>

        {/* Tournament Header */}
        <div className="mb-12">
          <TournamentInfo
            name="2024 Women's Candidates Tournament"
            website="https://candidates.fide.com/"
            description="The Women's Candidates Tournament determined the challenger for the Women's World Chess Championship, deciding who would face Ju Wenjun for the title."
            format="8-player double round-robin"
          />
        </div>

        {/* Results Section */}
        <div className="glass-card p-6 md:p-8 mb-12">
          <SimulationResults eventTable="womens_candidates_2024" />
        </div>

        {/* Tournament Info */}
        <section className="glass-card p-8">
          <h3 className="font-display text-xl font-semibold text-ivory-100 mb-4">
            About the Tournament
          </h3>
          <p className="text-obsidian-300 leading-relaxed">
            The 2024 Women&apos;s Candidates Tournament featured eight of the world&apos;s best female 
            chess players competing in a double round-robin format. Our simulations tracked win 
            probabilities throughout the tournament, updating after each round to reflect the 
            evolving standings.
          </p>
        </section>
      </div>
    </main>
  );
}
