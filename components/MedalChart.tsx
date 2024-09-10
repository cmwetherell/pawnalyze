'use client'

import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import to register the controllers
import { ChartData } from 'chart.js';

interface MedalChartProps {
  medalData: {
    rounds: {
      gold: {
        country: string;
        percentage: string;
      }[];
    }[];
  };
  maxRound: number;
  topN: number; // New prop to specify the number of top countries to display
  className?: string;
}

const COLORS_PALETTE = ['#E63946', '#a4aba2', '#A8DADC', '#457B9D', '#1D3557', '#F4A261', '#2A9D8F', '#E76F51'];

const MedalChart: React.FC<MedalChartProps> = ({ medalData, maxRound, topN, className }) => {
  const roundData = medalData?.rounds?.[maxRound] || {}; // Get data for the latest round

  // Create a static color map based on round 0 gold medal percentages
  const colorMap = useMemo(() => {
    const initialRoundData = medalData?.rounds?.[0]?.gold || []; // Get round 0 data
    const sortedData = initialRoundData
      .map((item) => ({
        country: item.country,
        percentage: parseFloat(item.percentage),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Assign colors to each country based on their ranking in round 0
    const map: Record<string, string> = {};
    sortedData.forEach((item, index) => {
      if (index < COLORS_PALETTE.length) {
        map[item.country] = COLORS_PALETTE[index];
      }
    });

    return map;
  }, [medalData]);

  // Function to get top N countries and group others
  const getTopNCountries = () => {
    if (!roundData || !roundData.gold) return [];

    // Sort the countries based on gold medal percentages in descending order
    const sortedData = roundData.gold
      .map((item) => ({
        country: item.country,
        percentage: parseFloat(item.percentage),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Get the top N countries and the rest as "Other"
    const topCountries = sortedData.slice(0, topN);
    const otherCountries = sortedData.slice(topN);

    // Calculate the total percentage for "Other" countries
    const otherPercentage = otherCountries.reduce((sum, country) => sum + country.percentage, 0);

    // Add the "Other" entry if there are any countries grouped as "Other"
    if (otherPercentage > 0) {
      topCountries.push({ country: 'Other', percentage: otherPercentage });
    }

    return topCountries;
  };

  // Function to generate the data for the Pie chart
  const generateBarChartData = (): ChartData<'bar', number[], unknown> => {
    const topCountries = getTopNCountries();
    if (topCountries.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = topCountries.map((item) => `${item.country}`);
    const data = topCountries.map((item) => item.percentage);

    return {
      labels,
      datasets: [
        {
          label: 'Gold Medal Chances (%)',
          data,
          backgroundColor: topCountries.map((item) => colorMap[item.country] || '#CCCCCC'), // Use the static color map
          borderColor: topCountries.map((item) => colorMap[item.country] || '#CCCCCC'),
          borderWidth: 1,
        },
      ],
    };
  };

  // Function to generate the data for the Line chart
  const generateLineChartData = (): ChartData<'line', number[], unknown> => {
    const topCountries = getTopNCountries();
    if (topCountries.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = topCountries.map((item) => item.country);
    const data = topCountries.map((item) => item.percentage);

    return {
      labels,
      datasets: [
        {
          label: 'Gold Medal Chances (%)',
          data,
          fill: false,
          backgroundColor: labels.map((country) => colorMap[country] || '#CCCCCC'),
          borderColor: labels.map((country) => colorMap[country] || '#CCCCCC'),
          tension: 0.1, // Optional: curve tension
        },
      ],
    };
  };

  // Define the chart options with custom legend and tooltip settings
  const options: any = {
    aspectRatio: 2, // Maintain aspect ratio
    plugins: {
      maintainAspectRatio: false,
      legend: {
        display: maxRound!==0, // Hide legend for line chart
        position: 'right', // Move legend to the right
        labels: {
          generateLabels: (chart: any) => {
            const { data } = chart;
            return data.labels.map((label: string, i: number) => ({
              text: label,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].borderColor[i],
              lineWidth: 1,
            }));
          },
          color: 'black',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
        x: {
          title: {
            display: true,
            text: 'Country',
            color: 'black',
            font: {
              size: 12,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Win Gold %',
            color: 'black',
            font: {
              size: 12,
            },
            min: 0,
            suggestedMax: 40,
          },
          stacked: false,
          min: 0,
          max: 40,
        },
      },
  };

  const conditionalMaxWidth: string = maxRound === 0 ? '400px' : '800px';

  return (
    <div style = {{ maxHeight: conditionalMaxWidth }} className={`flex mx-auto align-middle justify-center pb-5 ${className || ''}`}>
      {maxRound === 0 ? (
        <Bar data={generateBarChartData()} options={options} />
      ) : (
        <Line data={generateLineChartData()} options={options} />
      )}
    </div>
  );
}

export default MedalChart;
