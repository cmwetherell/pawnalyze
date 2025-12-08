import TournamentInfo from '@/components/TournamentInfo';
import Link from 'next/link';

// Tournament data
const activeTournaments = [
  {
    name: "FIDE Chess World Championship Singapore 2024",
    internalLink: '/simulations/fide-world-championship-singapore-2024',
    website: "https://worldchampionship.fide.com/",
    description: "Reigning champion Ding Liren defends his title against Gukesh D.",
    format: "14 classical games. Tiebreaks if necessary.",
    status: 'live' as const,
  }
];

const pastTournaments = [
  {
    name: "Chess Olympiad Budapest 2024",
    internalLink: "/simulations/chess-olympiad-budapest-2024",
    website: "https://chessolympiad2024.fide.com/",
    description: "Countries battle it out 4v4 to find the best chess nation.",
    format: "11 rounds of 4v4 team battles",
    status: 'completed' as const,
  },
  {
    name: "2024 Candidates Tournament",
    internalLink: "/simulations/candidates-2024",
    website: "https://candidates.fide.com/",
    description: "The Candidates Tournament determines the challenger for the World Chess Championship.",
    format: "8-player double round-robin",
    status: 'completed' as const,
  },
  {
    name: "2024 Women's Candidates Tournament",
    internalLink: "/simulations/womens-candidates-2024",
    website: "https://candidates.fide.com/",
    description: "The Women's Candidates Tournament determines the challenger for the Women's World Chess Championship.",
    format: "8-player double round-robin",
    status: 'completed' as const,
  }
];

export default function SimPage(): JSX.Element {
  return (
    <div className="relative pt-32 pb-20">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="max-w-3xl">
          <div 
            className="
              inline-flex items-center gap-2 
              px-3 py-1.5 mb-4
              rounded-full
              bg-accent/10 
              border border-accent/20
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '100ms' }}
          >
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs text-accent font-medium uppercase tracking-wider">Monte Carlo Simulations</span>
          </div>
          
          <h1 
            className="
              font-display text-display-md md:text-display-lg
              text-text-primary
              mb-6
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '200ms' }}
          >
            Tournament Simulations
          </h1>
          
          <p 
            className="
              text-lg text-text-secondary
              leading-relaxed
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '300ms' }}
          >
            Explore real-time predictions for major chess tournaments powered by 
            Monte Carlo simulations. See win probabilities update as games progress.
          </p>
        </div>
      </section>

      {/* Active Tournaments */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-display text-heading-xl text-text-primary">
            Active Tournaments
          </h2>
        </div>
        
        <div className="grid gap-6">
          {activeTournaments.map((tournament, index) => (
            <TournamentInfo
              key={index}
              {...tournament}
            />
          ))}
        </div>
      </section>

      {/* Past Tournaments */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <span className="w-2 h-2 rounded-full bg-text-muted" />
          <h2 className="font-display text-heading-xl text-text-primary">
            Past Tournaments
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastTournaments.map((tournament, index) => (
            <TournamentInfo
              key={index}
              {...tournament}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-20 text-center">
        <div className="glass-card p-10 md:p-12">
          <h3 className="font-display text-display-sm text-text-primary mb-4">
            Want to analyze a specific position?
          </h3>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Use Elocator to calculate the complexity of any chess position 
            and understand what makes it difficult for humans.
          </p>
          <Link 
            href="/elocator"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>Try Elocator</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
