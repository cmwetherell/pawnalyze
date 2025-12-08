
import TournamentInfo from '@/components/TournamentInfo';

const activeEvents = [
  {
    name: 'FIDE Chess World Championship Singapore 2024',
    internalLink: '/simulations/fide-world-championship-singapore-2024',
    website: 'https://worldchampionship.fide.com/',
    description: 'Reigning champion Ding Liren defends against Gukesh D in a 14-game duel.',
    format: '14 classical games + rapid/blitz tie-breaks',
  },
];

const pastEvents = [
  {
    name: 'Chess Olympiad Budapest 2024',
    internalLink: '/simulations/chess-olympiad-budapest-2024',
    website: 'https://chessolympiad2024.fide.com/',
    description: 'National squads battle over 11 swiss rounds to crown the strongest chess nation.',
    format: '11 rounds • 4 boards',
  },
  {
    name: '2024 Candidates Tournament',
    internalLink: '/simulations/candidates-2024',
    website: 'https://candidates.fide.com/',
    description: 'Determines the challenger for the World Championship title against Ding Liren.',
    format: '8-player double round-robin',
  },
  {
    name: '2024 Womens Candidates Tournament',
    internalLink: '/simulations/womens-candidates-2024',
    website: 'https://candidates.fide.com/',
    description: 'Determines the challenger to Ju Wenjun for the Women’s World title.',
    format: '8-player double round-robin',
  },
];

export default function SimPage(): JSX.Element {
  return (
    <main className="page-shell space-y-12">
      <section className="space-y-4">
        <span className="tag-pill">Active tournaments</span>
        <h1 className="font-display text-4xl uppercase tracking-[0.35em] text-paper">Live simulation labs</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {activeEvents.map((event) => (
            <TournamentInfo key={event.name} {...event} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <span className="tag-pill">Historical dossiers</span>
        <h2 className="font-display text-3xl uppercase tracking-[0.35em] text-paper">Past tournaments</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {pastEvents.map((event) => (
            <TournamentInfo key={event.name} {...event} />
          ))}
        </div>
      </section>
    </main>
  );
}
