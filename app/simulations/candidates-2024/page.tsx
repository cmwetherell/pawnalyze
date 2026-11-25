import { CandidatesPage } from '@/components/simulation/CandidatesPage';

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
