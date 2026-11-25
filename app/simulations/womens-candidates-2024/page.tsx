import { CandidatesPage } from '@/components/simulation/CandidatesPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('2024 Women’s Candidates Tournament Odds', 'How our simulations of the 2024 Women’s Candidates Tournament moved round by round.', { path: '/simulations/womens-candidates-2024', image: 'site' });

export default function Sims() {
  return (
    <CandidatesPage
      eventTable="womens_candidates_2024"
      name="2024 Women’s Candidates Tournament"
      website="https://candidates.fide.com/"
      description="The Women’s Candidates Tournament determined the challenger to face Ju Wenjun for the Women’s World Chess Championship."
      format="8-player double round-robin"
      winner="Tan, Zhongyi"
    />
  );
}
