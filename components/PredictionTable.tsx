// PredictionTable.tsx
import React from 'react';
import { PercentageData } from '@/types'; // Assuming this is the correct path for your types

type PredictionTableProps = {
  playerWinPercentages: PercentageData[];
};

const PredictionTable: React.FC<PredictionTableProps> = ({ playerWinPercentages }) => {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
      <table className="w-full table-auto">
        <thead className="bg-white/10 text-xs uppercase tracking-[0.4em] text-sand-muted">
          <tr>
            <th className="py-3 px-4 text-left">Player Name</th>
            <th className="py-3 px-4 text-right">Win Percentage</th>
          </tr>
        </thead>
        <tbody className="text-sm text-sand">
          {playerWinPercentages.map((player, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}>
              <td className="py-3 px-4">{player.name}</td>
              <td className="py-3 px-4 text-right">{player.value.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictionTable;
