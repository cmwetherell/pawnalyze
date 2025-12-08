'use client'

import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
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
  topN: number;
  className?: string;
}

// Updated colors for dark theme
const COLORS_PALETTE = ['#D4A84B', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

const MedalChart: React.FC<MedalChartProps> = ({ medalData, maxRound, topN, className }) => {
  const colorMap = useMemo(() => {
    const latestRoundData = medalData?.rounds?.[maxRound]?.gold || [];
    const sortedData = latestRoundData
      .map((item) => ({
        country: item.country,
        percentage: parseFloat(item.percentage),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const map: Record<string, string> = {};
    sortedData.forEach((item, index) => {
      if (index < COLORS_PALETTE.length) {
        map[item.country] = COLORS_PALETTE[index];
      }
    });

    map['Other'] = '#71717A';

    return map;
  }, [medalData, maxRound]);

  const getTopNCountries = (roundIndex: number) => {
    const roundData = medalData?.rounds?.[roundIndex] || {};
    if (!roundData || !roundData.gold) return [];

    const sortedData = roundData.gold
      .map((item) => ({
        country: item.country,
        percentage: parseFloat(item.percentage),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const topCountries = sortedData.slice(0, topN);
    const otherCountries = sortedData.slice(topN);

    const otherPercentage = otherCountries.reduce((sum, country) => sum + country.percentage, 0);

    if (otherPercentage > 0) {
      topCountries.push({ country: 'Other', percentage: otherPercentage });
    }

    return topCountries;
  };

  const getTopNCountriesFromLatestRound = () => {
    const latestRoundData = medalData?.rounds?.[maxRound]?.gold || [];
    const sortedData = latestRoundData
      .map((item) => ({
        country: item.country,
        percentage: parseFloat(item.percentage),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const topCountries = sortedData.slice(0, topN);
    const hasOther = sortedData.length > topN;

    return { topCountries, hasOther };
  };

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
          backgroundColor: topCountries.map((item) => colorMap[item.country] || '#71717A'),
          borderColor: topCountries.map((item) => colorMap[item.country] || '#71717A'),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  const generateLineChartData = (): ChartData<'line', number[], unknown> => {
    if (!medalData || !medalData.rounds) {
      return { labels: [], datasets: [] };
    }

    const labels = medalData.rounds.map((_, index) => `R${index}`);

    const { topCountries, hasOther } = getTopNCountriesFromLatestRound();

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
        borderColor: colorMap[countryName] || '#71717A',
        backgroundColor: colorMap[countryName] || '#71717A',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: colorMap[countryName] || '#71717A',
        pointBorderColor: '#0A0A0B',
        pointBorderWidth: 2,
        borderWidth: 2,
      };
    });

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
        borderColor: colorMap['Other'] || '#71717A',
        backgroundColor: colorMap['Other'] || '#71717A',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: colorMap['Other'] || '#71717A',
        pointBorderColor: '#0A0A0B',
        pointBorderWidth: 2,
        borderWidth: 2,
      });
    }

    return {
      labels,
      datasets,
    };
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
        position: 'right',
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
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value.toFixed(1)}%`;
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
          text: maxRound === 0 ? 'Country' : 'Round',
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
          text: 'Win Gold %',
          color: '#A1A1AA',
          font: {
            family: 'var(--font-body)',
            size: 12,
            weight: 500 as const,
          },
        },
        min: 0,
        suggestedMax: 50,
      },
    },
  };

  return (
    <div 
      style={{ height: '400px', maxWidth: maxRound === 0 ? '400px' : '100%' }} 
      className={`mx-auto ${className || ''}`}
    >
      {maxRound === 0 ? (
        <Bar data={generateBarChartData()} options={options} />
      ) : (
        <Line data={generateLineChartData()} options={options} />
      )}
    </div>
  );
};

export default MedalChart;
