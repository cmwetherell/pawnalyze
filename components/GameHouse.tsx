import React, { useState, useEffect } from 'react';
import GamePicker from './GamePicker';
import { Game } from '@/types';
import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';

const GameHouse = ({ onGameFilterChange, eventTable }: { onGameFilterChange: (games: Game[]) => void; eventTable: string }) => {
  const [gamesWithOutcomes, setGamesWithOutcomes] = useState<Game[]>([]);

  let initialGames: { round: number; games: Game[] }[] = [];

  try {
    initialGames = eventTable === 'candidates_2024' ? candResByRound : womensCandByRound;
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

  const isRoundCompleted = (games: Game[]) => games.every(game => game.hasOwnProperty('outcome') && game.outcome !== null);

  return (
    <div className="space-y-6">
      {initialGames.map((round, index) => {
        const roundCompleted = isRoundCompleted(round.games);

        if (!roundCompleted) {
          return (
            <div key={`round-${index}`} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  Round {round.round}
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              
              <div className="space-y-2">
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

      {initialGames.length === 0 && (
        <div className="text-center py-8">
          <p className="text-obsidian-400">No upcoming games to select</p>
        </div>
      )}
    </div>
  );
};

export default GameHouse;
