import { CandidatesPage } from '@/components/simulation/CandidatesPage';
import { getBaseSimulationData } from '@/lib/simulations';

const players = [
  'Goryachkina, Aleksandra', 'Muzychuk, Anna', 'Tan, Zhongyi', 'Lagno, Kateryna',
  'Rameshbabu, Vaishali', 'Assaubayeva, Bibisara', 'Zhu, Jiner', 'Deshmukh, Divya',
];

export default async function Sims() {
  const initialData = await getBaseSimulationData('womens_candidates_2026');
  return (
    <CandidatesPage
      eventTable="womens_candidates_2026"
      name="2026 Women’s Candidates Tournament"
      website="https://candidates.fide.com/"
      description="The Women’s Candidates Tournament determined the challenger for the Women’s World Chess Championship, who will face Ju Wenjun."
      format="8-player double round-robin"
      winner="Rameshbabu, Vaishali"
      players={players}
      intro={<p>Vaishali Rameshbabu won the 2026 Women’s Candidates Tournament and will face Ju Wenjun for the Women’s World Championship. We ran over one million Monte Carlo simulations throughout the event. Use the <span className="font-medium">Scenario Builder</span> to replay alternate histories.</p>}
      initialData={initialData}
      method
    />
  );
}
