import OlympiadSims from "@/components/OlympiadSims";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

export default function OlympiadPage() {
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

        {/* Congratulations Banner */}
        <div className="glass-card p-6 mb-8 border-amber-400/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <p className="text-ivory-100 font-medium">
              Congratulations to India for winning Gold in both the Open and Women&apos;s events!
            </p>
          </div>
        </div>

        {/* Tournament Header */}
        <div className="mb-12">
          <TournamentInfo
            name="Chess Olympiad Budapest 2024"
            website="https://chessolympiad2024.fide.com/"
            description="Nations battled it out 4v4 to determine the world's strongest chess nation in this prestigious team event."
            format="11 rounds of 4v4 team battles"
          />
        </div>

        {/* Simulations Component */}
        <div className="glass-card p-6 md:p-8 mb-12">
          <OlympiadSims />
        </div>

        {/* Explanation Section */}
        <section className="glass-card p-8 space-y-6">
          <h3 className="font-display text-xl font-semibold text-ivory-100">
            What Am I Looking At?
          </h3>
          
          <div className="space-y-4 text-obsidian-300 leading-relaxed">
            <p>
              Before the Olympiad kicked off, I ran 5,000 simulations of the tournament to 
              predict the probabilities that each country wins gold, silver, or bronze. 
              After each round, new simulations were run based on the current results. 
              The simulations also account for the official FIDE pairing logic.
            </p>
            
            <p>
              In case you&apos;re wondering, yes, it was a nightmare to program. And it&apos;s not 
              quite perfect. For example, I&apos;m tracking how many whites each country has played. 
              When two teams face off, whoever has had white on board one more times gets the 
              black pieces. When they&apos;ve played white the same amount, the pieces should go 
              to whoever had white less recently. Right now, I randomize this—a small detail 
              that doesn&apos;t materially impact predictions.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                Read Technical Details
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <a 
                href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                View Code on GitHub
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-obsidian-500 text-sm">
              <strong className="text-obsidian-400">Note:</strong> If a country appears in the list, 
              it means they won at least one medal in at least one simulation, even if showing 0.0%. 
              Countries that never won a medal in any simulation are not displayed.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
