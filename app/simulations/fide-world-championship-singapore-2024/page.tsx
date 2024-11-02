import OlympiadSims from "@/components/OlympiadSims";
import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-white">
            <div>
                <h2>Coming soon!</h2>
                <TournamentInfo
                    name="FIDE Chess World Championship Singapore 2024"
                    website="https://worldchampionship.fide.com/"
                    description="Reigning champion DIng Liren defends his title against Gukesh D."
                    format="14 classical games. Tiebreaks if necessary."
                />
                {/* <OlympiadSims /> */}
            </div>
        </main>
    );
}

export default Sims;
