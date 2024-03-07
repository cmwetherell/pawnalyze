'use client'

import React, { useEffect, useState } from "react";
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import to register the controllers.
import { PercentageData, CurrentPredictionsProps, PlayerColorsMap } from '@/types';

const GetPredictions = ({ nsims, gameFilters, updateTrigger }: CurrentPredictionsProps) => {
  const [isClient, setIsClient] = useState(false); // Add a state to track client-side rendering
  const [playerWinPercentagesByRound, setPlayerWinPercentagesByRound] = useState<Record<string, PercentageData[]>>({});
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    setIsClient(true); // Update the state to indicate client-side rendering
    const fetchData = async () => {
      const requestBody = {
        gameFilters: gameFilters,
        limitSims: nsims, // Adjust this to fetch 1000 random samples
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
          console.log(data);

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

          for (const round in transformedData) {
            const roundData = transformedData[round];
            const percentagesArray: PercentageData[] = Object.entries(
              roundData.winnerPercentages
            ).map(([name, value]) => ({
              name,
              value: Math.floor(10 * (value as number / roundData.totalGames * 100)) / 10,
            }));

            chartData[round] = percentagesArray;
          }

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
  const COLORS_PALETTE_2 = ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557', '#F4A261', '#2A9D8F', '#E76F51'];

  // Player names - Ensure the order matches your COLORS_PALETTE
  const playerNames = [
    "Nakamura, Hikaru",
    "Caruana, Fabiano",
    "Firouzja, Alireza",
    "Nepomniachtchi, Ian",
    "Praggnanandhaa R",
    "Gukesh D",
    "Vidit, Santosh Gujrathi",
    "Abasov, Nijat"
  ];

  // Map player names to colors from the chosen palette
  const playerColorsMap = playerNames.reduce((acc: PlayerColorsMap, playerName, index) => {
    acc[playerName] = COLORS_PALETTE_2[index]; // Use COLORS_PALETTE_1 for the other palette
    return acc;
  }, {});

  // Prepare data for Chart.js, mapping each player to their color
  const data = {
    labels: Object.keys(playerWinPercentagesByRound),
    datasets: playerNames.map((name, index) => ({
      label: name,
      data: Object.values(playerWinPercentagesByRound).map(roundData =>
        roundData.find(entry => entry.name === name)?.value || 0
      ),
      backgroundColor: playerColorsMap[name],
      hoverOffset: 4,
      stack: 'Stack 0', // Add this line to stack the bars
      maxBarThickness: 100,
    })),
  };

  // Options for the chart
  const options = {
    plugins: {
      legend: {
        display: true, // Show the legend
        labels: {
          color: 'black' // Set the legend text color to black
        },
      },
      tooltip: {
        enabled: true, // Enable tooltips
      }
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
        stacked: true, // Enable stacked bar chart
      },
    },
    maintainAspectRatio: false, // Important for responsive design
  };

  return (
    <div>
      <div style={{ height: '500px' }}> {/* Container must have a height */}
        {isClient && (
          <>
            <Bar data={data} options={options} />
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