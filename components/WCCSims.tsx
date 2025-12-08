'use client'

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import GameHouseGeneral from './GameHouseGeneral';
import { Game } from '@/types';
import ChessButton from './Button';

// Elegant color palette for the chart
const COLORS_PALETTE = ['#fbbf24', '#60a5fa', '#34d399', '#f472b6'];

const WCCSims: React.FC<{ justGraph: boolean }> = ({ justGraph }) => {
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
    // fetchSimulations is an async function that calls setState in its callback,
    // which is the correct pattern for data fetching in effects
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (!WCCData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
          <p className="text-obsidian-400 text-sm">Loading simulations...</p>
        </div>
      </div>
    );
  }

  const players = WCCData.byRound[0].winPercentages.map((wp: any) => wp.winner);
  const labels = WCCData.byRound.map((round: any) => `R${round.round}`);
  
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
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: COLORS_PALETTE[index % COLORS_PALETTE.length],
      pointBorderColor: '#0d0d10',
      pointBorderWidth: 2,
      tension: 0.3,
      borderWidth: 2,
    };
  });

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#b8b8c1',
          font: {
            family: 'Outfit, system-ui, sans-serif',
            size: 12,
            weight: 'normal' as const,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 31, 0.95)',
        titleColor: '#fdf9f3',
        bodyColor: '#b8b8c1',
        borderColor: 'rgba(251, 191, 36, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: 'Outfit, system-ui, sans-serif',
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'Outfit, system-ui, sans-serif',
          size: 13,
        },
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
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          drawBorder: false,
        },
        ticks: {
          color: '#737384',
          font: {
            family: 'Outfit, system-ui, sans-serif',
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Round',
          color: '#91919f',
          font: {
            family: 'Outfit, system-ui, sans-serif',
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          drawBorder: false,
        },
        ticks: {
          color: '#737384',
          font: {
            family: 'Outfit, system-ui, sans-serif',
            size: 11,
          },
          callback: (value: any) => `${value}%`,
        },
        title: {
          display: true,
          text: 'Win Probability',
          color: '#91919f',
          font: {
            family: 'Outfit, system-ui, sans-serif',
            size: 12,
            weight: 'normal' as const,
          },
        },
        min: 0,
        max: 100,
      },
    },
  };

  if (justGraph) {
    return (
      <div className="space-y-6">
        <div style={{ height: '400px' }}>
          <Line data={data} options={options} />
        </div>
        <div className="text-center">
          <p className="text-obsidian-400 text-sm">
            Based on <span className="text-amber-400 font-medium">{nSims.toLocaleString()}</span> simulations 
            after round <span className="text-amber-400 font-medium">{maxRound}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Chart Section */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-ivory-100 mb-6">
          Simulated Results by Round
        </h2>
        <div className="glass-card p-6">
          <div style={{ height: '450px' }}>
            <Line data={data} options={options} />
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-obsidian-400 text-sm">
              Based on <span className="text-amber-400 font-medium">{nSims.toLocaleString()}</span> simulations 
              after round <span className="text-amber-400 font-medium">{maxRound}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Explorer */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-xl font-semibold text-ivory-100">Scenario Explorer</h3>
            <p className="text-obsidian-400 text-sm mt-1">Select game outcomes to see how probabilities change</p>
          </div>
          <ChessButton 
            text="Update Simulations" 
            onClick={handleUpdateSimulations}
            variant="primary"
            size="sm"
          />
        </div>
        <GameHouseGeneral
          gamesData={sampleGamesData}
          onGameFilterChange={setFilteredGames}
        />
      </div>
    </div>
  );
};

export default WCCSims;
