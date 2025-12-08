import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";

const Sims = () => {
  return (
    <main className="container space-y-10 py-16">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Event dossier</p>
        <TournamentInfo
          name="2024 Womens Candidates Tournament"
          website="https://candidates.fide.com/"
          description="Determines the challenger to reigning champion Ju Wenjun."
          format="8-player double round-robin"
        />
      </section>
      <SimulationResults eventTable="womens_candidates_2024" />
    </main>
  );
};
export default Sims;
