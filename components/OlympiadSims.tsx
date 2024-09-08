'use client'

import React, { useEffect, useState } from "react";
import olympiadTeamMap from '@/public/olympiadTeamMap.json';

// Define the types for olympiadTeamMap
type OlympiadTeamMap = {
  [key: string]: string;
}

const OlympiadSims = () => {
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering
  const [medalData, setMedalData] = useState<any>(null); // State to store fetched data
  const [nSims, setNSims] = useState<number>(0); // State to store number of simulations
  const [maxRound, setMaxRound] = useState<number>(0); // State to store the maximum round number
  const [sortColumn, setSortColumn] = useState<string>('gold'); // State to store current sorting column
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // State to store current sorting order

  useEffect(() => {
    setIsClient(true); // Update the state to indicate client-side rendering
    const fetchData = async () => {
      try {
        const response = await fetch("/api/sims/olympiad", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Empty object since the new API doesn't require specific input
        });

        if (response.ok) {
          const data = await response.json();
          setMedalData(data); // Store fetched data in state
          setNSims(data.nSims); // Store total number of simulations
          setMaxRound(data.highestRound); // Store the maximum round number
        } else {
          console.error("Server responded with an error:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
      }
    };

    fetchData();
  }, []);

  // Function to handle column sorting
  const handleSort = (column: 'gold' | 'silver' | 'bronze') => {
    if (sortColumn === column) {
      // If the current column is already sorted, toggle the order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, sort by the new column in descending order
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  // Function to sort data based on selected column and order
  const getSortedData = () => {
    if (!medalData) return [];

    //make list of any country that gets a gold silver OR bronze
    const countryMedalList: string[] = []
    medalData.rounds.forEach((round: any) => {
        round.gold.forEach((gold: any) => {
            if (!countryMedalList.includes(gold.country)) {
                countryMedalList.push(gold.country)
            }
        })
        round.silver.forEach((silver: any) => {
            if (!countryMedalList.includes(silver.country)) {
                countryMedalList.push(silver.country)
            }
        })
        round.bronze.forEach((bronze: any) => {
            if (!countryMedalList.includes(bronze.country)) {
                countryMedalList.push(bronze.country)
            }
        })
    })

    const combinedData = countryMedalList.map((country: string) => ({
        country,
        gold: medalData.rounds[maxRound].gold.find((item: any) => item.country === country)?.percentage || 0,
        silver: medalData.rounds[maxRound].silver.find((item: any) => item.country === country)?.percentage || 0,
        bronze: medalData.rounds[maxRound].bronze.find((item: any) => item.country === country)?.percentage || 0,
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

  // Function to map country names to their respective flags
  const mapCountryToFlag = (country: string) => {
    const teamMap: OlympiadTeamMap = olympiadTeamMap;
    const teamCode = teamMap[country];
    return <div className={`tn_${teamCode}`}></div>;
  };

  // Render the table with country names, their flags, and their chances of winning each medal
  const renderTable = () => {
    const sortedData = getSortedData();

    return (
      <table className="table-auto border-collapse border border-gray-300 min-w-[80%] align-middle justify-center mx-auto">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-300 px-4 py-2 min-w-[25px] text-center">Flag</th>
            <th className="border border-gray-300 px-4 py-2 min-w-[75px] text-center">Country</th>
            <th
              className="border border-gray-300 px-4 py-2 cursor-pointer min-w-[50px] text-center"
              onClick={() => handleSort('gold')}
            >
              Gold (%) {sortColumn === 'gold' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th
              className="border border-gray-300 px-4 py-2 cursor-pointer min-w-[50px] text-center"
              onClick={() => handleSort('silver')}
            >
              Silver (%) {sortColumn === 'silver' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th
              className="border border-gray-300 px-4 py-2 cursor-pointer min-w-[50px] text-center"
              onClick={() => handleSort('bronze')}
            >
              Bronze (%) {sortColumn === 'bronze' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row: any, index: any) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
              <td className="border border-gray-300 px-4 py-2 text-center align-middle">
                <div className="inline-block">{mapCountryToFlag(row.country)}</div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">{row.country}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{parseFloat(row.gold).toFixed(1)}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{parseFloat(row.silver).toFixed(1)}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{parseFloat(row.bronze).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {isClient && (
        <div className="p-4">
          <h2 className="text-lg font-bold text-center mb-4">{`Medal Chances by Country After Round ${maxRound}`}</h2>
          <p className="text-center mb-4">Total Simulations: {nSims}</p> {/* Display number of simulations */}
          {renderTable()}
        </div>
      )}
    </div>
  );
};

export default OlympiadSims;
