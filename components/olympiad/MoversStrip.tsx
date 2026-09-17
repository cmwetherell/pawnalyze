'use client';

import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import { movers } from '@/lib/olympiad/odds';
import type { HistoryPoint, Team } from '@/lib/olympiad/types';

interface MoversStripProps {
  history: HistoryPoint[];
  teamsById: Map<number, Team>;
  onSelect?: (teamId: number) => void;
  roundLabel: string;
}

export default function MoversStrip({ history, teamsById, onSelect, roundLabel }: MoversStripProps) {
  const { up, down } = movers(history, 4);
  if (up.length === 0 && down.length === 0) return null;
  const chips = [...up, ...down];
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Gold-odds movers since {roundLabel}</div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
        {chips.map(m => {
          const team = teamsById.get(m.teamId);
          if (!team) return null;
          const upward = m.delta > 0;
          return (
            <button
              key={m.teamId}
              type="button"
              onClick={() => onSelect?.(m.teamId)}
              title={`${team.name}: ${formatPct(m.from)} → ${formatPct(m.to)}`}
              className={`shrink-0 inline-flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-full text-xs border transition-colors ${
                upward
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <Flag code={team.fedCode} size="xs" className="!ring-0" />
              <span className="font-medium text-[var(--text-primary)] max-w-[9rem] truncate">{team.name}</span>
              <span className="tabular-nums font-semibold">{upward ? '▲' : '▼'} {(Math.abs(m.delta) * 100).toFixed(1)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
