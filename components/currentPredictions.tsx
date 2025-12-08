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
const COLORS_PALETTE = ['#D4A84B', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

const GetPredictions = ({ nsims, gameFilters, updateTrigger, eventTable }: CurrentPredictionsProps) => {
  const [isClient, setIsClient] = useState(false);
  const [playerWinPercentagesByRound, setPlayerWinPercentagesByRound] = useState<Record<string, PercentageData[]>>({});
  const [totalGames, setTotalGames] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState('');

  let initialGames: { round: number; games: Game[] }[] = [];

  try {
    initialGames = eventTable === 'candidates_2024' ? candResByRound : womensCandByRound;
  } catch (e) {
    console.log(e);
  }

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
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
      }
    };

    fetchData();
  }, [updateTrigger]);

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
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: playerColorsMap[name],
        pointBorderColor: '#0A0A0B',
        pointBorderWidth: 2,
        borderWidth: 2,
        tension: 0.3,
      };
    }),
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "right",
        reverse: true,
        labels: {
          color: '#A1A1AA',
          font: {
            family: 'var(--font-body)',
            size: 11,
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
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
        enabled: true,
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
          text: 'Win % by Player',
          color: '#A1A1AA',
          font: {
            family: 'var(--font-body)',
            size: 12,
            weight: 500 as const,
          },
        },
        stacked: false,
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div>
      <div style={{ height: '450px' }}>
        {isClient && (
          <>
            <Line data={data} options={options} />
            {totalGames > 0 && (
              <p className="text-sm text-center mt-6 text-text-muted">
                Based on <span className="text-accent font-medium">{totalGames.toLocaleString()}</span> simulations
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GetPredictions;
