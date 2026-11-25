import { CandidatesPage } from '@/components/simulation/CandidatesPage';
import { getBaseSimulationData } from '@/lib/simulations';

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
      description="The Candidates Tournament determined the challenger for the World Chess Championship, who will face Gukesh D."
      format="8-player double round-robin"
      winner="Sindarov, Javokhir"
      players={players}
      intro={<p>Javokhir Sindarov won the 2026 Candidates Tournament and will face Gukesh D for the World Championship. We ran over one million Monte Carlo simulations throughout the event. Use the <span className="font-medium">Scenario Builder</span> to replay alternate histories.</p>}
      initialData={initialData}
      method
    />
  );
}
