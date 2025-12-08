'use client'
// components/SimulationResults.tsx
import React, { useState } from "react";
import GetPredictions from "@/components/currentPredictions";
import GameHouse from "@/components/GameHouse";
import ChessButton from "./Button";
import { Game } from "@/types";

const SimulationResults = ({ eventTable }: { eventTable: string }) => {
  const nsims = 10000;
  const [gameFilters, setGameFilters] = useState<Game[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const handleGameFilterChange = (selectedGames: Game[]) => {
    setGameFilters(selectedGames);
  };

  const handleSubmit = () => {
    setUpdateTrigger((current) => current + 1);
  };

  return (
    <div className="relative mt-10 overflow-hidden rounded-4xl border border-white/10 bg-[rgba(10,12,20,0.85)] p-6 shadow-subtle lg:p-10">
      <div className="absolute inset-0 opacity-40" aria-hidden="true">
        <div className="glow-orb glow-orb--amber -left-20 -top-20" />
        <div className="glow-orb glow-orb--mint -bottom-24 -right-10" />
      </div>
      <div className="relative z-10 space-y-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Monte Carlo Pulse</p>
          <h2 className="mt-2 font-display text-3xl text-sand">Simulation Results</h2>
          <p className="text-sm text-sand-muted">Realtime probabilities powered by {nsims.toLocaleString()} runs.</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-black/20 p-4 lg:p-6">
          <GetPredictions
            nsims={nsims}
            gameFilters={gameFilters}
            updateTrigger={updateTrigger}
            eventTable={eventTable}
          />
        </div>
        <div className="flex justify-center">
          <ChessButton text="Update Simulations" onClick={handleSubmit} variant="secondary" />
        </div>
        <div className="rounded-3xl border border-white/5 bg-black/10 p-4 lg:p-6">
          <GameHouse onGameFilterChange={handleGameFilterChange} eventTable={eventTable} />
        </div>
      </div>
    </div>
  );
};

export default SimulationResults;
