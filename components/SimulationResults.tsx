'use client'
// components/SimulationResults.tsx
import React, { useState } from 'react';
import GetPredictions from "@/components/currentPredictions" // Adjust the path as necessary
import GameHouse from '@/components/GameHouse' // Adjust the path as necessary
import ChessButton from './Button';
import { Game } from '@/types';



const SimulationResults: React.FC = () => {
  const [nsims, setNsims] = useState<number>(1000); // Default to 100 simulations
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
    <div className="bg-white shadow-md rounded-lg p-4 relative">
  
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'block', maxWidth: '800px', width: '100%' }}>
          <h2 className="text-2xl font-bold mb-2 text-center">Simulation Results</h2>
          <GetPredictions
            nsims={nsims}
            gameFilters={gameFilters}
            updateTrigger={updateTrigger} // Pass the update trigger as a prop
          />
        </div>
      </div>
      <br></br>
      <br></br>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="mb-4">
        <label htmlFor="nsims" className="text-md font-medium text-gray-700">
          Max Number of Simulations:
        </label>
        <input
          type="number"
          id="nsims"
          value={nsims}
          onChange={handleNsimsChange}
          className="text-center mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <ChessButton
          text="Update Simulations"
          onClick={handleSubmit}
        />
      </div>

      </div>
      <GameHouse onGameFilterChange={handleGameFilterChange} />
  
    </div>
  );
  
};

export default SimulationResults;
