'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Delta } from '@/components/ui/Delta';
import { EmptyState } from '@/components/ui/EmptyState';
import { Flag } from '@/components/ui/Flag';
import { Icon } from '@/components/ui/Icon';
import { Medal } from '@/components/ui/Medal';
import { Meter } from '@/components/ui/Meter';
import { Table, TBody, Td, Th, THead, Tr, type Align, type Priority } from '@/components/ui/Table';
import { cn } from '@/lib/utils';
import { formatRank } from '@/lib/olympiad/odds';
import type { DerivedStanding, Team, TeamOdds } from '@/lib/olympiad/types';
import { matchesTeam, shortTeamName } from './teams';

type SortKey = 'pos' | 'name' | 'rating' | 'mp' | 'pGold' | 'pMedal' | 'expRank';

interface TeamTableProps {
  /** Participants. */
  teams: Team[];
  standings: Map<number, DerivedStanding>;
  /** Current odds. */
  odds: Map<number, TeamOdds>;
  baseline: Map<number, TeamOdds>;
  isScenario: boolean;
  anyPlayed: boolean;
  /** Event is over: a results table, so places 1 to 3 wear their medal. */
  finished?: boolean;
  query: string;
  selectedTeamId: number | null;
  onSelect: (teamId: number) => void;
  /** Warm the spotlight data for a team the reader is about to open. */
  onPrefetch?: (teamId: number) => void;
  /** Reports the sorted, filtered order (on sort and search changes only) so the parent can offer previous and next. */
  onOrderChange?: (teamIds: number[]) => void;
}

const PAGE = 25;

/** A bar starts clear of the numbers before it. */
const BAR = 'sm:pl-6';
/** Under 360px the team keeps its name and the expected finish is left to its profile; gold odds are then the last column. */
const WIDE = 'max-[359.98px]:hidden';
const LAST_NARROW = 'max-[359.98px]:!pr-0';

interface Column { key: SortKey; label: string; title?: string; align?: Align; priority?: Priority; width?: string | number; className?: string; needsPlay?: boolean }
const COLUMNS: Column[] = [
  { key: 'pos', label: 'Pos', priority: 2, width: 64, needsPlay: true },
  { key: 'name', label: 'Team' },
  { key: 'rating', label: 'Rating', title: 'Average rating', align: 'right', priority: 4 },
  { key: 'mp', label: 'MP', title: 'Match points', align: 'right', needsPlay: true },
  { key: 'pGold', label: 'Gold', title: 'Probability of winning the gold medal', align: 'right', width: '19%', className: cn(BAR, LAST_NARROW) },
  { key: 'pMedal', label: 'Podium', title: 'Probability of any medal', align: 'right', priority: 2, width: '19%', className: BAR },
  { key: 'expRank', label: 'Finish', title: 'Expected final position', align: 'right', className: WIDE },
];
const ASCENDING: SortKey[] = ['name', 'pos', 'expRank'];

const POS_OFFICIAL = 'Official standing from chess-results after the last completed round: match points, then Olympiad Sonneborn-Berger, then game points.';
const POS_DERIVED = 'Unofficial standing: match points, then game points, then seed. Early in the event many teams are tied on match points, so this order is decided by margin of victory.';

