import SimulationResults from "@/components/SimulationResults";
import TournamentHeader from "@/components/simulation/TournamentHeader";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen">
            <TournamentHeader
                name="2024 Women's Candidates Tournament"
                website="https://candidates.fide.com/"
                description="The Women's Candidates Tournament determines the challenger for the World Chess Championship, who will face Ju Wenjun."
                format="8-player double round-robin"
            />
            <SimulationResults eventTable="womens_candidates_2024" />
        </main>
    );
}
export default Sims;
