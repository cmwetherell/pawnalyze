'use client';

// PredictionTable.tsx
import React from 'react';
import { PercentageData } from '@/types'; // Assuming this is the correct path for your types
import { cn } from '@/lib/utils';

type PredictionTableProps = {
  playerWinPercentages: PercentageData[];
};

const PredictionTable: React.FC<PredictionTableProps> = ({ playerWinPercentages }) => {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
      <table className="min-w-full border-collapse text-sm text-slate">
        <thead className="bg-white/10 text-xs uppercase tracking-[0.35em] text-paper">
          <tr>
            <th className="py-3 px-4 text-left">Player</th>
            <th className="py-3 px-4 text-right">Win %</th>
          </tr>
        </thead>
        <tbody>
          {playerWinPercentages.map((player, index) => (
            <tr key={index} className={cn("border-b border-white/5", index % 2 === 0 ? "bg-white/5" : "bg-transparent")}>
              <td className="py-3 px-4 text-paper">{player.name}</td>
              <td className="py-3 px-4 text-right font-mono text-paper">{player.value.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictionTable;
