import { CandidatesPage } from '@/components/simulation/CandidatesPage';
import { getBaseSimulationData } from '@/lib/simulations';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('2026 Candidates Tournament Odds', 'How our simulations of the 2026 Candidates Tournament moved round by round.', { path: '/simulations/candidates-2026', image: 'site' });

const players = [
  'Nakamura, Hikaru', 'Caruana, Fabiano', 'Giri, Anish', 'Praggnanandhaa R',
  'Wei, Yi', 'Esipenko, Andrey', 'Bluebaum, Matthias', 'Sindarov, Javokhir',
];

export default async function Sims() {
  const initialData = await getBaseSimulationData('candidates_2026');
  return (
    <CandidatesPage
      eventTable="candidates_2026"
      name="2026 Candidates Tournament"
      website="https://candidates.fide.com/"
      description="The Candidates Tournament determined Gukesh D’s challenger for the World Chess Championship."
      format="8-player double round-robin"
      winner="Sindarov, Javokhir"
      players={players}
      intro={<p>Javokhir Sindarov won the 2026 Candidates Tournament and the right to play Gukesh D for the World Championship. We ran over one million Monte Carlo simulations throughout the event.</p>}
      initialData={initialData}
      method
    />
  );
}
