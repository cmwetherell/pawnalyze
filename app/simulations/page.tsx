import TournamentInfo from '@/components/TournamentInfo';

const active = [
  {
    name: 'FIDE Chess World Championship Singapore 2024',
    internalLink: '/simulations/fide-world-championship-singapore-2024',
    website: 'https://worldchampionship.fide.com/',
    description: 'Ding Liren defends the crown against phenom Gukesh D across 14 classical games.',
    format: '14 classical games + rapid/blitz tiebreaks',
  },
];

const past = [
  {
    name: 'Chess Olympiad Budapest 2024',
    internalLink: '/simulations/chess-olympiad-budapest-2024',
    website: 'https://chessolympiad2024.fide.com/',
    description: 'Nations collide 4v4 while our medal radar tracked every fluctuation.',
    format: '11 rounds • 4 boards • Team Swiss',
  },
  {
    name: '2024 Candidates Tournament',
    internalLink: '/simulations/candidates-2024',
    website: 'https://candidates.fide.com/',
    description: 'Eight gladiators decide the next challenger for the World Championship.',
    format: '8-player double round-robin',
  },
  {
    name: '2024 Womens Candidates Tournament',
    internalLink: '/simulations/womens-candidates-2024',
    website: 'https://candidates.fide.com/',
    description: 'Determines who faces Ju Wenjun for the women’s title.',
    format: '8-player double round-robin',
  },
];

export default function SimPage(): JSX.Element {
  return (
    <main className="container space-y-12 py-16">
      <section className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Simulations</p>
        <h1 className="font-display text-5xl text-sand">Tournament console</h1>
        <p className="text-lg text-sand-muted">
          Every event gets its own cinematic dashboard with Monte Carlo projections, medal radars, and adjustable filters.
        </p>
      </section>
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Active</p>
        <div className="space-y-6">
          {active.map((event) => (
            <TournamentInfo key={event.name} {...event} />
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Archive</p>
        <div className="space-y-6">
          {past.map((event) => (
            <TournamentInfo key={event.name} {...event} />
          ))}
        </div>
      </section>
    </main>
  );
}
