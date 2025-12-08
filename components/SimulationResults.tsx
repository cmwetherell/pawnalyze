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
      {/* Predictions Section */}
      <div className="glass-card p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-heading-xl text-text-primary text-center mb-8">
            Simulation Results
          </h2>
          <GetPredictions
            nsims={nsims}
            gameFilters={gameFilters}
            updateTrigger={updateTrigger}
            eventTable={eventTable}
          />
        </div>
      </div>

      {/* Interactive Explorer */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col items-center mb-8">
          <h3 className="font-display text-heading-lg text-text-primary mb-3">
            Scenario Explorer
          </h3>
          <p className="text-text-secondary text-sm text-center max-w-md mb-6">
            Click on game outcomes to explore different scenarios and see 
            how the tournament standings might change.
          </p>
          <ChessButton
            text="Update Simulations"
            onClick={handleSubmit}
            variant="primary"
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
