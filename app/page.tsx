import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import ChessAI from "@/components/LoadingChessAI";
import GetPredictions from "@/components/currentPredictions";
import ChessButton from "@/components/Button";

// const CurrentPredictions = dynamic(() => import("@/components/currentPredictions"), {
//   loading: () => <ChessAI />, // Display this component while loading
// });

export default function Home() {
  return (
    <main className="flex-1 flex flex-col mt-6">
      {/* <div className="flex-1 flex flex-col bg-white p-8 justify-center"> */}
        <h1 className="text-6xl font-bold text-center text-black mb-2 mt-12">Your source for chess analytics</h1>
        <p className="text-2xl text-center text-black">Insights for chess tournaments, games, and positions.</p>
        <div className="flex-1 mt-4 mb-12">
          <div style={{ display: "block", margin: "0 auto", maxWidth: "200px"}}>
            <ChessButton
                text="Candidates 2024"
                link="/simulations"
            />
        </div>
          {/* test: current predictions for 2024 Candidates Tournament */}
        <p className="mt-6 text-8 font-bold text-center text-black">Current Predictions for 2024 Candidates Tournament</p>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <GetPredictions
            nsims={10000}
            gameFilters = {[]} // no filters
            />
        </div>
      </div>
    </main>
  );
}
