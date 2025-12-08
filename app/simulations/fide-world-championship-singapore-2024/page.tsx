import WCCSims from "@/components/WCCSims";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

const WCCSimsPage = () => {
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
          name="FIDE Chess World Championship Singapore 2024"
          website="https://worldchampionship.fide.com/"
          description="Reigning champion Ding Liren defends his title against Gukesh D in a historic showdown."
          format="14 classical games. Tiebreaks if necessary."
          status="live"
        />
      </section>

      {/* Simulations */}
      <section>
        <WCCSims justGraph={false}/>
      </section>
    </div>
  );
};

export default WCCSimsPage;
