import WCCSims from "@/components/WCCSims";
import TournamentInfo from "@/components/TournamentInfo";

const Sims = () => {
  return (
    <main className="container space-y-10 py-16">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Event dossier</p>
        <TournamentInfo
          name="FIDE Chess World Championship Singapore 2024"
          website="https://worldchampionship.fide.com/"
          description="Ding Liren vs Gukesh D, 14 classical games with rapid/blitz tiebreaks if needed."
          format="14 classical games"
        />
      </section>
      <section className="rounded-4xl border border-white/10 bg-black/30 p-6 shadow-subtle">
        <WCCSims justGraph={false} />
      </section>
    </main>
  );
};
export default Sims;
