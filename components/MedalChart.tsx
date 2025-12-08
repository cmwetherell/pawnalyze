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

const COLORS_PALETTE = ['#f6c177', '#72f5c7', '#ff6b6b', '#9ea8c7', '#f09383', '#7aa2f7', '#fbd38d', '#a0e9ff'];

const MedalChart: React.FC<MedalChartProps> = ({ medalData, maxRound, topN, className }) => {
  // Create a color map based on the top N countries from the latest round
  const colorMap = useMemo(() => {
    const latestRoundData = medalData?.rounds?.[maxRound]?.gold || []; // Get data from the latest round
    const sortedData = latestRoundData
      .map((item) => ({
        country: item.country,
        percentage: parseFloat(item.percentage),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Assign colors to each country based on their ranking in the latest round
    const map: Record<string, string> = {};
    sortedData.forEach((item, index) => {
      if (index < COLORS_PALETTE.length) {
        map[item.country] = COLORS_PALETTE[index];
      }
    });

    // Assign a color for 'Other'
    map['Other'] = '#CCCCCC';

    return map;
  }, [medalData, maxRound]);

  // Function to get top N countries based on the specified round
  const getTopNCountries = (roundIndex: number) => {
    const roundData = medalData?.rounds?.[roundIndex] || {};
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

  // Function to get top N countries based on the latest round (maxRound)
  const getTopNCountriesFromLatestRound = () => {
    const latestRoundData = medalData?.rounds?.[maxRound]?.gold || [];
    // Sort the countries based on gold medal percentages in descending order
    const sortedData = latestRoundData
      .map((item) => ({
        country: item.country,
        percentage: parseFloat(item.percentage),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Get the top N countries
    const topCountries = sortedData.slice(0, topN);

    // Determine if there are 'Other' countries
    const hasOther = sortedData.length > topN;

    return { topCountries, hasOther };
  };

  // Function to generate the data for the Bar chart
  const generateBarChartData = (): ChartData<'bar', number[], unknown> => {
    const topCountries = getTopNCountries(maxRound);
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
          backgroundColor: topCountries.map((item) => colorMap[item.country] || '#CCCCCC'), // Use the color map
          borderColor: topCountries.map((item) => colorMap[item.country] || '#CCCCCC'),
          borderWidth: 1,
        },
      ],
    };
  };

  // Function to generate the data for the Line chart
  const generateLineChartData = (): ChartData<'line', number[], unknown> => {
    if (!medalData || !medalData.rounds) {
      return { labels: [], datasets: [] };
    }

    const labels = medalData.rounds.map((_, index) => `Round ${index}`);

    // Get the list of top N countries and whether there is 'Other', based on the latest round
    const { topCountries, hasOther } = getTopNCountriesFromLatestRound();

    // For each country, collect their gold percentages over rounds
    const datasets = topCountries.map((countryItem) => {
      const countryName = countryItem.country;

      const data = medalData.rounds.map((round) => {
        const goldData = round.gold.find((item) => item.country === countryName);
        return goldData ? parseFloat(goldData.percentage) : 0;
      });

      return {
        label: countryName,
        data,
        fill: false,
        borderColor: colorMap[countryName] || '#CCCCCC',
        backgroundColor: colorMap[countryName] || '#CCCCCC',
        tension: 0.1, // Optional: curve tension
      };
    });

    // If there is 'Other', calculate the 'Other' dataset
    if (hasOther) {
      const otherData = medalData.rounds.map((round) => {
        const otherPercentage = round.gold.reduce((sum, item) => {
          if (!topCountries.find((topCountry) => topCountry.country === item.country)) {
            return sum + parseFloat(item.percentage);
          } else {
            return sum;
          }
        }, 0);
        return otherPercentage;
      });

      datasets.push({
        label: 'Other',
        data: otherData,
        fill: false,
        borderColor: colorMap['Other'] || '#CCCCCC',
        backgroundColor: colorMap['Other'] || '#CCCCCC',
        tension: 0.1,
      });
    }

    return {
      labels,
      datasets,
    };
  };

  // Define the chart options with custom legend and tooltip settings
  const axisColor = 'rgba(244,239,228,0.8)';
  const gridColor = 'rgba(255,255,255,0.08)';

  const options: any = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: axisColor,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(4,5,12,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed || 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: maxRound === 0 ? 'Country' : 'Round',
          color: axisColor,
        },
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Win Gold %',
          color: axisColor,
        },
        ticks: {
          color: axisColor,
        },
        min: 0,
        suggestedMax: 60,
        grid: {
          color: gridColor,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const conditionalMaxWidth: string = maxRound === 0 ? '420px' : '820px';

  return (
    <div
      style={{ maxWidth: conditionalMaxWidth }}
      className={`mx-auto w-full rounded-2xl border border-white/10 bg-black/20 p-4 ${className || ''}`}
    >
      <div className="h-[360px]">
        {maxRound === 0 ? (
          <Bar data={generateBarChartData()} options={options} />
        ) : (
          <Line data={generateLineChartData()} options={options} />
        )}
      </div>
    </div>
  );
}

export default MedalChart;
