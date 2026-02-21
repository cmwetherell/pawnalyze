import React, { useState, useEffect } from 'react';
import GamePicker from './GamePicker';
import { Game } from '@/types';
import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';
import candResByRound2026 from '@/public/candResByRound2026.json';
import womensCandByRound2026 from '@/public/womensCandByRound2026.json';



const GameHouse = ({ onGameFilterChange, eventTable }: { onGameFilterChange: (games: Game[]) => void; eventTable: string }) => {
  const [gamesWithOutcomes, setGamesWithOutcomes] = useState<Game[]>([]);

  let initialGames: { round: number; games: Game[] }[] = [];

  try {
    if (eventTable === 'candidates_2026') {
      initialGames = candResByRound2026;
    } else if (eventTable === 'womens_candidates_2026') {
      initialGames = womensCandByRound2026;
    } else if (eventTable === 'candidates_2024') {
      initialGames = candResByRound;
    } else {
      initialGames = womensCandByRound;
    }
  } catch (e) {
    console.log(e);
  }

  const handleOutcomeChange = (gameId: string, outcome: 'white' | 'draw' | 'black' | null) => {
    setGamesWithOutcomes((currentGamesWithOutcomes) => {
      const gameIndex = currentGamesWithOutcomes.findIndex(game => game.id === gameId);
      if (gameIndex > -1 && outcome === null) {
        return currentGamesWithOutcomes.filter((_, index) => index !== gameIndex);
      } else if (gameIndex > -1) {
        const updatedGames = [...currentGamesWithOutcomes];
        updatedGames[gameIndex] = { ...updatedGames[gameIndex], outcome };
        return updatedGames;
      } else {
        const gameToAdd = initialGames.flatMap(round => round.games).find(game => game.id === gameId);
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

  // Check if all games in a round have the "outcome" key and it is not null
  const isRoundCompleted = (games: Game[]) => games.every(game => game.hasOwnProperty('outcome') && game.outcome !== null);

  return (
    <div className="surface-card p-4">
      <h2 className="text-2xl font-heading text-[var(--text-primary)] mb-2 text-center">Pick Game Outcomes</h2>
      {initialGames.map((round, index) => {
        // Check if the round is completed
        const roundCompleted = isRoundCompleted(round.games);

        // Render the round only if it's not completed
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

        // Return null if the round is completed to hide it
        return null;
      })}
    </div>
  );
};

export default GameHouse;