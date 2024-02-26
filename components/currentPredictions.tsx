'use client'

import React, { useEffect, useState } from "react";
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from "recharts";
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto'; // Import to register the controllers.
import { Game } from '@/types';

// Define a type for the elements in your state array
type PercentageData = {
    name: string;
    value: number;
  };

type PlayerColorsMap = {
    [key: string]: string;
  };

type CurrentPredictionsProps = {
    nsims: number;
    gameFilters?: Game[];
    updateTrigger?: number; // Add an optional updateTrigger prop
  };

const GetPredictions = ({ nsims, gameFilters, updateTrigger }: CurrentPredictionsProps) => {
  const [isClient, setIsClient] = useState(false); // Add a state to track client-side rendering
  const [playerWinPercentages, setPlayerWinPercentages] = useState<PercentageData[]>([]);
  const [playerSecondPercentages, setPlayerSecondPercentages] = useState([]);
  const [tiePercentage, setTiePercentage] = useState(0);
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    console
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

            // Transforming the 'winnerPercentages' object into an array of { name, value } objects
            const percentagesArray: PercentageData[] = Object.entries(data.winnerPercentages).map(([name, value]) => ({
                name,
                value: value as number, // Explicitly type the value as number
            }));

            const responseTotalGames = data.totalGames;

            setPlayerWinPercentages(percentagesArray); // Update state with the transformed data
            setTotalGames(responseTotalGames);
        } else {
            // Handle server errors or invalid responses
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
        "Firouzja, Alireza",
        "Caruana, Fabiano",
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
        labels: playerNames,
        datasets: [
        {
            data: playerNames.map(name => {
                const player = playerWinPercentages.find(entry => entry.name === name);
                return player ? player.value : 0;
            }),
            backgroundColor: playerNames.map(name => playerColorsMap[name]),
            hoverOffset: 4
        }
        ]
    };

  // Options for the chart
  const options = {
    plugins: {
        legend: {
            display: true, // Show the legend
            labels: {
              color: 'black' // Set the legend text color to white
            }
          },
      tooltip: {
        enabled: true, // Enable tooltips
      }
    },
    maintainAspectRatio: false, // Important for responsive design
  };

return (
    <div style={{ height: '400px' }}> {/* Container must have a height */}
        {isClient && (
            <>
                <Pie data={data} options={options} />
                <p className="text-md text-center font-bold mb-2 mt-4 text-black">Based on {totalGames} simulations</p>
            </>
        )}
    </div>
  );
};

export default GetPredictions;
