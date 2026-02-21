import TournamentCard from '@/components/TournamentCard';

export default function SimPage() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-4 w-full">
        <h1 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)]">Simulations</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Monte Carlo tournament simulations with interactive scenario building.
        </p>
      </div>

      {/* Active Tournaments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-live" />
          <h2 className="font-heading text-xl text-[var(--text-primary)]">Active Tournaments</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <TournamentCard
            name="2026 Candidates Tournament"
            href="/simulations/candidates-2026"
            description="The Candidates Tournament determines the challenger for the World Chess Championship, who will face D. Gukesh."
            format="8-player double round-robin"
            status="live"
          />
          <TournamentCard
            name="2026 Women's Candidates Tournament"
            href="/simulations/womens-candidates-2026"
            description="The Women's Candidates Tournament determines the challenger for the World Chess Championship, who will face Ju Wenjun."
            format="8-player double round-robin"
            status="live"
          />
        </div>
      </div>

      {/* Past Tournaments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-16 w-full">
        <h2 className="font-heading text-xl text-[var(--text-primary)] mb-4">Past Tournaments</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TournamentCard
            name="FIDE World Championship 2024"
            href="/simulations/fide-world-championship-singapore-2024"
            description="Ding Liren defends his title against Gukesh D."
            format="14 classical games"
            status="completed"
          />
          <TournamentCard
            name="Chess Olympiad Budapest 2024"
            href="/simulations/chess-olympiad-budapest-2024"
            description="Countries battle it out 4v4 to find the best chess nation."
            format="11 rounds of 4v4"
            status="completed"
          />
          <TournamentCard
            name="2024 Candidates Tournament"
            href="/simulations/candidates-2024"
            description="The Candidates Tournament to determine the challenger for the World Chess Championship."
            format="8-player double round-robin"
            status="completed"
          />
          <TournamentCard
            name="2024 Women's Candidates"
            href="/simulations/womens-candidates-2024"
            description="The Women's Candidates Tournament to determine the challenger for the Women's World Chess Championship."
            format="8-player double round-robin"
            status="completed"
          />
        </div>
      </div>
    </main>
  );
}
