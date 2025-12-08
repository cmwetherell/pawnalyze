import React, { useState, useEffect } from 'react';
import GamePicker from './GamePicker';
import { Game } from '@/types';
import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';

interface GameHouseProps {
  onGameFilterChange: (games: Game[]) => void;
  eventTable?: string;
  gamesData?: { round: number; games: Game[] }[];
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
    <div className="space-y-6">
      <h2 className="font-display text-heading-lg text-text-primary text-center">
        Pick Game Outcomes
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialGames.map((round, index) => {
          const roundCompleted = isRoundCompleted(round.games);

          if (!roundCompleted) {
            return (
              <div 
                key={`round-${index}`} 
                className="
                  p-5 
                  rounded-xl 
                  bg-bg-elevated/50
                  border border-border-subtle
                "
              >
                <h3 className="
                  font-display text-heading-md 
                  text-text-primary 
                  mb-4
                  pb-2
                  border-b border-border-subtle
                ">
                  Round {round.round}
                </h3>
                
                <div className="space-y-3">
                  {round.games.map((game) => (
                    <GamePicker
                      key={game.id}
                      whitePlayer={game.whitePlayer}
                      blackPlayer={game.blackPlayer}
                      onOutcomeChange={(outcome) => handleOutcomeChange(game.id, outcome)}
                    />
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

export default GameHouseGeneral;
