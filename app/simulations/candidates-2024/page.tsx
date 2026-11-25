import { CandidatesPage } from '@/components/simulation/CandidatesPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('2024 Candidates Tournament Odds', 'How our simulations of the 2024 Candidates Tournament moved round by round.', { path: '/simulations/candidates-2024', image: 'site' });

export default function Sims() {
  return (
    <CandidatesPage
      eventTable="candidates_2024"
      name="2024 Candidates Tournament"
      website="https://candidates.fide.com/"
      description="The Candidates Tournament determined the challenger to face Ding Liren for the World Chess Championship."
      format="8-player double round-robin"
      winner="Gukesh D"
    />
  );
}
