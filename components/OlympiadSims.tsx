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
          headers: { 'Content-Type': 'application/json' },
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
        if (!countryMedalList.includes(gold.country)) countryMedalList.push(gold.country);
      });
      round.silver.forEach((silver: any) => {
        if (!countryMedalList.includes(silver.country)) countryMedalList.push(silver.country);
      });
      round.bronze.forEach((bronze: any) => {
        if (!countryMedalList.includes(bronze.country)) countryMedalList.push(bronze.country);
      });
    });

    const combinedData = countryMedalList.map((country: string) => ({
      country,
      gold: medalData.rounds[maxRound].gold.find((item: any) => item.country === country)?.percentage || 0,
      silver: medalData.rounds[maxRound].silver.find((item: any) => item.country === country)?.percentage || 0,
      bronze: medalData.rounds[maxRound].bronze.find((item: any) => item.country === country)?.percentage || 0,
    }));

    return combinedData.sort((a: any, b: any) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
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
        <table className="table-auto w-full border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-[var(--bg-surface-2)]">
              <th className="border border-[var(--border)] px-4 py-2 min-w-[25px] text-center text-[var(--text-primary)] text-sm">Flag</th>
              <th className="border border-[var(--border)] px-4 py-2 min-w-[75px] text-center text-[var(--text-primary)] text-sm">Country</th>
              <th
                className="border border-[var(--border)] px-4 py-2 cursor-pointer min-w-[50px] text-center text-[var(--text-primary)] text-sm hover:text-chess-gold transition-colors"
                onClick={() => handleSort('gold')}
              >
                Gold (%) {sortColumn === 'gold' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="border border-[var(--border)] px-4 py-2 cursor-pointer min-w-[50px] text-center text-[var(--text-primary)] text-sm hover:text-chess-gold transition-colors"
                onClick={() => handleSort('silver')}
              >
                Silver (%) {sortColumn === 'silver' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="border border-[var(--border)] px-4 py-2 cursor-pointer min-w-[50px] text-center text-[var(--text-primary)] text-sm hover:text-chess-gold transition-colors"
                onClick={() => handleSort('bronze')}
              >
                Bronze (%) {sortColumn === 'bronze' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row: any, index: any) => (
              <tr key={index} className={`${index % 2 === 0 ? 'bg-[var(--bg-surface-1)]' : 'bg-[var(--bg-base)]'} hover:bg-[var(--bg-surface-2)] transition-colors`}>
                <td className="border border-[var(--border)] px-4 py-2 text-center align-middle">
                  <div className="inline-block">{mapCountryToFlag(row.country)}</div>
                </td>
                <td className="border border-[var(--border)] px-4 py-2 text-center text-[var(--text-secondary)] text-sm">{row.country}</td>
                <td className="border border-[var(--border)] px-4 py-2 text-center text-[var(--text-secondary)] text-sm">{parseFloat(row.gold).toFixed(1)}</td>
                <td className="border border-[var(--border)] px-4 py-2 text-center text-[var(--text-secondary)] text-sm">{parseFloat(row.silver).toFixed(1)}</td>
                <td className="border border-[var(--border)] px-4 py-2 text-center text-[var(--text-secondary)] text-sm">{parseFloat(row.bronze).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {isClient && (
        <div className="p-4">
          {showOnlyMedalChart ? (
            <MedalChart medalData={medalData} maxRound={maxRound} topN={8} />
          ) : (
            <>
              <h2 className="text-lg font-heading text-[var(--text-primary)] text-center mb-4">{`Medal Chances by Country After Round ${maxRound}`}</h2>
              <p className="text-center mb-4 text-[var(--text-muted)] text-sm">Total Simulations: {nSims}</p>
              <MedalChart medalData={medalData} maxRound={maxRound} topN={8} />
              {renderTable()}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OlympiadSims;
