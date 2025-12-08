import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";

const Sims = () => {
  return (
    <main className="container space-y-10 py-16">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Event dossier</p>
        <TournamentInfo
          name="2024 Candidates Tournament"
          website="https://candidates.fide.com/"
          description="Eight heavyweights chase the right to challenge Ding Liren."
          format="8-player double round-robin"
        />
      </section>
      <SimulationResults eventTable="candidates_2024" />
    </main>
  );
};
export default Sims;
