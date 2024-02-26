import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-white">
        <div>
            <TournamentInfo
                name="2024 Candidates Tournament"
                website="https://candidates.fide.com/"
                description="The Candidates Tournament determines the challenger for the World Chess Championship, who will face Ding Liren."
                format="8-player double round-robin"
            />
            <SimulationResults 

            />
        </div>
        </main>
    );
    }
export default Sims;