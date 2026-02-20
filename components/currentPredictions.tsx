'use client';

import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { PercentageData, CurrentPredictionsProps, PlayerColorsMap } from '@/types';
import { Game } from '@/types';
import { buildPlayerColorMap } from '@/lib/playerData';

import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';
import candResByRound2026 from '@/public/candResByRound2026.json';
import womensCandByRound2026 from '@/public/womensCandByRound2026.json';
import ChartSkeleton from './ChartSkeleton';

Chart.register(ChartDataLabels);

let customOrder = ['Pre', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'Simulated'];

const GetPredictions = ({ nsims, gameFilters, updateTrigger, eventTable, onLoadingChange }: CurrentPredictionsProps) => {
  const [isClient, setIsClient] = useState(false);
  const [playerWinPercentagesByRound, setPlayerWinPercentagesByRound] = useState<Record<string, PercentageData[]>>({});
  const [totalGames, setTotalGames] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState('');

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

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      onLoadingChange?.(true);
      const requestBody = {
        gameFilters: gameFilters,
        limitSims: nsims,
        eventTable: eventTable,
      };

      try {
        const response = await fetch('/api/sims', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();

          const transformedData = data.reduce((acc: Record<string, any>, curr: any) => {
            const { Round, winner, win_count } = curr;
            if (!acc[Round]) {
              acc[Round] = { totalGames: 0, winnerPercentages: {} };
            }
            acc[Round].winnerPercentages[winner] = parseFloat(win_count);
            acc[Round].totalGames += parseFloat(win_count);
            return acc;
          }, {});

          const chartData: Record<string, PercentageData[]> = {};
          customOrder = [];
          for (const round in transformedData) {
            customOrder.push(round);
            const roundData = transformedData[round];
            const percentagesArray: PercentageData[] = Object.entries(
              roundData.winnerPercentages,
            ).map(([name, value]) => ({
              name,
              value: Math.floor(10 * ((value as number) / roundData.totalGames * 100)) / 10,
            }));
            chartData[round] = percentagesArray;
          }

          const roundOrder = ['Pre', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'Simulated'];
          customOrder.sort((a, b) => {
            const indexA = roundOrder.indexOf(a);
            const indexB = roundOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });

          setPlayerWinPercentagesByRound(chartData);

          const simulatedRound = transformedData['Simulated'];
          setTotalGames(simulatedRound ? simulatedRound.totalGames : 0);
        } else {
          console.error('Server responded with an error:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        onLoadingChange?.(false);
      }
    };

    fetchData();
  }, [updateTrigger]);

  // Player names from JSON data
  const playerNames: string[] = Array.from(
    new Set(
      initialGames.reduce((players: string[], round) => {
        round.games.forEach(game => {
          players.push(game.whitePlayer, game.blackPlayer);
        });
        return players;
      }, []),
    ),
  );

  // Use consistent colors from playerData
  const playerColorsMap = buildPlayerColorMap(playerNames);

  const availableRounds = customOrder.filter(label =>
    Object.keys(playerWinPercentagesByRound).includes(label),
  );
  const hasRoundData = availableRounds.some(r => /^\d+$/.test(r));
  const showBarChart = !hasRoundData;
  const hasSimulated = availableRounds.includes('Simulated');

  const playerPercentages = playerNames
    .filter(name => selectedPlayer === '' || name === selectedPlayer)
    .map(name => {
      const playerData = customOrder.map(
        label => playerWinPercentagesByRound[label]?.find(entry => entry.name === name)?.value || 0,
      );
      const latestWinPercentage = playerData[playerData.length - 1];
      return { name, percentage: latestWinPercentage };
    });

  playerPercentages.sort((a, b) => a.percentage - b.percentage);

  // ── Bar chart (pre-tournament / single-round) ──
  const barPlayerPercentages = [...playerPercentages].sort((a, b) => b.percentage - a.percentage);
  const barData = {
    labels: barPlayerPercentages.map(p => p.name),
    datasets: [
      {
        data: barPlayerPercentages.map(p => p.percentage),
        backgroundColor: barPlayerPercentages.map(p => playerColorsMap[p.name]),
        borderColor: barPlayerPercentages.map(p => playerColorsMap[p.name]),
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.65,
      },
    ],
  };

  const barOptions: any = {
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx: any) => `Win probability: ${ctx.parsed.x.toFixed(1)}%`,
        },
      },
      datalabels: {
        anchor: 'end' as const,
        align: 'end' as const,
        offset: 4,
        color: '#6b7280',
        font: { size: 12, weight: 'bold' as const },
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
    scales: {
      x: {
        display: false,
        min: 0,
        max: Math.min(100, Math.ceil((barPlayerPercentages[0]?.percentage || 50) * 1.5 / 5) * 5),
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#374151',
          font: { size: 13, weight: 'bold' as const },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // ── Line chart (multi-round) ──
  const data = {
    labels: availableRounds,
    datasets: playerPercentages.map(({ name, percentage }) => {
      const playerData = customOrder.map(
        label => playerWinPercentagesByRound[label]?.find(entry => entry.name === name)?.value || 0,
      );
      return {
        label: `(${percentage.toFixed(1)}%) ${name}`,
        data: playerData,
        backgroundColor: playerColorsMap[name],
        borderColor: playerColorsMap[name],
        borderWidth: 2.5,
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: playerColorsMap[name],
      };
    }),
  };

  const options: any = {
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx: any) => {
            const playerName = ctx.dataset.label.replace(/\(.*?\)/, '').trim();
            return `${playerName}: ${ctx.parsed.y}%`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Round',
          color: '#6b7280',
          font: { size: 12 },
        },
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: { color: '#6b7280' },
      },
      y: {
        title: {
          display: true,
          text: 'Win %',
          color: '#6b7280',
          font: { size: 12 },
        },
        stacked: false,
        min: 0,
        max: 100,
        grid: {
          color: '#f3f4f6',
          borderDash: [4, 4],
          drawBorder: false,
        },
        ticks: { color: '#6b7280' },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div>
      {isClient && showBarChart && hasSimulated && (
        <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-md px-3 py-1.5 mb-3">
          Predictions updated to reflect your scenario selections
        </p>
      )}
      <div style={{ height: '500px' }}>
        {!isClient || Object.keys(playerWinPercentagesByRound).length === 0 ? (
          <ChartSkeleton variant="bar" height="100%" />
        ) : (
          <>
            {showBarChart ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <Line data={data} options={options} />
            )}
          </>
        )}
      </div>
      {isClient && totalGames > 0 && (
        <p className="text-xs text-gray-400 text-center mt-2 mb-0">
          Based on {totalGames.toLocaleString()} simulations
        </p>
      )}
    </div>
  );
};

export default GetPredictions;
