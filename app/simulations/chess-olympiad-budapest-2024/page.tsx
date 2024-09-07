import OlympiadSims from "@/components/OlympiadSims";
import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-white">
        <div>
            <TournamentInfo
                name="Chess Olympiad Budapest 2024"
                website="https://chessolympiad2024.fide.com/"
                description="Country's battle it out 4v4 to find the best chess nation."
                format="11 rounds of 4v4 team battles"
            />
            {/* add text to make clear that this page is in beta, dont trust on simulations yet */}
            <p className = "text-xl font-bold text-center text-black mb-2 mt-12">This page is in beta. Do not trust the simulations yet.</p>
            <OlympiadSims />
        </div>
        </main>
    );
    }
export default Sims;