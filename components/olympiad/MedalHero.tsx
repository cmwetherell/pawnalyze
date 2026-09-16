'use client';

import Flag from '@/components/ui/Flag';
import { formatDelta, formatPct } from '@/components/ui/ProbBar';
import type { Team, TeamOdds } from '@/lib/olympiad/types';

interface MedalHeroProps {
  rows: TeamOdds[];                 // current (baseline or scenario), any order
  baseline: Map<number, TeamOdds>;
  teamsById: Map<number, Team>;
  isScenario: boolean;
  topN?: number;
}

export default function MedalHero({ rows, baseline, teamsById, isScenario, topN = 10 }: MedalHeroProps) {
  const top = [...rows]
    .sort((a, b) => b.pGold - a.pGold || b.pMedal - a.pMedal || a.teamId - b.teamId)
    .slice(0, topN);

  return (
    <div className="surface-card p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-heading text-[var(--text-primary)]">Gold Medal Race</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {isScenario ? 'Chance of winning gold under your scenario · bar shows gold, silver and bronze out of 100%' : 'Chance of winning gold · bar shows gold, silver and bronze out of 100%'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-medal-gold" />Gold</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-medal-silver" />Silver</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-medal-bronze" />Bronze</span>
        </div>
      </div>

      <ol className="space-y-2">
        {top.map((row, i) => {
          const team = teamsById.get(row.teamId);
          if (!team) return null;
          const base = baseline.get(row.teamId);
          const delta = isScenario && base ? formatDelta(row.pGold, base.pGold) : null;
          const up = base ? row.pGold > base.pGold : false;
          const w = (v: number) => `${Math.min(100, v * 100)}%`;
          return (
            <li key={row.teamId} className="flex items-center gap-3">
              <span className="w-5 text-right text-xs tabular-nums text-[var(--text-muted)]">{i + 1}</span>
              <Flag code={team.fedCode} size="lg" title={team.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {team.name}
                    <span className="ml-1.5 text-[10px] text-[var(--text-muted)] tabular-nums">#{team.teamId}</span>
                  </span>
                  <span className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
                    {delta && (
                      <span className={`text-[10px] font-semibold ${up ? 'text-emerald-500' : 'text-rose-400'}`}>{delta}</span>
                    )}
                    <span className="text-base font-heading text-chess-gold">{formatPct(row.pGold)}</span>
                    <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">podium {formatPct(row.pMedal)}</span>
                  </span>
                </div>
                <div className="relative h-2.5 rounded-full bg-[var(--bg-surface-3)] overflow-hidden">
                  {isScenario && base && (
                    <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--text-muted)]/30" style={{ width: w(base.pMedal) }} />
                  )}
                  <div className="absolute inset-0 flex">
                    <div className="h-full bg-medal-gold transition-[width] duration-500" style={{ width: w(row.pGold) }} />
                    <div className="h-full bg-medal-silver transition-[width] duration-500" style={{ width: w(row.pSilver) }} />
                    <div className="h-full bg-medal-bronze transition-[width] duration-500" style={{ width: w(row.pBronze) }} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
