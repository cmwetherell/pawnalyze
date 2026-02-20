'use client';

import React, { useState } from 'react';
import GetPredictions from '@/components/currentPredictions';
import ScenarioBuilder from '@/components/simulation/ScenarioBuilder';
import { Game } from '@/types';

const SimulationResults = ({ eventTable }: { eventTable: string }) => {
  const [nsims] = useState<number>(10000);
  const [gameFilters, setGameFilters] = useState<Game[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleGameFilterChange = (selectedGames: Game[]) => {
    setGameFilters(selectedGames);
  };

  const handleSubmit = () => {
    setUpdateTrigger(current => current + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="lg:grid lg:grid-cols-5 lg:gap-8">
        {/* Chart panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Simulation Results</h2>
            <div className={`transition-all duration-300 ${loading ? 'opacity-40 blur-sm pointer-events-none' : ''}`}>
              <GetPredictions
                nsims={nsims}
                gameFilters={gameFilters}
                updateTrigger={updateTrigger}
                eventTable={eventTable}
                onLoadingChange={setLoading}
              />
            </div>
          </div>
        </div>

        {/* Scenario builder sidebar */}
        <div className="lg:col-span-2 mt-6 lg:mt-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:sticky lg:top-4">
            <ScenarioBuilder
              eventTable={eventTable}
              onGameFilterChange={handleGameFilterChange}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationResults;
