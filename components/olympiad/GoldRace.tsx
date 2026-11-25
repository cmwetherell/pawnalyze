'use client';

import { RaceRows } from '@/components/charts/RaceRows';
import { Delta } from '@/components/ui/Delta';
import { Legend } from '@/components/ui/Swatch';
import { formatPct } from '@/lib/format';
import type { Team, TeamOdds } from '@/lib/olympiad/types';
import { shortTeamName } from './teams';

interface GoldRaceProps {
  /** Current odds, baseline or scenario, any order. */
  rows: TeamOdds[];
  baseline: Map<number, TeamOdds>;
  teamsById: Map<number, Team>;
  isScenario: boolean;
  selectedTeamId: number | null;
  onSelect: (teamId: number) => void;
  onPrefetch: (teamId: number) => void;
}

const TOP_N = 8;

export const byGold = (a: TeamOdds, b: TeamOdds) => b.pGold - a.pGold || b.pMedal - a.pMedal || a.teamId - b.teamId;

export function medalSegments(o: Pick<TeamOdds, 'pGold' | 'pSilver' | 'pBronze'>) {
  return [
    { key: 'gold', value: o.pGold, tone: 'gold' as const, label: `gold ${formatPct(o.pGold)}` },
    { key: 'silver', value: o.pSilver, tone: 'silver' as const, label: `silver ${formatPct(o.pSilver)}` },
    { key: 'bronze', value: o.pBronze, tone: 'bronze' as const, label: `bronze ${formatPct(o.pBronze)}` },
  ];
}

export function GoldRace({ rows, baseline, teamsById, isScenario, selectedTeamId, onSelect, onPrefetch }: GoldRaceProps) {
  const top = [...rows].sort(byGold).slice(0, TOP_N);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <Legend items={[{ tone: 'gold', label: 'Gold' }, { tone: 'silver', label: 'Silver' }, { tone: 'bronze', label: 'Bronze' }]} />
        {isScenario && <p className="type-label text-ink-3">The tick on each bar marks that team&rsquo;s baseline gold odds.</p>}
      </div>
      <RaceRows
        ariaLabel="Chance of winning gold"
        rows={top.flatMap((row, i) => {
          const team = teamsById.get(row.teamId);
          if (!team) return [];
          const base = isScenario ? baseline.get(row.teamId) : undefined;
          const segments = medalSegments(row);
          return [{
            key: String(row.teamId), rank: i + 1, flag: team.fedCode, name: shortTeamName(team.name), seed: `#${team.teamId} seed`, segments,
            value: formatPct(row.pGold), sub: `podium ${formatPct(row.pMedal)}`,
            baseline: base?.pGold, delta: base && <Delta value={row.pGold} base={base.pGold} short />,
            selected: selectedTeamId === row.teamId,
            ariaLabel: `${team.name}: ${segments.map(s => s.label).join(', ')}. Open team details`,
            onSelect: () => onSelect(row.teamId), onPrefetch: () => onPrefetch(row.teamId),
          }];
        })}
      />
    </div>
  );
}
