// PredictionTable.tsx
import React from 'react';
import { PercentageData } from '@/types';

type PredictionTableProps = {
  playerWinPercentages: PercentageData[];
};

const PredictionTable: React.FC<PredictionTableProps> = ({ playerWinPercentages }) => {
  // Find the highest percentage for highlighting
  const maxPercentage = Math.max(...playerWinPercentages.map(p => p.value));
  
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border-subtle">
      {/* Header */}
      <div className="
        grid grid-cols-2
        bg-bg-elevated
        border-b border-border-subtle
      ">
        <div className="
          px-6 py-4
          text-xs font-semibold uppercase tracking-wider
          text-text-muted
        ">
          Player Name
        </div>
        <div className="
          px-6 py-4
          text-xs font-semibold uppercase tracking-wider
          text-text-muted
          text-right
        ">
          Win Probability
        </div>
      </div>
      
      {/* Body */}
      <div className="divide-y divide-border-subtle">
        {playerWinPercentages.map((player, index) => {
          const isLeader = player.value === maxPercentage && player.value > 0;
          
          return (
            <div 
              key={index} 
              className={`
                grid grid-cols-2
                transition-colors duration-200
                hover:bg-white/[0.02]
                ${isLeader ? 'bg-accent/[0.03]' : ''}
              `}
            >
              {/* Player Name */}
              <div className="px-6 py-4 flex items-center gap-3">
                {isLeader && (
                  <span className="
                    w-2 h-2 
                    rounded-full 
                    bg-accent
                    animate-pulse
                  " />
                )}
                <span className={`
                  font-medium
                  ${isLeader ? 'text-text-primary' : 'text-text-secondary'}
                `}>
                  {player.name}
                </span>
              </div>
              
              {/* Win Percentage */}
              <div className="px-6 py-4 flex items-center justify-end gap-4">
                {/* Progress bar */}
                <div className="hidden sm:block w-24 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                  <div 
                    className={`
                      h-full rounded-full
                      transition-all duration-500 ease-out-expo
                      ${isLeader ? 'bg-accent' : 'bg-text-muted/30'}
                    `}
                    style={{ width: `${player.value}%` }}
                  />
                </div>
                
                {/* Percentage value */}
                <span className={`
                  font-mono text-sm tabular-nums
                  ${isLeader ? 'text-accent font-semibold' : 'text-text-secondary'}
                `}>
                  {player.value.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionTable;
