'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Delta } from '@/components/ui/Delta';
import { EmptyState } from '@/components/ui/EmptyState';
import { Flag } from '@/components/ui/Flag';
import { Icon } from '@/components/ui/Icon';
import { Medal } from '@/components/ui/Medal';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { playerHref } from '@/lib/olympiad/config';
import type { MedalPlace } from '@/lib/olympiad/medals';
import { displayName, formatScore } from '@/lib/olympiad/tpr';
import type { BoardRaceRowLite, BoardRaceSummary, OlympiadEvent } from '@/lib/olympiad/types';
import { EligibilityPips, eligibilityLabel } from './EligibilityPips';
import { FormPips } from './FormPips';

interface BoardLeaderboardProps {
  event: OlympiadEvent;
  race: BoardRaceSummary;
  label: string;
  rows: BoardRaceRowLite[];
  /** Gold, silver and bronze of the whole board, by FIDE id. */
  medals: Map<number, MedalPlace>;
  /** Rows on the board before filtering, for the footer. */
  total: number;
  onClearFilters: () => void;
}

const PAGE = 50;

export function BoardLeaderboard({ event, race, label, rows, medals, total, onClearFilters }: BoardLeaderboardProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  if (rows.length === 0) {
    return <EmptyState level={3} title="No players match these filters." action={<Button size="sm" icon="reset" onClick={onClearFilters}>Clear filters</Button>} />;
  }

  return (
    <>
      <Table label={label} stickyHead>
        <THead>
          <tr>
            <Th width="2.5rem" title="Rank by performance rating among everyone with a game">#</Th>
            <Th>Player</Th>
            <Th align="right" title="Tournament performance rating, and its difference from the player’s rating">TPR</Th>
            <Th align="right">Score</Th>
            <Th priority={2} title="Result by round" className="sm:pl-4">Form</Th>
            <Th priority={4} title="Eight games needed for a medal">8 games</Th>
            <Th align="right" priority={4} title="Average opponent rating">Avg opp</Th>
            <Th priority={2} width="1rem"><span className="sr-only">Profile</span></Th>
          </tr>
        </THead>
        <TBody>
          {(showAll ? rows : rows.slice(0, PAGE)).map(r => {
            const href = playerHref(event, r.fideId);
            const medal = medals.get(r.fideId);
            const eligibility = eligibilityLabel(r.games, r.needed, r.canReach);
            return (
              <Tr key={r.fideId} href={href} onPrefetch={() => router.prefetch(href)}>
                <Td muted>{medal ? <Medal rank={medal} /> : r.rank ?? '–'}</Td>
                <Td
                  header
                  lead={<Flag code={r.fedCode} size="sm" title={r.teamName} decorative />}
                  sub={<>{r.title && `${r.title}, `}{r.fedCode} {r.rating || 'unrated'}<span className="xl:hidden">, {r.needed === 0 ? 'eligible' : eligibility.toLowerCase()}</span></>}
                >
                  <Link href={href}>{displayName(r.name)}</Link>
                </Td>
                <Td align="right">
                  <span className="block font-medium">{r.tpr ?? '–'}</span>
                  {r.tpr !== null && r.rating > 0 && <Delta value={r.tpr} base={r.rating} unit="plain" quiet className="hidden md:inline-flex" />}
                </Td>
                <Td align="right">{r.games ? formatScore(r.score, r.games) : '–'}</Td>
                <Td priority={2} className="sm:pl-4"><FormPips form={r.form} lastRound={race.lastRound} className="flex-nowrap" /></Td>
                <Td priority={4}>
                  <EligibilityPips games={r.games} needed={r.needed} canReach={r.canReach} roundsLeft={race.roundsLeft} className="flex-nowrap" />
                  <span className="mt-1 block whitespace-nowrap type-label text-ink-3">{eligibility}</span>
                </Td>
                <Td align="right" priority={4} muted>{r.avgOpp ?? '–'}</Td>
                <Td priority={2}><Icon name="chevron-right" size={16} className="text-ink-3 transition-colors duration-in group-hover/tr:text-ink" /></Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
      <div className="mt-4 flex min-h-12 flex-wrap items-center justify-between gap-3 type-small text-ink-2 tnum">
        <span>{rows.length === total ? `${total} players` : `${rows.length} of ${total} players`}</span>
        {rows.length > PAGE && <Button size="sm" onClick={() => setShowAll(v => !v)}>{showAll ? `Show top ${PAGE}` : `Show all ${rows.length}`}</Button>}
      </div>
    </>
  );
}
