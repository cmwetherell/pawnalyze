'use client'

import React, { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { PercentageData, CurrentPredictionsProps, PlayerColorsMap } from '@/types';
import { Game } from "@/types";

import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';

let customOrder = ['Pre', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'Simulated'];

// Updated color palette for dark theme
const COLORS_PALETTE = [
  '#fbbf24', // amber
  '#60a5fa', // blue
  '#34d399', // emerald
  '#f472b6', // pink
  '#a78bfa', // violet
  '#fb923c', // orange
  '#2dd4bf', // teal
  '#f87171', // red
];

const GetPredictions = ({ nsims, gameFilters, updateTrigger, eventTable }: CurrentPredictionsProps) => {
  const [playerWinPercentagesByRound, setPlayerWinPercentagesByRound] = useState<Record<string, PercentageData[]>>({});
  const [totalGames, setTotalGames] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  let initialGames: { round: number; games: Game[] }[] = [];

  try {
    initialGames = eventTable === 'candidates_2024' ? candResByRound : womensCandByRound;
  } catch (e) {
    console.log(e);
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const requestBody = {
        gameFilters: gameFilters,
        limitSims: nsims,
        eventTable: eventTable,
      };

      try {
        const response = await fetch("/api/sims", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();

          const transformedData = data.reduce((acc: Record<string, any>, curr: any) => {
            const { Round, winner, win_count } = curr;
            if (!acc[Round]) {
              acc[Round] = {
                totalGames: 0,
                winnerPercentages: {},
              };
            }

            acc[Round].winnerPercentages[winner] = parseFloat(win_count);
            acc[Round].totalGames += parseFloat(win_count);

            return acc;
          }, {});

          const chartData: Record<string, PercentageData[]> = {};
          customOrder = []
          for (const round in transformedData) {
            customOrder.push(round);
            
            const roundData = transformedData[round];
            const percentagesArray: PercentageData[] = Object.entries(
              roundData.winnerPercentages
            ).map(([name, value]) => ({
              name,
              value: Math.floor(10 * (value as number / roundData.totalGames * 100)) / 10,
            }));

            chartData[round] = percentagesArray;
          }

          const roundOrder = ['Pre', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'Simulated'];

          customOrder.sort((a, b) => {
            const indexA = roundOrder.indexOf(a);
            const indexB = roundOrder.indexOf(b);

            if (indexA === -1 && indexB === -1) {
              return a.localeCompare(b);
            } else if (indexA === -1) {
              return 1;
            } else if (indexB === -1) {
              return -1;
            } else {
              return indexA - indexB;
            }
          });

          setPlayerWinPercentagesByRound(chartData);

          const simulatedRound = transformedData["Simulated"];
          setTotalGames(simulatedRound ? simulatedRound.totalGames : 0);
        } else {
          console.error("Server responded with an error:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [updateTrigger, eventTable, gameFilters, nsims]);

  let playerNames: string[] = Array.from(
    new Set(
      initialGames.reduce((players: string[], round) => {
        round.games.forEach((game) => {
          players.push(game.whitePlayer, game.blackPlayer);
        });
        return players;
      }, [])
    )
  );

  const playerColorsMap = playerNames.reduce((acc: PlayerColorsMap, playerName, index) => {
    acc[playerName] = COLORS_PALETTE[index % COLORS_PALETTE.length];
    return acc;
  }, {});

  const playerPercentages = playerNames
    .filter((name) => selectedPlayer === '' || name === selectedPlayer)
    .map((name) => {
      const playerData = customOrder.map(label =>
        playerWinPercentagesByRound[label]?.find(entry => entry.name === name)?.value || 0
      );
      const latestWinPercentage = playerData[playerData.length - 1];
      return { name, percentage: latestWinPercentage };
    });

  playerPercentages.sort((a, b) => a.percentage - b.percentage);

  const data = {
    labels: customOrder.filter(label => Object.keys(playerWinPercentagesByRound).includes(label)),
    datasets: playerPercentages.map(({ name, percentage }) => {
      const playerData = customOrder.map(label =>
        playerWinPercentagesByRound[label]?.find(entry => entry.name === name)?.value || 0
      );
      return {
        label: `(${percentage.toFixed(1)}%) ${name}`,
        data: playerData,
        backgroundColor: playerColorsMap[name],
        borderColor: playerColorsMap[name],
        fill: false,
        hoverOffset: 4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: playerColorsMap[name],
        pointBorderColor: '#0d0d10',
        pointBorderWidth: 2,
        tension: 0.3,
        borderWidth: 2,
      };
    }),
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        reverse: true,
        labels: {
          color: '#b8b8c1',
          font: {
            family: 'Outfit, system-ui, sans-serif',
            size: 11,
            weight: 'normal' as const,
          },
          padding: 12,
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
          label: function(context: any) {
            const dataset = context.dataset;
            const dataIndex = context.dataIndex;
            const value = dataset.data[dataIndex];
            const playerName = dataset.label.replace(/\(.*?\)/, '').trim();
            return `${playerName}: ${value}%`;
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
        stacked: false,
        min: 0,
        max: 100,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
          <p className="text-obsidian-400 text-sm">Loading simulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div style={{ height: '450px' }}>
        <Line data={data} options={options} />
      </div>
      {totalGames > 0 && (
        <div className="text-center pt-4 border-t border-white/[0.06]">
          <p className="text-obsidian-400 text-sm">
            Based on <span className="text-amber-400 font-medium">{totalGames.toLocaleString()}</span> simulations
          </p>
        </div>
      )}
    </div>
  );
};

export default GetPredictions;
