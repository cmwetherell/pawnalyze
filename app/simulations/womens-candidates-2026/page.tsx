import { CandidatesPage } from '@/components/simulation/CandidatesPage';
import { getBaseSimulationData } from '@/lib/simulations';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('2026 Women’s Candidates Tournament Odds', 'How our simulations of the 2026 Women’s Candidates Tournament moved round by round.', { path: '/simulations/womens-candidates-2026', image: 'site' });

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
      description="The Women’s Candidates Tournament determined Ju Wenjun’s challenger for the Women’s World Chess Championship."
      format="8-player double round-robin"
      winner="Rameshbabu, Vaishali"
      players={players}
      intro={<p>Vaishali Rameshbabu won the 2026 Women’s Candidates Tournament and the right to play Ju Wenjun for the Women’s World Championship. We ran over one million Monte Carlo simulations throughout the event.</p>}
      initialData={initialData}
      method
    />
  );
}
