import WCCSims from "@/components/WCCSims";
import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-white">
            <div>
                <TournamentInfo
                    name="FIDE Chess World Championship Singapore 2024"
                    website="https://worldchampionship.fide.com/"
                    description="Reigning champion DIng Liren defends his title against Gukesh D."
                    format="14 classical games. Tiebreaks if necessary."
                />
                <WCCSims />
            </div>
        </main>
    );
}

export default Sims;
