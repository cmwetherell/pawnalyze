import WCCSims from "@/components/WCCSims";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

export default function WorldChampionshipPage() {
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
            name="FIDE Chess World Championship Singapore 2024"
            website="https://worldchampionship.fide.com/"
            description="Reigning champion Ding Liren defends his title against challenger Gukesh D in a historic battle for the crown. Watch as we simulate thousands of possible outcomes in real-time."
            format="14 classical games with tiebreaks if necessary"
            isActive={true}
          />
        </div>

        {/* Main Simulations Component */}
        <WCCSims justGraph={false} />

        {/* Additional Info Section */}
        <section className="mt-16 glass-card p-8">
          <h3 className="font-display text-xl font-semibold text-ivory-100 mb-4">
            About This Tournament
          </h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-obsidian-300 leading-relaxed">
              The 2024 FIDE World Chess Championship sees defending champion Ding Liren face off against 
              18-year-old prodigy Gukesh Dommaraju. The match consists of 14 classical games, with tiebreaks 
              scheduled if the score is level after the classical portion.
            </p>
            <p className="text-obsidian-300 leading-relaxed mt-4">
              Our simulations use Monte Carlo methods to project thousands of possible match outcomes based on 
              current Elo ratings, historical performance, and match dynamics. Use the scenario explorer to 
              see how different game results would affect each player&apos;s chances of winning the championship.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
