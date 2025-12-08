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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-obsidian-400 uppercase tracking-wider">
                Flag
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-obsidian-400 uppercase tracking-wider">
                Country
              </th>
              <th 
                className="px-4 py-3 text-center text-xs font-semibold text-amber-400 uppercase tracking-wider cursor-pointer hover:text-amber-300 transition-colors"
                onClick={() => handleSort('gold')}
              >
                Gold {sortColumn === 'gold' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-center text-xs font-semibold text-obsidian-300 uppercase tracking-wider cursor-pointer hover:text-ivory-100 transition-colors"
                onClick={() => handleSort('silver')}
              >
                Silver {sortColumn === 'silver' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-center text-xs font-semibold text-amber-600 uppercase tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
                onClick={() => handleSort('bronze')}
              >
                Bronze {sortColumn === 'bronze' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {sortedData.map((row: any, index: any) => (
              <tr 
                key={index} 
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="inline-block">{mapCountryToFlag(row.country)}</div>
                </td>
                <td className="px-4 py-3 text-ivory-100 font-medium">
                  {row.country}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono ${parseFloat(row.gold) > 0 ? 'text-amber-400' : 'text-obsidian-500'}`}>
                    {parseFloat(row.gold).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono ${parseFloat(row.silver) > 0 ? 'text-obsidian-300' : 'text-obsidian-500'}`}>
                    {parseFloat(row.silver).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono ${parseFloat(row.bronze) > 0 ? 'text-amber-600' : 'text-obsidian-500'}`}>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
          <p className="text-obsidian-400 text-sm">Loading simulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isClient && (
        <div className="space-y-8">
          {showOnlyMedalChart ? (
            <MedalChart medalData={medalData} maxRound={maxRound} topN={8} />
          ) : (
            <>
              <div className="text-center">
                <h2 className="font-display text-2xl font-semibold text-ivory-100 mb-2">
                  Medal Chances After Round {maxRound}
                </h2>
                <p className="text-obsidian-400 text-sm">
                  Based on <span className="text-amber-400 font-medium">{nSims.toLocaleString()}</span> simulations
                </p>
              </div>
              
              <MedalChart medalData={medalData} maxRound={maxRound} topN={8} />
              
              <div className="glass-card overflow-hidden">
                {renderTable()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OlympiadSims;
