import { CandidatesPage } from '@/components/simulation/CandidatesPage';

export default function Sims() {
  return (
    <CandidatesPage
      eventTable="candidates_2024"
      name="2024 Candidates Tournament"
      website="https://candidates.fide.com/"
      description="The Candidates Tournament determines the challenger for the World Chess Championship, who will face Ding Liren."
      format="8-player double round-robin"
      winner="Gukesh D"
    />
  );
}
