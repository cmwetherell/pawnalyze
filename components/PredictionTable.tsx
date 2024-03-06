// PredictionTable.tsx
import React from 'react';
import { PercentageData } from '@/types'; // Assuming this is the correct path for your types
import { cn } from '@/lib/utils';

type PredictionTableProps = {
  playerWinPercentages: PercentageData[];
};

const PredictionTable: React.FC<PredictionTableProps> = ({ playerWinPercentages }) => {
  return (
    <div className="flex justify-center mt-6">
      <table className="table-auto bg-white border-collapse border-black">
        <thead className="text-xs text-white uppercase bg-black">
          <tr>
            <th className="py-2 px-4 rounded-tl-md">Player Name</th>
            <th className="py-2 px-4 text-right rounded-tr-md">Win Percentage</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-200">
          {playerWinPercentages.map((player, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b border-gray-200"> {player.name} </td>
              <td className="py-2 px-4 text-right border-b border-gray-200"> {player.value.toFixed(1)}% </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictionTable;
