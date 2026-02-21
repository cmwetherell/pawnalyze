import WCCSims from "@/components/WCCSims";
import TournamentHeader from "@/components/simulation/TournamentHeader";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen">
            <TournamentHeader
                name="FIDE Chess World Championship Singapore 2024"
                website="https://worldchampionship.fide.com/"
                description="Reigning champion Ding Liren defends his title against Gukesh D."
                format="14 classical games. Tiebreaks if necessary."
            />
            <div className="py-4">
                <WCCSims justGraph={false} />
            </div>
        </main>
    );
}

export default Sims;
