'use client'
// components/SimulationResults.tsx
import React, { useState } from 'react';
import GetPredictions from "@/components/currentPredictions" // Adjust the path as necessary
import GameHouse from '@/components/GameHouse' // Adjust the path as necessary
import ChessButton from './Button';
import { Game, eventTableProps } from '@/types';



const SimulationResults = ({ eventTable }: { eventTable: string }) => {
  const [nsims, setNsims] = useState<number>(10000); // Default to 100 simulations
  const [gameFilters, setGameFilters] = useState<Game[]>([]); // Initialize with no filters
  const [updateTrigger, setUpdateTrigger] = useState(0); // Initialize update trigger

  const handleGameFilterChange = (selectedGames: Game[]) => { // Fix: Change the type of selectedGames to Game[]
    setGameFilters(selectedGames); // Assume selectedGames is an array of game outcomes
  };

  const handleNsimsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNsims(Number(event.target.value)); // Update the number of simulations
  }

  const handleSubmit = () => {

    setUpdateTrigger(current => current + 1); // Increment the trigger to initiate an update
  };

  return (
    <div className="glass-panel space-y-6 p-6">
      <div className="text-center">
        <h2 className="font-display text-2xl uppercase tracking-[0.35em] text-paper">Simulation results</h2>
        <p className="text-sm text-slate">Adjust outcomes, rerun the Monte Carlo, and watch the chart redraw.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <GetPredictions nsims={nsims} gameFilters={gameFilters} updateTrigger={updateTrigger} eventTable={eventTable} />
      </div>
      <div className="flex justify-center">
        <ChessButton text="Update simulations" onClick={handleSubmit} />
      </div>
      <GameHouse onGameFilterChange={handleGameFilterChange} eventTable={eventTable} />
    </div>
  );
  
};

export default SimulationResults;
