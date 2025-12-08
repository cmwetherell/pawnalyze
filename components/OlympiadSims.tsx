'use client'

import React, { useEffect, useState } from 'react';
import olympiadTeamMap from '@/public/olympiadTeamMap.json';
import MedalChart from './MedalChart';

type OlympiadTeamMap = {
  [key: string]: string;
};

type OlympiadSimsProps = {
  showOnlyMedalChart?: boolean;
};

const OlympiadSims: React.FC<OlympiadSimsProps> = ({ showOnlyMedalChart = false }) => {
  const [isClient, setIsClient] = useState(false);
  const [medalData, setMedalData] = useState<any>(null);
  const [nSims, setNSims] = useState<number>(0);
  const [maxRound, setMaxRound] = useState<number>(0);
  const [sortColumn, setSortColumn] = useState<string>('gold');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sims/olympiad', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data = await response.json();
          setMedalData(data);
          setNSims(data.nSims);
          setMaxRound(data.highestRound);
        } else {
          console.error('Server responded with an error:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      }
    };

    fetchData();
  }, []);

  const handleSort = (column: 'gold' | 'silver' | 'bronze') => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  const getSortedData = () => {
    if (!medalData) return [];

    const countryMedalList: string[] = [];
    medalData.rounds.forEach((round: any) => {
      round.gold.forEach((gold: any) => {
        if (!countryMedalList.includes(gold.country)) {
          countryMedalList.push(gold.country);
        }
      });
      round.silver.forEach((silver: any) => {
        if (!countryMedalList.includes(silver.country)) {
          countryMedalList.push(silver.country);
        }
      });
      round.bronze.forEach((bronze: any) => {
        if (!countryMedalList.includes(bronze.country)) {
          countryMedalList.push(bronze.country);
        }
      });
    });

    const combinedData = countryMedalList.map((country: string) => ({
      country,
      gold:
        medalData.rounds[maxRound].gold.find((item: any) => item.country === country)?.percentage ||
        0,
      silver:
        medalData.rounds[maxRound].silver.find((item: any) => item.country === country)
          ?.percentage || 0,
      bronze:
        medalData.rounds[maxRound].bronze.find((item: any) => item.country === country)
          ?.percentage || 0,
    }));

    return combinedData.sort((a: any, b: any) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  const mapCountryToFlag = (country: string) => {
    const teamMap: OlympiadTeamMap = olympiadTeamMap;
    const teamCode = teamMap[country];
    return <div className={`tn_${teamCode}`}></div>;
  };

  const renderTable = () => {
    const sortedData = getSortedData();

    return (
      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-elevated">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Flag
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                Country
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleSort('gold')}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="text-yellow-500">🥇</span>
                  Gold
                  {sortColumn === 'gold' && (
                    <span className="text-accent">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleSort('silver')}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="text-gray-400">🥈</span>
                  Silver
                  {sortColumn === 'silver' && (
                    <span className="text-accent">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted cursor-pointer hover:text-accent transition-colors"
                onClick={() => handleSort('bronze')}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="text-amber-700">🥉</span>
                  Bronze
                  {sortColumn === 'bronze' && (
                    <span className="text-accent">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {sortedData.map((row: any, index: any) => (
              <tr 
                key={index} 
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div className="inline-block">{mapCountryToFlag(row.country)}</div>
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {row.country}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono ${parseFloat(row.gold) > 10 ? 'text-yellow-500 font-semibold' : 'text-text-secondary'}`}>
                    {parseFloat(row.gold).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono ${parseFloat(row.silver) > 10 ? 'text-gray-400 font-semibold' : 'text-text-secondary'}`}>
                    {parseFloat(row.silver).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono ${parseFloat(row.bronze) > 10 ? 'text-amber-600 font-semibold' : 'text-text-secondary'}`}>
                    {parseFloat(row.bronze).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading simulations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showOnlyMedalChart ? (
        <MedalChart medalData={medalData} maxRound={maxRound} topN={8} />
      ) : (
        <>
          <div className="text-center">
            <h2 className="font-display text-heading-xl text-text-primary mb-2">
              Medal Chances by Country After Round {maxRound}
            </h2>
            <p className="text-sm text-text-muted">
              Based on <span className="text-accent font-medium">{nSims.toLocaleString()}</span> simulations
            </p>
          </div>
          
          <div className="glass-card p-6">
            <MedalChart medalData={medalData} maxRound={maxRound} topN={8} />
          </div>
          
          {renderTable()}
        </>
      )}
    </div>
  );
};

export default OlympiadSims;
