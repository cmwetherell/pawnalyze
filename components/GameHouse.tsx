import React, { useState, useEffect } from 'react';
import GamePicker from './GamePicker';
import { Game } from '@/types';
import { init } from 'next/dist/compiled/webpack/webpack';

const playerNames = [
  "Nakamura, Hikaru",
  "Firouzja, Alireza",
  "Caruana, Fabiano",
  "Nepomniachtchi, Ian",
  "Praggnanandhaa R",
  "Gukesh D",
  "Vidit, Santosh Gujrathi",
  "Abasov, Nijat"
];

let initialGames: Game[] = [];

// for (let i = 0; i < playerNames.length; i++) {
//   for (let j = i + 1; j < playerNames.length; j++) {
//     let id1 = playerNames[i].split(",")[0].substring(0, 3) + "|" + playerNames[j].split(",")[0].substring(0, 3);
//     let id2 = playerNames[j].split(",")[0].substring(0, 3) + "|" + playerNames[i].split(",")[0].substring(0, 3);
//     initialGames.push({ id: id1, whitePlayer: playerNames[i], blackPlayer: playerNames[j], outcome: undefined });
//     initialGames.push({ id: id2, whitePlayer: playerNames[j], blackPlayer: playerNames[i], outcome: undefined });
//   }
// }

// load JSON from /candidateResults.json into initialGames, use try catch block
try {
    initialGames = require('@/public/candidateResults.json');
    } catch (e) {
    console.log(e);
}

const GameHouse = ({ onGameFilterChange }: { onGameFilterChange: (games: Game[]) => void }) => {
  const [gamesWithOutcomes, setGamesWithOutcomes] = useState<Game[]>([]);
  const [sortedGames, setSortedGames] = useState<Game[]>(initialGames);

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
        const gameToAdd = initialGames.find(game => game.id === gameId);
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

  const sortGames = (sortBy: 'whitePlayer' | 'blackPlayer') => {
    const sorted = [...sortedGames].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });
    setSortedGames(sorted);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Pick Game Outcomes</h2>
      <div className="flex justify-center mb-4">
        <div className="flex justify-around w-full max-w-2xl text-lg">
          <span className="cursor-pointer  hover:font-bold" onClick={() => sortGames('whitePlayer')}>Sort White Player</span>
          <span className="cursor-pointer  hover:font-bold" onClick={() => sortGames('blackPlayer')}>Sort Black Player</span>
        </div>
      </div>
      {sortedGames.map((game) => (
        <GamePicker
          key={game.id}
          whitePlayer={game.whitePlayer}
          blackPlayer={game.blackPlayer}
          onOutcomeChange={(outcome) => handleOutcomeChange(game.id, outcome)}
        />
      ))}
    </div>
  );
};

export default GameHouse;
