import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-white">
        <div>
            <TournamentInfo
                name="2026 Womens Candidates Tournament"
                website="https://candidates.fide.com/"
                description="The Womens Candidates Tournament determines the challenger for the World Chess Championship, who will face Ju Wenjun."
                format="8-player double round-robin"
            />
            <SimulationResults
                eventTable="womens_candidates_2026"
            />
        </div>
        </main>
    );
    }
export default Sims;