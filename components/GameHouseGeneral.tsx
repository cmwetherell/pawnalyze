'use client';

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
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h2 className="text-center font-display text-xl uppercase tracking-[0.35em] text-paper">Pick game outcomes</h2>
      <p className="text-center text-sm text-slate">Lock results to steer the Monte Carlo rerun.</p>
      {initialGames.map((round, index) => {
        const roundCompleted = isRoundCompleted(round.games);

        if (!roundCompleted) {
          return (
            <div key={`round-${index}`} className="mt-6 space-y-4">
              <h3 className="text-center text-sm uppercase tracking-[0.45em] text-slate">Round {round.round}</h3>
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
