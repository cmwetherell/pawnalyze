import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

export default function CandidatesPage() {
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
            name="2024 Candidates Tournament"
            website="https://candidates.fide.com/"
            description="The Candidates Tournament determined the challenger for the World Chess Championship, ultimately deciding who would face Ding Liren for the title."
            format="8-player double round-robin"
          />
        </div>

        {/* Results Section */}
        <div className="glass-card p-6 md:p-8 mb-12">
          <SimulationResults eventTable="candidates_2024" />
        </div>

        {/* Tournament Info */}
        <section className="glass-card p-8">
          <h3 className="font-display text-xl font-semibold text-ivory-100 mb-4">
            About the Tournament
          </h3>
          <p className="text-obsidian-300 leading-relaxed">
            The 2024 Candidates Tournament featured eight of the world&apos;s best chess players 
            competing in a double round-robin format. Our simulations tracked win probabilities 
            throughout the tournament, updating after each round to reflect the evolving standings.
          </p>
        </section>
      </div>
    </main>
  );
}
