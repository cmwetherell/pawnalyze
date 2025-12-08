import TournamentInfo from '@/components/TournamentInfo';

export default function SimPage(): JSX.Element {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="section-container">
        {/* Page Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Monte Carlo Simulations</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-ivory-100 mb-6">
            Tournament Simulations
          </h1>
          
          <p className="text-obsidian-300 text-lg max-w-2xl mx-auto">
            Real-time probability predictions powered by thousands of Monte Carlo simulations. 
            Explore outcomes, test scenarios, and understand the mathematics behind chess tournaments.
          </p>
        </div>

        {/* Active Tournaments Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-display text-2xl font-semibold text-ivory-100">
              Active Tournaments
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          
          <div className="grid gap-6">
            <TournamentInfo
              name="FIDE Chess World Championship Singapore 2024"
              internalLink="/simulations/fide-world-championship-singapore-2024"
              website="https://worldchampionship.fide.com/"
              description="Reigning champion Ding Liren defends his title against challenger Gukesh D in a historic battle for the crown. Follow along as we simulate thousands of possible outcomes."
              format="14 classical games with tiebreaks if necessary"
              isActive={true}
            />
          </div>
        </section>

        {/* Past Tournaments Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-display text-2xl font-semibold text-ivory-100">
              Past Tournaments
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <TournamentInfo
              name="Chess Olympiad Budapest 2024"
              internalLink="/simulations/chess-olympiad-budapest-2024"
              website="https://chessolympiad2024.fide.com/"
              description="Countries battled it out 4v4 to determine the world's strongest chess nation."
              format="11 rounds of 4v4 team battles"
            />
            
            <TournamentInfo
              name="2024 Candidates Tournament"
              internalLink="/simulations/candidates-2024"
              website="https://candidates.fide.com/"
              description="The tournament that determined the challenger for the World Chess Championship."
              format="8-player double round-robin"
            />
            
            <TournamentInfo
              name="2024 Women's Candidates Tournament"
              internalLink="/simulations/womens-candidates-2024"
              website="https://candidates.fide.com/"
              description="The Women's Candidates Tournament determined the challenger for the Women's World Chess Championship."
              format="8-player double round-robin"
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-24 glass-card p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-ivory-100 mb-6">
              How Our Simulations Work
            </h3>
            <p className="text-obsidian-300 leading-relaxed mb-8">
              We run thousands of Monte Carlo simulations based on player ratings, historical performance, 
              and tournament format. Each simulation plays out all remaining games using probability 
              distributions derived from Elo differences, giving us a statistical picture of likely outcomes.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 mb-3">
                  <span className="font-display text-lg font-bold">1</span>
                </div>
                <h4 className="text-ivory-100 font-medium">Gather Data</h4>
                <p className="text-obsidian-400 text-sm">
                  Player ratings, head-to-head history, and current standings
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 mb-3">
                  <span className="font-display text-lg font-bold">2</span>
                </div>
                <h4 className="text-ivory-100 font-medium">Simulate Games</h4>
                <p className="text-obsidian-400 text-sm">
                  Run 10,000+ simulations of remaining games
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 mb-3">
                  <span className="font-display text-lg font-bold">3</span>
                </div>
                <h4 className="text-ivory-100 font-medium">Calculate Odds</h4>
                <p className="text-obsidian-400 text-sm">
                  Aggregate results into probability distributions
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
