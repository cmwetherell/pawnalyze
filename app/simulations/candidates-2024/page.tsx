import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";

const Sims: any = () => {
  return (
    <main className="page-shell space-y-8">
      <section className="glass-panel p-6">
        <span className="tag-pill">Toronto 2024</span>
        <TournamentInfo
          name="2024 Candidates Tournament"
          website="https://candidates.fide.com/"
          description="Determines the challenger who will face Ding Liren for the world crown."
          format="8-player double round-robin"
        />
      </section>
      <SimulationResults eventTable="candidates_2024" />
    </main>
  );
};
export default Sims;