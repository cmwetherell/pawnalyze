'use client';

import { Chip } from '@/components/ui/Chip';
import { Delta } from '@/components/ui/Delta';
import { Flag } from '@/components/ui/Flag';
import { ScrollRow } from '@/components/ui/ScrollRow';
import { formatPct } from '@/lib/format';
import { movers } from '@/lib/olympiad/odds';
import type { HistoryPoint, Team } from '@/lib/olympiad/types';
import { shortTeamName } from './teams';

interface MoversStripProps {
  history: HistoryPoint[];
  teamsById: Map<number, Team>;
  onSelect: (teamId: number) => void;
  /** "round 4": what the changes are counted from. */
  since: string;
}

export function MoversStrip({ history, teamsById, onSelect, since }: MoversStripProps) {
  const { up, down } = movers(history, 4);
  const all = [...up, ...down];
  if (all.length === 0) return null;
  const label = `Gold-odds movers since ${since}`;
  return (
    <div>
      <p className="mb-2 type-label text-ink-2">{label}</p>
      <ScrollRow label={label} bleed>
        {all.map(m => {
          const team = teamsById.get(m.teamId);
          return team && (
            <Chip key={m.teamId} icon={<Flag code={team.fedCode} size="xs" decorative />} title={`${team.name}: ${formatPct(m.from)} to ${formatPct(m.to)}`} onClick={() => onSelect(m.teamId)}>
              {shortTeamName(team.name)} <Delta value={m.to} base={m.from} short className="ml-1" />
            </Chip>
          );
        })}
      </ScrollRow>
    </div>
  );
}
