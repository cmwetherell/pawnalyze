'use client'

import React, { useEffect, useState } from "react";
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import to register the controllers.
import { PercentageData, CurrentPredictionsProps, PlayerColorsMap } from '@/types';
import { Game } from "@/types";

// import ChartDataLabels from 'chartjs-plugin-datalabels';
// import { Chart } from 'chart.js';
// Chart.register(ChartDataLabels);

import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';
import ChessButton from "./Button";
import { reverse } from "dns";
import { off } from "process";

let customOrder = ['Pre', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'Simulated'];

const GetPredictions = ({ nsims, gameFilters, updateTrigger, eventTable }: CurrentPredictionsProps) => {
  const [isClient, setIsClient] = useState(false); // Add a state to track client-side rendering
  const [playerWinPercentagesByRound, setPlayerWinPercentagesByRound] = useState<Record<string, PercentageData[]>>({});
  const [totalGames, setTotalGames] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState('');

  const PlayerDropdown = () => {
    return (
      <div>
        <label htmlFor="player-select" className="text-lg font-bold mb-2 text-center">
          Select Player:
        </label>
        <select
          id="player-select"
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="ml-2 p-1 text-md mb-2 max-w-36"
        >
          <option value="">All Players</option>
          {playerNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  let initialGames: { round: number; games: Game[] }[] = [];

  try {
    initialGames = eventTable === 'candidates_2024' ? candResByRound : womensCandByRound;
  } catch (e) {
    console.log(e);
  }

  // // Create a new array with filtered games without the round element
  // const filteredGames = initialGames.flatMap(roundData =>
  //   roundData.games.filter(game => game.outcome === 'win' || game.outcome === 'draw' || game.outcome === 'loss')
  // );

  // // combine the filtered games with the gameFilters
  // const combinedGames = [...filteredGames, ...gameFilters];

  useEffect(() => {
    setIsClient(true); // Update the state to indicate client-side rendering
    const fetchData = async () => {
      const requestBody = {
        gameFilters: gameFilters,
        limitSims: nsims, // Adjust this to fetch 1000 random samples
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
          // console.log(data);

          // Transform the data into the expected object format
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

          // Transform the data into a format suitable for the stacked bar chart
          const chartData: Record<string, PercentageData[]> = {};
          customOrder = []
          for (const round in transformedData) {
            // add round to customOrder
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
              // If both elements are not found in the roundOrder array, compare them as strings
              return a.localeCompare(b);
            } else if (indexA === -1) {
              // If a is not found in the roundOrder array, it should come after b
              return 1;
            } else if (indexB === -1) {
              // If b is not found in the roundOrder array, it should come after a
              return -1;
            } else {
              // Compare the indices of a and b in the roundOrder array
              return indexA - indexB;
            }
          });

          setPlayerWinPercentagesByRound(chartData);

          // Set totalGames to be the sum of win_count for rounds where Round is "Simulated"
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

  // Define colors for the pie chart
  // Palette 1: Soft and Diverse
  const COLORS_PALETTE_1 = ['#6A4C93', '#F9A1BC', '#FFD166', '#06D6A0', '#EF476F', '#118AB2', '#073B4C', '#FFC43D'];

  // Palette 2: Bold and Bright
  const COLORS_PALETTE_2 = ['#E63946', '#a4aba2', '#A8DADC', '#457B9D', '#1D3557', '#F4A261', '#2A9D8F', '#E76F51'];

  // Player names - Ensure the order matches your COLORS_PALETTE
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

  // Map player names to colors from the chosen palette
  const playerColorsMap = playerNames.reduce((acc: PlayerColorsMap, playerName, index) => {
    acc[playerName] = COLORS_PALETTE_2[index]; // Use COLORS_PALETTE_1 for the other palette
    return acc;
  }, {});

  // Prepare data for Chart.js, mapping each player to their color
// make customOrder list only contain rounds that have been played
// filter out rounds that do not have any data

// customOrder = customOrder.filter(label => Object.keys(playerWinPercentagesByRound).includes(label));

  // Prepare data for Chart.js, mapping each player to their color
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
      pointRadius: 0,
    };
  }),
};
const options: any = {
  plugins: {
    legend: {
      display: true,
      position: "right",
      reverse: true,
      labels: {
        color: 'black',
      },
    },
    
    tooltip: {
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
    // datalabels: {
    //   display: function(context: any) {
    //     const dataset = context.dataset;
    //     const datasetIndex = context.datasetIndex;
    //     const dataIndex = context.dataIndex;
    //     return dataIndex === dataset.data.length - 1 && dataset.data[dataIndex] !== 0;
    //   },
    //   align: 'left',
    //   offset: 10,
    //   padding: {
    //     left: 4,
    //     right: 4,
    //     top: 1,
    //     bottom: 1,
    //   },
    //   // anchor: 'end',
    //   // offset: -50,
    //   backgroundColor: 'white',
    //   borderRadius: 4,
    //   color: 'black',
    //   font: {
    //     size: 12,
    //     weight: 'bold',
    //   },
    //   formatter: function(value: any, context: any) {
    //     const playerName = context.dataset.label;
    //     const truncatedName = playerName;
    //     const percentage = value.toFixed(1);
    //     return `${truncatedName}: ${percentage}%`;
    //   },
    //   clip: false,
    // },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Round',
        color: 'black',
        font: {
          size: 14,
        },
      },
    },
    y: {
      title: {
        display: true,
        text: 'Win % by Player',
        color: 'black',
        font: {
          size: 14,
        },
        min: 0,
        suggestedMax: 100,
      },
      stacked: false,
      min: 0,
      max: 50,
    },
  },
  maintainAspectRatio: false,
};

  return (
    <div>
      {/* <PlayerDropdown /> */}
      <div style={{ height: '500px' }}> {/* Container must have a height */}
        {isClient && (
          <>
            <Line data={data} options={options} />
            {totalGames > 0 && (
              <>
              <p className="text-md text-center font-bold mb-2 mt-4 text-black">Based on {totalGames} simulations</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GetPredictions;