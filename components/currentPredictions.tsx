'use client';

import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { PercentageData, CurrentPredictionsProps, PlayerColorsMap } from '@/types';
import { Game } from '@/types';
import { buildPlayerColorMap } from '@/lib/playerData';
import { fetchSimulationData } from '@/lib/actions';

import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';
import candResByRound2026 from '@/public/candResByRound2026.json';
import womensCandByRound2026 from '@/public/womensCandByRound2026.json';
import ChartSkeleton from './ChartSkeleton';

Chart.register(ChartDataLabels);

function useChartTheme() {
  const [theme, setTheme] = useState({
    gridColor: '#1f293740',
    textColor: '#8b949e',
    textPrimary: '#f0f2f5',
    tooltipBg: '#1a1d23',
    tooltipBorder: '#2d333b',
    tooltipText: '#f0f2f5',
    tooltipBody: '#c9d1d9',
  });

  useEffect(() => {
    const update = () => {
      const s = getComputedStyle(document.documentElement);
      setTheme({
        gridColor: s.getPropertyValue('--chart-grid').trim() + '40',
        textColor: s.getPropertyValue('--text-muted').trim(),
        textPrimary: s.getPropertyValue('--text-primary').trim(),
        tooltipBg: s.getPropertyValue('--chart-tooltip-bg').trim(),
        tooltipBorder: s.getPropertyValue('--chart-tooltip-border').trim(),
        tooltipText: s.getPropertyValue('--text-primary').trim(),
        tooltipBody: s.getPropertyValue('--text-secondary').trim(),
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

let customOrder = ['Pre', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'Simulated'];

const GetPredictions = ({ nsims, gameFilters, updateTrigger, eventTable, onLoadingChange, initialData }: CurrentPredictionsProps) => {
  const [isClient, setIsClient] = useState(false);
  const [playerWinPercentagesByRound, setPlayerWinPercentagesByRound] = useState<Record<string, PercentageData[]>>({});
  const [totalGames, setTotalGames] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const chartTheme = useChartTheme();

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

  const processData = (data: any[]) => {
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
  };

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      onLoadingChange?.(true);

      const noFilters = !gameFilters || gameFilters.length === 0;

      // Use server-cached initial data when no filters are applied
      if (noFilters && initialData) {
        processData(initialData);
        onLoadingChange?.(false);
        return;
      }

      try {
        const data = await fetchSimulationData(gameFilters, nsims, eventTable);
        processData(data);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        onLoadingChange?.(false);
      }
    };

    fetchData();
  }, [updateTrigger]);

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

  // Bar chart
  const barPlayerPercentages = [...playerPercentages].sort((a, b) => b.percentage - a.percentage);
  const barData = {
    labels: barPlayerPercentages.map(p => p.name),
    datasets: [
      {
        data: barPlayerPercentages.map(p => p.percentage),
        backgroundColor: barPlayerPercentages.map(p => playerColorsMap[p.name]),
        borderColor: barPlayerPercentages.map(p => playerColorsMap[p.name]),
        borderWidth: 0,
        borderRadius: 8,
        barPercentage: 0.65,
      },
    ],
  };

  const barOptions: any = {
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartTheme.tooltipBg,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipBody,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: 1,
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
        color: chartTheme.textColor,
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
          color: chartTheme.textColor,
          font: { size: 13, weight: 'bold' as const },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Line chart
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
          color: chartTheme.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBg,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipBody,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: 1,
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
          color: chartTheme.textColor,
          font: { size: 12 },
        },
        grid: {
          color: chartTheme.gridColor,
          drawBorder: false,
        },
        ticks: { color: chartTheme.textColor },
      },
      y: {
        title: {
          display: true,
          text: 'Win %',
          color: chartTheme.textColor,
          font: { size: 12 },
        },
        stacked: false,
        min: 0,
        max: 100,
        grid: {
          color: chartTheme.gridColor,
          borderDash: [4, 4],
          drawBorder: false,
        },
        ticks: { color: chartTheme.textColor },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div>
      {isClient && showBarChart && hasSimulated && (
        <p className="text-xs text-center text-chess-gold bg-chess-gold/10 border border-chess-gold/20 rounded-md px-3 py-1.5 mb-3">
          Predictions updated to reflect your scenario selections
        </p>
      )}
      <div className="overflow-x-auto min-w-0" style={{ height: '500px' }}>
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
        <p className="text-xs text-[var(--text-muted)] text-center mt-2 mb-0">
          Based on {totalGames.toLocaleString()} simulations
        </p>
      )}
    </div>
  );
};

export default GetPredictions;
