import SimulationResults from "@/components/SimulationResults";
import TournamentHeader from "@/components/simulation/TournamentHeader";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-gray-50">
            <TournamentHeader
                name="2026 Candidates Tournament"
                website="https://candidates.fide.com/"
                description="The Candidates Tournament determines the challenger for the World Chess Championship, who will face D. Gukesh."
                format="8-player double round-robin"
            />
            <SimulationResults
                eventTable="candidates_2026"
            />
        </main>
    );
}
export default Sims;
