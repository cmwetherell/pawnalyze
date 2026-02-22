'use client';

import React, { useState } from 'react';
import GetPredictions from '@/components/currentPredictions';
import ScenarioBuilder from '@/components/simulation/ScenarioBuilder';
import { Game } from '@/types';

const SimulationResults = ({ eventTable, initialData }: { eventTable: string; initialData?: any[] }) => {
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
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 overflow-hidden">
      <div className="lg:grid lg:grid-cols-5 lg:gap-8">
        {/* Chart panel */}
        <div className="lg:col-span-3">
          <div className="surface-card p-4 sm:p-6">
            <h2 className="text-xl font-heading text-[var(--text-primary)] mb-1">Simulation Results</h2>
            <div className={`transition-all duration-300 ${loading ? 'opacity-40 blur-sm pointer-events-none' : ''}`}>
              <GetPredictions
                nsims={nsims}
                gameFilters={gameFilters}
                updateTrigger={updateTrigger}
                eventTable={eventTable}
                onLoadingChange={setLoading}
                initialData={initialData}
              />
            </div>
          </div>
        </div>

        {/* Scenario builder sidebar */}
        <div className="lg:col-span-2 mt-6 lg:mt-0">
          <div className="surface-card overflow-hidden lg:sticky lg:top-20">
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
