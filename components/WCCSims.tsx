'use client'

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import GameHouseGeneral from './GameHouseGeneral';
import { Game } from '@/types';
import ChessButton from './Button';

// Updated color palette for dark theme
const COLORS_PALETTE = ['#D4A84B', '#3B82F6', '#EC4899', '#10B981'];

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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading simulations...</span>
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
      pointBorderColor: '#0A0A0B',
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
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#A1A1AA',
          font: {
            family: 'var(--font-body)',
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1F1F23',
        titleColor: '#FAFAFA',
        bodyColor: '#A1A1AA',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
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
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#71717A',
          font: {
            family: 'var(--font-body)',
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Round',
          color: '#A1A1AA',
          font: {
            family: 'var(--font-body)',
            size: 12,
            weight: 500 as const,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#71717A',
          font: {
            family: 'var(--font-body)',
            size: 11,
          },
          callback: (value: any) => `${value}%`,
        },
        title: {
          display: true,
          text: 'Win Probability',
          color: '#A1A1AA',
          font: {
            family: 'var(--font-body)',
            size: 12,
            weight: 500 as const,
          },
        },
        min: 0,
        max: 100,
      },
    },
  };

  if (justGraph) {
    return (
      <div className="space-y-4">
        <div style={{ height: '400px' }}>
          <Line data={data} options={options} />
        </div>
        <p className="text-center text-sm text-text-muted">
          Based on <span className="text-accent font-medium">{nSims.toLocaleString()}</span> simulations after round {maxRound}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Chart Section */}
      <div>
        <h2 className="font-display text-heading-lg text-text-primary mb-6">
          Simulated Results by Round
        </h2>
        <div className="glass-card p-6">
          <div style={{ height: '450px' }}>
            <Line data={data} options={options} />
          </div>
          <p className="text-center mt-6 text-sm text-text-muted">
            Based on <span className="text-accent font-medium">{nSims.toLocaleString()}</span> simulations after round {maxRound}
          </p>
        </div>
      </div>

      {/* Interactive Section */}
      <div className="glass-card p-6">
        <div className="flex flex-col items-center mb-6">
          <h3 className="font-display text-heading-md text-text-primary mb-4">
            Explore Scenarios
          </h3>
          <p className="text-text-secondary text-sm text-center max-w-md mb-6">
            Select hypothetical game outcomes to see how the win probabilities would change.
          </p>
          <ChessButton 
            text="Update Simulations" 
            onClick={handleUpdateSimulations}
            variant="primary"
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
