'use client'

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import GameHouseGeneral from './GameHouseGeneral';
import { Game } from '@/types';
import ChessButton from './Button';
import ChartSkeleton from './ChartSkeleton';

const COLORS_PALETTE = ['#EF476F', '#118AB2', '#073B4C', '#FFC43D'];

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
        headers: { 'Content-Type': 'application/json' },
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
    return <ChartSkeleton variant="line" />;
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
      backgroundColor: COLORS_PALETTE[index % COLORS_PALETTE.length],
      borderColor: COLORS_PALETTE[index % COLORS_PALETTE.length],
      fill: false,
      pointRadius: 3,
      tension: 0.2,
    };
  });

  const data = { labels, datasets };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: 'var(--text-secondary)',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 35, 0.95)',
        titleColor: '#f0f2f5',
        bodyColor: '#c9d1d9',
        borderColor: '#2d333b',
        borderWidth: 1,
        cornerRadius: 8,
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
          color: 'var(--text-muted)',
        },
        ticks: { color: 'var(--text-muted)' },
        grid: { color: 'var(--chart-grid)' },
      },
      y: {
        title: {
          display: true,
          text: 'Win % by Player',
          color: 'var(--text-muted)',
        },
        min: 0,
        max: 100,
        ticks: { color: 'var(--text-muted)' },
        grid: { color: 'var(--chart-grid)', borderDash: [4, 4] },
      },
    },
    maintainAspectRatio: false,
  };

  if (justGraph) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="surface-card p-6">
          <div style={{ height: '500px' }}>
            <Line data={data} options={options} />
          </div>
          <p className="text-center mt-4 text-[var(--text-muted)] text-sm">
            Based on {nSims} simulations after round {maxRound}.
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-heading text-center text-[var(--text-primary)]">Simulated Results by Round</h1>
        <div className="surface-card p-6">
          <div style={{ height: '500px' }}>
            <Line data={data} options={options} />
          </div>
          <p className="text-center mt-4 text-[var(--text-muted)] text-sm">
            Based on {nSims} simulations after round {maxRound}.
          </p>
        </div>
        <div className="surface-card p-4">
          <div className="flex justify-center mb-4">
            <ChessButton text="Update Simulations" onClick={handleUpdateSimulations} />
          </div>
          <GameHouseGeneral
            gamesData={sampleGamesData}
            onGameFilterChange={setFilteredGames}
          />
        </div>
      </div>
    );
  }
};

export default WCCSims;