export function TeamTable({ teams, standings, odds, baseline, isScenario, anyPlayed, finished = false, query, selectedTeamId, onSelect, onPrefetch, onOrderChange }: TeamTableProps) {
  // A finished event is a results table first: order by final position, not by the frozen odds.
  const [sortKey, setSortKey] = useState<SortKey>(finished ? 'pos' : 'pGold');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(finished ? 'asc' : 'desc');
  const [showAll, setShowAll] = useState(false);
  const searching = query.trim() !== '';

  const rows = useMemo(() => {
    const value = (t: Team, k: SortKey): number | string => {
      const o = odds.get(t.teamId);
      const s = standings.get(t.teamId);
      switch (k) {
        case 'pos': return s?.rank ?? 9999;
        case 'name': return t.name;
        case 'rating': return t.avgRating;
        case 'mp': return s?.mp ?? 0;
        case 'pGold': return o?.pGold ?? 0;
        case 'pMedal': return o?.pMedal ?? 0;
        case 'expRank': return o?.expRank ?? baseline.get(t.teamId)?.expRank ?? 9999;
      }
    };
    const dir = sortDir === 'asc' ? 1 : -1;
    return teams.filter(t => matchesTeam(t, query)).sort((a, b) => {
      const va = value(a, sortKey);
      const vb = value(b, sortKey);
      const cmp = typeof va === 'string' && typeof vb === 'string' ? va.localeCompare(vb) : (va as number) - (vb as number);
      // Ties keep the gold-odds order, then seed, whichever way the column is sorted.
      return cmp * dir || (odds.get(b.teamId)?.pGold ?? 0) - (odds.get(a.teamId)?.pGold ?? 0) || a.teamId - b.teamId;
    });
  }, [teams, odds, standings, baseline, query, sortKey, sortDir]);

  const visible = showAll || searching ? rows : rows.slice(0, PAGE);

  // Only re-announce the browsing order when the reader changes sort or search, not when odds refresh.
  const latestRows = useRef(rows);
  useEffect(() => { latestRows.current = rows; }, [rows]);
  useEffect(() => {
    onOrderChange?.(latestRows.current.map(t => t.teamId));
  }, [sortKey, sortDir, query, onOrderChange]);

  const sortBy = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(ASCENDING.includes(key) ? 'asc' : 'desc');
    }
  };

  const official = anyPlayed && [...standings.values()].some(s => s.official);
  const columns = COLUMNS.filter(c => anyPlayed || !c.needsPlay);

  return (
    <div>
      <Table label="Teams" stickyHead>
        <THead>
          <tr>
            {columns.map(c => (
              <Th
                key={c.key} align={c.align} priority={c.priority} width={c.width} className={c.className} sort={sortKey === c.key ? sortDir : null} onSort={() => sortBy(c.key)}
                title={c.key === 'pos' ? (official ? POS_OFFICIAL : POS_DERIVED) : c.title}
              >
                {c.label}
              </Th>
            ))}
            <Th width={16} priority={2}><span className="sr-only">Open details</span></Th>
          </tr>
        </THead>
        <TBody>
          {visible.map(t => {
            const o = odds.get(t.teamId);
            const b = baseline.get(t.teamId);
            const s = standings.get(t.teamId);
            const selected = selectedTeamId === t.teamId;
            const base = isScenario ? b : undefined;
            const medal = finished && s && s.rank <= 3 ? <Medal rank={s.rank as 1 | 2 | 3} size={28} /> : null;
            const exp = o?.expRank ?? null;
            const stale = isScenario && exp === null;
            return (
              <Tr key={t.teamId} selected={selected} onSelect={() => onSelect(t.teamId)} onPrefetch={onPrefetch && (() => onPrefetch(t.teamId))}>
                {anyPlayed && <Td priority={2} muted>{medal ?? s?.rank ?? '–'}</Td>}
                <Td
                  header press={{ onPress: () => onSelect(t.teamId), label: `${t.name}, seed ${t.teamId}, details`, expanded: selected }}
                  className={medal ? 'font-medium sm:font-semibold' : 'font-medium'}
                  lead={(
                    <>
                      {/* On phones the place column is gone and the seed is in the profile. */}
                      {medal && <span className="mr-2 flex sm:hidden"><Medal rank={s?.rank as 1 | 2 | 3} decorative /></span>}
                      <span className="flex sm:hidden"><Flag code={t.fedCode} size="sm" decorative /></span>
                      <span className="hidden sm:flex"><Flag code={t.fedCode} size="md" decorative /></span>
                    </>
                  )}
                  meta={<span className="hidden sm:inline" title={`Seed #${t.teamId}`}>#{t.teamId}</span>}
                >
                  <span title={t.name}>{shortTeamName(t.name)}</span>
                </Td>
                <Td align="right" priority={4}>{t.avgRating}</Td>
                {anyPlayed && <Td align="right">{s?.mp ?? 0}<span className="hidden text-ink-3 sm:inline">/{(s?.played ?? 0) * 2}</span></Td>}
                <Td align="right" className={cn(BAR, LAST_NARROW)}><Meter value={o?.pGold ?? 0} baseline={base?.pGold} tone="gold" label="right" bar="sm" delta={base && <Delta value={o?.pGold ?? 0} base={base.pGold} short />} /></Td>
                <Td align="right" priority={2} className={BAR}><Meter value={o?.pMedal ?? 0} baseline={base?.pMedal} label="right" delta={base && <Delta value={o?.pMedal ?? 0} base={base.pMedal} short />} /></Td>
                <Td align="right" muted={stale} className={WIDE} title={stale ? 'Baseline value: expected finish is recomputed only for picked teams' : undefined}>
                  {formatRank(exp ?? b?.expRank ?? null)}
                  {base?.expRank != null && exp !== null && <Delta value={exp} base={base.expRank} unit="places" better="down" digits={1} short className="flex justify-end" />}
                </Td>
                <Td priority={2}><Icon name="chevron-right" size={16} className={selected ? 'rotate-90 text-ink' : 'text-ink-3'} /></Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
      {searching && rows.length === 0 && <EmptyState className="border-t-0" level={3} title="No team with that name" />}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 type-small text-ink-2">
        <span role="status">
          {searching ? `${rows.length} match${rows.length === 1 ? '' : 'es'}` : `Showing ${visible.length} of ${rows.length} teams`}
          {isScenario && '. Ticks show the baseline'}
        </span>
        {!searching && rows.length > PAGE && <Button size="sm" onClick={() => setShowAll(v => !v)}>{showAll ? `Show top ${PAGE}` : `Show all ${rows.length}`}</Button>}
      </div>
    </div>
  );
}
