'use client'

import React, { useState } from 'react';
import GetPredictions from "@/components/currentPredictions";
import GameHouse from '@/components/GameHouse';
import ChessButton from './Button';
import { Game } from '@/types';

const SimulationResults = ({ eventTable }: { eventTable: string }) => {
  const [nsims, setNsims] = useState<number>(10000);
  const [gameFilters, setGameFilters] = useState<Game[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const handleGameFilterChange = (selectedGames: Game[]) => {
    setGameFilters(selectedGames);
  };

  const handleSubmit = () => {
    setUpdateTrigger(current => current + 1);
  };

  return (
    <div className="space-y-8">
      {/* Results Section */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-ivory-100 mb-6 text-center">
          Simulation Results
        </h2>
        <div className="max-w-4xl mx-auto">
          <GetPredictions
            nsims={nsims}
            gameFilters={gameFilters}
            updateTrigger={updateTrigger}
            eventTable={eventTable}
          />
        </div>
      </div>

      {/* Scenario Explorer */}
      <div className="pt-8 border-t border-white/[0.06]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-xl font-semibold text-ivory-100">Scenario Explorer</h3>
            <p className="text-obsidian-400 text-sm mt-1">Select game outcomes to see how probabilities change</p>
          </div>
          <ChessButton
            text="Update Simulations"
            onClick={handleSubmit}
            variant="primary"
            size="sm"
          />
        </div>
        
        <GameHouse 
          onGameFilterChange={handleGameFilterChange}
          eventTable={eventTable}
        />
      </div>
    </div>
  );
};

export default SimulationResults;
