import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

const WomensCandidatesSimsPage = () => {
  return (
    <div className="relative pt-32 pb-20">
      {/* Hero Section */}
      <section className="mb-12">
        <Link 
          href="/simulations"
          className="
            inline-flex items-center gap-2 
            text-sm text-text-secondary
            mb-6
            transition-colors duration-300
            hover:text-accent
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Simulations</span>
        </Link>
        
        <TournamentInfo
          name="2024 Women's Candidates Tournament"
          website="https://candidates.fide.com/"
          description="The Women's Candidates Tournament determines the challenger for the Women's World Chess Championship, who will face Ju Wenjun."
          format="8-player double round-robin"
          status="completed"
        />
      </section>

      {/* Simulations */}
      <section>
        <SimulationResults eventTable="womens_candidates_2024" />
      </section>
    </div>
  );
};

export default WomensCandidatesSimsPage;
