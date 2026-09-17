'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import EligibilityPips from './EligibilityPips';
import FormPips from './FormPips';
import Flag from '@/components/ui/Flag';
import { playerHref } from '@/lib/olympiad/config';
import { eligibilityLabel } from './EligibilityPips';
import { displayName, formatScore } from '@/lib/olympiad/tpr';
import type { BoardRace, OlympiadEvent, PlayerRaceRow } from '@/lib/olympiad/types';

interface BoardLeaderboardProps {
  event: OlympiadEvent;
  race: BoardRace;
  rows: PlayerRaceRow[];
  /** Total rows on the board before filtering, for the footer */
  total: number;
}

const PAGE = 50;
const MEDAL = ['bg-medal-gold text-chess-dark', 'bg-medal-silver text-chess-dark', 'bg-medal-bronze text-white'];

export default function BoardLeaderboard({ event, race, rows, total }: BoardLeaderboardProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, PAGE);

  if (rows.length === 0) {
    return <p className="px-4 sm:px-6 py-8 text-sm text-[var(--text-muted)] text-center">No players match these filters.</p>;
  }

  return (
    <>
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-y border-[var(--border)] bg-[var(--bg-surface-2)]/60">
            <th scope="col" className="w-9 sm:w-11 px-1.5 sm:px-3 h-10 text-right font-semibold">#</th>
            <th scope="col" className="px-1.5 sm:px-3 h-10 text-left font-semibold">Player</th>
            <th scope="col" className="w-14 sm:w-16 px-1.5 sm:px-3 h-10 text-right font-semibold" title="Tournament performance rating">TPR</th>
            <th scope="col" className="w-12 sm:w-16 px-1.5 sm:px-3 h-10 text-right font-semibold">Score</th>
            <th scope="col" className="hidden sm:table-cell w-[9.5rem] px-3 h-10 text-left font-semibold" title="Result by round">Form</th>
            <th scope="col" className="hidden sm:table-cell w-24 md:w-32 px-3 h-10 text-left font-semibold" title="Eight games needed for a medal">8 games</th>
            <th scope="col" className="hidden lg:table-cell w-16 px-3 h-10 text-right font-semibold" title="Average opponent rating">Avg opp</th>
            <th scope="col" className="w-7" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {visible.map(r => {
            const href = playerHref(event, r.fideId);
            const medal = r.rank !== null && r.rank <= 3 ? MEDAL[r.rank - 1] : null;
            return (
              <tr
                key={r.fideId}
                className="group cursor-pointer border-b border-[var(--border)]/60 hover:bg-[var(--bg-surface-2)]/60 transition-colors"
                onClick={() => router.push(href)}
                onMouseEnter={() => router.prefetch(href)}
              >
                <td className="px-1.5 sm:px-3 py-2 text-right tabular-nums">
                  {medal ? (
                    <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-[11px] font-bold ${medal}`}>{r.rank}</span>
                  ) : (
                    <span className="text-[var(--text-muted)]">{r.rank ?? '–'}</span>
                  )}
                </td>
                <td className="px-1.5 sm:px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Flag code={r.fedCode} size="sm" title={r.teamName} className="!ring-0 shrink-0" aria-hidden />
                    <span className="min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                      <Link
                        href={href}
                        onClick={e => e.stopPropagation()}
                        className="font-medium truncate text-[var(--text-primary)] group-hover:text-gold-ink underline-offset-4 decoration-dotted decoration-[var(--text-muted)] group-hover:underline outline-none focus-visible:ring-2 focus-visible:ring-chess-gold rounded-sm"
                      >
                        {r.title && <span className="text-gold-ink text-[11px] font-semibold mr-1">{r.title}</span>}
                        {displayName(r.name)}
                      </Link>
                      <span className="text-[11px] text-[var(--text-muted)] truncate">
                        {r.fedCode}<span className="hidden md:inline"> · {r.rating || 'unrated'}</span>
                        <span className="sm:hidden"> · {eligibilityLabel(r.games, r.needed, r.canReach).toLowerCase()}</span>
                      </span>
                    </span>
                  </div>
                </td>
                <td className={`px-1.5 sm:px-3 py-2 text-right font-mono tabular-nums font-semibold ${r.rank === 1 ? 'text-gold-ink' : 'text-[var(--text-primary)]'}`}>
                  {r.tpr ?? '–'}
                  {r.tpr !== null && r.rating > 0 && (
                    <span className={`hidden md:block text-[11px] font-sans font-normal ${r.tpr >= r.rating ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {r.tpr >= r.rating ? '+' : '−'}{Math.abs(r.tpr - r.rating)}
                    </span>
                  )}
                </td>
                <td className="px-1.5 sm:px-3 py-2 text-right tabular-nums text-[var(--text-secondary)]">{r.games ? formatScore(r.score, r.games) : '–'}</td>
                <td className="hidden sm:table-cell px-3 py-2"><FormPips form={r.form} lastRound={race.lastRound} /></td>
                <td className="hidden sm:table-cell px-3 py-2">
                  <span className="md:hidden"><EligibilityPips games={r.games} needed={r.needed} canReach={r.canReach} roundsLeft={race.roundsLeft} compact /></span>
                  <span className="hidden md:inline-flex"><EligibilityPips games={r.games} needed={r.needed} canReach={r.canReach} roundsLeft={race.roundsLeft} /></span>
                </td>
                <td className="hidden lg:table-cell px-3 py-2 text-right tabular-nums text-[var(--text-secondary)]">{r.avgOpp ?? '–'}</td>
                <td className="pr-2 text-right" aria-hidden>
                  <svg className="inline w-4 h-4 text-[var(--text-muted)] group-hover:text-gold-ink group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 text-xs text-[var(--text-muted)]">
        <span>{rows.length === total ? `${total} players` : `${rows.length} of ${total} players`}</span>
        {rows.length > PAGE && (
          <button type="button" onClick={() => setShowAll(v => !v)} className="h-10 px-3 rounded-md font-medium text-gold-ink hover:bg-chess-gold/10">
            {showAll ? 'Show top 50' : `Show all ${rows.length}`}
          </button>
        )}
      </div>
    </>
  );
}
