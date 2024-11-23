import React, { useState, useEffect } from 'react';
import GamePicker from './GamePicker';
import { Game } from '@/types';
import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';

interface GameHouseProps {
  onGameFilterChange: (games: Game[]) => void;
  eventTable?: string; // Optional if gamesData is provided
  gamesData?: { round: number; games: Game[] }[]; // Optional if eventTable is provided
}


const GameHouseGeneral: React.FC<GameHouseProps> = ({ onGameFilterChange, eventTable, gamesData }) => {
  const [gamesWithOutcomes, setGamesWithOutcomes] = useState<Game[]>([]);

  let initialGames: { round: number; games: Game[] }[] = [];

  if (gamesData) {
    initialGames = gamesData;
  } else if (eventTable) {
    try {
      initialGames = eventTable === 'candidates_2024' ? candResByRound : womensCandByRound;
    } catch (e) {
      console.error('Error loading eventTable data:', e);
    }
  } else {
    console.warn('No gamesData or eventTable provided to GameHouse.');
  }

  const handleOutcomeChange = (gameId: string, outcome: 'white' | 'draw' | 'black' | null) => {
    setGamesWithOutcomes((currentGamesWithOutcomes) => {
      const gameIndex = currentGamesWithOutcomes.findIndex((game) => game.id === gameId);
      if (gameIndex > -1 && outcome === null) {
        return currentGamesWithOutcomes.filter((_, index) => index !== gameIndex);
      } else if (gameIndex > -1) {
        const updatedGames = [...currentGamesWithOutcomes];
        updatedGames[gameIndex] = { ...updatedGames[gameIndex], outcome };
        return updatedGames;
      } else {
        const gameToAdd = initialGames.flatMap((round) => round.games).find((game) => game.id === gameId);
        if (gameToAdd) {
          return [...currentGamesWithOutcomes, { ...gameToAdd, outcome }];
        }
      }
      return currentGamesWithOutcomes;
    });
  };
  
  useEffect(() => {
    onGameFilterChange(gamesWithOutcomes);
  }, [gamesWithOutcomes, onGameFilterChange]);

  const isRoundCompleted = (games: Game[]) =>
    games.every((game) => game.hasOwnProperty('outcome') && game.outcome !== null);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Pick Game Outcomes</h2>
      {initialGames.map((round, index) => {
        const roundCompleted = isRoundCompleted(round.games);

        if (!roundCompleted) {
          return (
            <div key={`round-${index}`} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-center">Round {round.round}</h3>
              {round.games.map((game) => (
                <GamePicker
                  key={game.id}
                  whitePlayer={game.whitePlayer}
                  blackPlayer={game.blackPlayer}
                  onOutcomeChange={(outcome) => handleOutcomeChange(game.id, outcome)}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default GameHouseGeneral;
