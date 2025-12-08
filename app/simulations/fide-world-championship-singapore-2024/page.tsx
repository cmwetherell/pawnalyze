import WCCSims from "@/components/WCCSims";
import TournamentInfo from "@/components/TournamentInfo";

const Sims: any = () => {
  return (
    <main className="page-shell space-y-8">
      <section className="glass-panel p-6">
        <span className="tag-pill">Singapore 2024</span>
        <TournamentInfo
          name="FIDE Chess World Championship Singapore 2024"
          website="https://worldchampionship.fide.com/"
          description="Reigning champion Ding Liren defends his title against Gukesh D across 14 classical games."
          format="14 classical games + tie-breaks"
        />
      </section>
      <WCCSims justGraph={false} />
    </main>
  );
};

export default Sims;
