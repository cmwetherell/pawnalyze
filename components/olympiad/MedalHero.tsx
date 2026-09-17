'use client';

import Flag from '@/components/ui/Flag';
import { formatDelta, formatPct } from '@/components/ui/ProbBar';
import type { Team, TeamOdds } from '@/lib/olympiad/types';

interface MedalHeroProps {
  rows: TeamOdds[];                 // current (baseline or scenario), any order
  baseline: Map<number, TeamOdds>;
  teamsById: Map<number, Team>;
  isScenario: boolean;
  selectedTeamId?: number | null;
  onSelect?: (teamId: number) => void;
  onPrefetch?: (teamId: number) => void;
  topN?: number;
}

export default function MedalHero({ rows, baseline, teamsById, isScenario, selectedTeamId, onSelect, onPrefetch, topN = 8 }: MedalHeroProps) {
  const top = [...rows]
    .sort((a, b) => b.pGold - a.pGold || b.pMedal - a.pMedal || a.teamId - b.teamId)
    .slice(0, topN);

  return (
    <div>
      <p className="text-xs text-[var(--text-muted)] mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{isScenario ? 'Chance of winning gold under your scenario.' : 'Chance of winning gold.'} Bar shows the full podium out of 100%.</span>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-medal-gold" />Gold</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-medal-silver" />Silver</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-medal-bronze" />Bronze</span>
        </span>
      </p>

      <ol className="space-y-1">
        {top.map((row, i) => {
          const team = teamsById.get(row.teamId);
          if (!team) return null;
          const base = baseline.get(row.teamId);
          const delta = isScenario && base ? formatDelta(row.pGold, base.pGold) : null;
          const up = base ? row.pGold > base.pGold : false;
          const w = (v: number) => `${Math.min(100, v * 100)}%`;
          const selected = selectedTeamId === row.teamId;
          const srPodium = `gold ${formatPct(row.pGold)}, silver ${formatPct(row.pSilver)}, bronze ${formatPct(row.pBronze)}`;
          return (
            <li key={row.teamId}>
              <button
                type="button"
                onClick={() => onSelect?.(row.teamId)}
                onMouseEnter={() => onPrefetch?.(row.teamId)}
                onFocus={() => onPrefetch?.(row.teamId)}
                aria-pressed={selected}
                aria-label={`${team.name}: ${srPodium}. Open team details`}
                className={`group w-full flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${
                  selected ? 'bg-chess-gold/10 ring-1 ring-chess-gold/40' : 'hover:bg-[var(--bg-surface-2)]'
                }`}
              >
                <span className="w-5 text-right text-xs tabular-nums text-[var(--text-muted)]">{i + 1}</span>
                <Flag code={team.fedCode} size="lg" title={team.name} className="!ring-0" aria-hidden />
                <span className="flex-1 min-w-0 block">
                  <span className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate underline-offset-4 decoration-dotted decoration-[var(--text-muted)] group-hover:underline group-hover:text-gold-ink">
                      {team.name}
                      <span className="ml-1.5 text-[11px] text-[var(--text-muted)] tabular-nums" title={`Seed #${team.teamId}`}>#{team.teamId}</span>
                    </span>
                    <span className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
                      {delta && (
                        <span className={`text-[11px] font-semibold ${up ? 'text-emerald-500' : 'text-rose-400'}`}>{up ? '▲' : '▼'} {delta.replace(/^[+−]/, '')}</span>
                      )}
                      <span className="text-base font-heading text-gold-ink">{formatPct(row.pGold)}</span>
                      <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">podium {formatPct(row.pMedal)}</span>
                    </span>
                  </span>
                  <span className="relative block h-2.5 rounded-full bg-[var(--bg-surface-3)] overflow-hidden">
                    <span className="absolute inset-0 flex">
                      <span className="h-full bg-medal-gold motion-safe:transition-[width] motion-safe:duration-500" style={{ width: w(row.pGold) }} />
                      <span className="h-full bg-medal-silver motion-safe:transition-[width] motion-safe:duration-500" style={{ width: w(row.pSilver) }} />
                      <span className="h-full bg-medal-bronze motion-safe:transition-[width] motion-safe:duration-500" style={{ width: w(row.pBronze) }} />
                    </span>
                    {isScenario && base && (
                      <span
                        className="absolute inset-y-0 w-0.5 bg-[var(--text-primary)]"
                        style={{ left: `calc(${w(base.pGold)} - 1px)` }}
                        title={`Baseline gold ${formatPct(base.pGold)}`}
                      />
                    )}
                  </span>
                </span>
                <svg className={`w-4 h-4 shrink-0 transition-transform ${selected ? 'text-gold-ink rotate-90' : 'text-[var(--text-muted)] group-hover:text-gold-ink group-hover:translate-x-0.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </li>
          );
        })}
      </ol>
      {isScenario && (
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">The dark tick marks each team&apos;s baseline gold odds.</p>
      )}
    </div>
  );
}
