import React from 'react';
import { PercentageData } from '@/types';

type PredictionTableProps = {
  playerWinPercentages: PercentageData[];
};

const PredictionTable: React.FC<PredictionTableProps> = ({ playerWinPercentages }) => {
  return (
    <div className="flex justify-center mt-6">
      <table className="table-auto border-collapse">
        <thead>
          <tr className="bg-[var(--bg-surface-2)]">
            <th className="py-2 px-4 rounded-tl-md text-left text-sm font-medium text-[var(--text-primary)]">Player Name</th>
            <th className="py-2 px-4 text-right rounded-tr-md text-sm font-medium text-[var(--text-primary)]">Win Percentage</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-[var(--border)]">
          {playerWinPercentages.map((player, index) => (
            <tr key={index} className="bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-2)] transition-colors">
              <td className="py-2 px-4 text-[var(--text-secondary)]">{player.name}</td>
              <td className="py-2 px-4 text-right text-[var(--text-secondary)]">{player.value.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictionTable;
