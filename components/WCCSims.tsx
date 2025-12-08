'use client';

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import GameHouseGeneral from './GameHouseGeneral';
import { Game } from '@/types';
import ChessButton from './Button';

const COLORS_PALETTE = ['#f6c177', '#72f5c7', '#ff6b6b', '#9ea8c7'];

const WCCSims: React.FC<{ justGraph: boolean }> = ({ justGraph }) => {
  const [isClient, setIsClient] = useState(false);
  const [WCCData, setWCCData] = useState<any>(null);
  const [nSims, setNSims] = useState<number>(0);
  const [maxRound, setMaxRound] = useState<number>(0);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  const generateFilters = () =>
    filteredGames
      .filter((game) => game.outcome)
      .map(
        (game) =>
          `${game.whitePlayer.substring(0, 3)}|${game.blackPlayer.substring(0, 3)}|${game.round}|${
            game.outcome === 'white' ? 'w' : game.outcome === 'black' ? 'b' : 'd'
          }`
      );

  const fetchSimulations = async (filters: string[]) => {
    try {
      const response = await fetch('/api/sims/wcc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters }),
      });

      if (response.ok) {
        const data = await response.json();
        setWCCData(data);
        setNSims(data.nSimsForHighestRound);
        setMaxRound(data.highestRound);
      } else {
        console.error('Server responded with an error:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch simulations:', error);
    }
  };

  const handleUpdateSimulations = () => {
    const filters = generateFilters();
    fetchSimulations(filters);
  };

  useEffect(() => {
    setIsClient(true);
    fetchSimulations([]);
  }, []);

  const sampleGamesData = React.useMemo(() => {
    const totalRounds = 14;
    let gamesData = Array.from({ length: totalRounds }, (_, index) => ({
      round: index + 1,
      games: [
        {
          id: `game${index + 1}`,
          blackPlayer: index % 2 === 0 ? 'Ding Liren' : 'Gukesh D',
          whitePlayer: index % 2 === 0 ? 'Gukesh D' : 'Ding Liren',
          outcome: null,
          round: index + 1,
        },
      ],
    }));

    return gamesData.slice(maxRound);
  }, [maxRound]);

  if (!WCCData || !isClient) {
    return <p className="text-center text-slate">Loading live probability...</p>;
  }

  const players = WCCData.byRound[0].winPercentages.map((wp: any) => wp.winner);

  const labels = WCCData.byRound.map((round: any) => `Round ${round.round}`);
  const datasets = players.map((playerName: string, index: number) => {
    const data = WCCData.byRound.map((round: any) => {
      const playerData = round.winPercentages.find((wp: any) => wp.winner === playerName);
      return parseFloat(playerData?.percentage || 0);
    });

    return {
      label: playerName,
      data,
      borderWidth: 3,
      backgroundColor: 'transparent',
      borderColor: COLORS_PALETTE[index % COLORS_PALETTE.length],
      fill: false,
      pointRadius: 0,
      tension: 0.35,
    };
  });

  const data = {
    labels,
    datasets,
  };

  const axisColor = 'rgba(244, 239, 228, 0.7)';
  const gridColor = 'rgba(255, 255, 255, 0.08)';

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: axisColor,
          usePointStyle: true,
          pointStyle: 'line',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(3, 4, 10, 0.9)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Round',
          color: axisColor,
        },
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Win % by Player',
          color: axisColor,
        },
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
        },
        min: 0,
        max: 100,
      },
    },
    maintainAspectRatio: false,
  };

  if (justGraph) {
    return (
      <div className="flex h-full w-full flex-col gap-3">
        <div className="h-full min-h-[260px] w-full">
          <Line data={data} options={options} />
        </div>
        <p className="text-center text-xs uppercase tracking-[0.35em] text-slate">
          Based on {nSims} simulations after round {maxRound}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h1 className="text-center font-display text-3xl uppercase tracking-[0.35em] text-paper">
          Simulated results by round
        </h1>
        <div className="mt-6 h-[500px] w-full rounded-2xl border border-white/10 bg-black/20 p-4">
          <Line data={data} options={options} />
        </div>
        <p className="mt-4 text-center text-sm text-slate">
          Based on {nSims} simulations after round {maxRound}
        </p>
      </div>
      <div className="glass-panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate">Scenario sculpting</p>
            <h2 className="text-xl text-paper">Lock in completed games and rerun the tree</h2>
          </div>
          <ChessButton text="Update simulations" onClick={handleUpdateSimulations} />
        </div>
        <div className="mt-6">
          <GameHouseGeneral gamesData={sampleGamesData} onGameFilterChange={setFilteredGames} />
        </div>
      </div>
    </div>
  );
};

export default WCCSims;
