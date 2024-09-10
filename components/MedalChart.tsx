'use client'

import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
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
// TODO Make mapping static based on round 0 odds

const MedalChart: React.FC<MedalChartProps> = ({ medalData, maxRound, topN, className }) => {
  const roundData = medalData?.rounds?.[maxRound] || {}; // Get data for the latest round

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
  const generatePieChartData = (): ChartData<'pie', number[], unknown> => {
    const topCountries = getTopNCountries();
    if (topCountries.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = topCountries.map((item) => item.country);
    const data = topCountries.map((item) => item.percentage);

    const countryColorMap = labels.reduce((acc, country, index) => {
        acc[country] = COLORS_PALETTE[index];
        return acc;
        }, {} as Record<string, string>);

    return {
      labels,
      datasets: [
        {
          label: 'Gold Medal Chances (%)',
          data,
          backgroundColor: labels.map((country) => countryColorMap[country]),
          borderColor: labels.map((country) => countryColorMap[country]),
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

    const countryColorMap = labels.reduce((acc, country, index) => {
        acc[country] = COLORS_PALETTE[index];
        return acc;
        }, {} as Record<string, string>);

    return {
      labels,
      datasets: [
        {
          label: 'Gold Medal Chances (%)',
          data,
          fill: false,
          backgroundColor: labels.map((country) => countryColorMap[country]),
          borderColor: labels.map((country) => countryColorMap[country]),
          tension: 0.1, // Optional: curve tension
        },
      ],
    };
  };

  const conditionalWidth: string = maxRound === 0 ? '600px' : '90%';

  return (
    <div style={{ maxWidth: conditionalWidth }} className={`mx-auto pb-5 ${className || ''}`}>
      {maxRound === 0 ? (
        <Pie data={generatePieChartData()} />
      ) : (
        <Line data={generateLineChartData()} />
      )}
    </div>
  );
}

export default MedalChart;