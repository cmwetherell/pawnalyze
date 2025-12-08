import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";

const Sims: any = () => {
  return (
    <main className="page-shell space-y-8">
      <section className="glass-panel p-6">
        <span className="tag-pill">Toronto 2024</span>
        <TournamentInfo
          name="2024 Womens Candidates Tournament"
          website="https://candidates.fide.com/"
          description="Determines the challenger to Ju Wenjun for the Women’s World Championship."
          format="8-player double round-robin"
        />
      </section>
      <SimulationResults eventTable="womens_candidates_2024" />
    </main>
  );
};
export default Sims;
