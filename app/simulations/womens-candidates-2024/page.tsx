import { CandidatesPage } from '@/components/simulation/CandidatesPage';

export default function Sims() {
  return (
    <CandidatesPage
      eventTable="womens_candidates_2024"
      name="2024 Women’s Candidates Tournament"
      website="https://candidates.fide.com/"
      description="The Women’s Candidates Tournament determines the challenger for the Women’s World Chess Championship, who will face Ju Wenjun."
      format="8-player double round-robin"
      winner="Tan, Zhongyi"
    />
  );
}
