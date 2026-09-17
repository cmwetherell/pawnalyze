import Link from 'next/link';

import Flag from '@/components/ui/Flag';
import { BOARD_LABELS, boardsHref } from '@/lib/olympiad/config';
import { getOlympiadBoardRace } from '@/lib/olympiad/queries';
import { displayName } from '@/lib/olympiad/tpr';
import type { OlympiadEvent } from '@/lib/olympiad/types';

async function LeaderRow({ event }: { event: OlympiadEvent }) {
  const race = await getOlympiadBoardRace(event);
  if (race.lastRound === 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <Link href={boardsHref(event)} className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] hover:text-gold-ink shrink-0 sm:w-16">
        {event === 'open' ? 'Open' : 'Women'}
      </Link>
      <ol className="grid grid-cols-5 gap-1.5 sm:gap-2 flex-1 min-w-0">
        {race.boards.map((rows, i) => {
          const r = rows[0];
          return (
            <li key={i} className="min-w-0">
              {r ? (
                <Link href={boardsHref(event) + (i ? `?board=${i + 1}` : '')} className="group block rounded-lg border border-[var(--border)] bg-[var(--bg-surface-2)]/50 hover:border-chess-gold/40 px-2 py-1.5 min-w-0" title={`${BOARD_LABELS[i]}: ${displayName(r.name)} (${r.fedCode}), TPR ${r.tpr}`}>
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] truncate">
                    <span className="md:hidden">{i < 4 ? `B${i + 1}` : 'Res'}</span>
                    <span className="hidden md:inline">{BOARD_LABELS[i]}</span>
                  </span>
                  <span className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <Flag code={r.fedCode} size="xs" className="!ring-0 shrink-0" aria-hidden />
                    <span className="text-xs font-medium text-[var(--text-primary)] truncate group-hover:text-gold-ink hidden sm:inline">{displayName(r.name).split(' ').pop()}</span>
                    <span className="text-xs font-mono tabular-nums text-gold-ink ml-auto shrink-0">{r.tpr}</span>
                  </span>
                </Link>
              ) : (
                <span className="block rounded-lg border border-dashed border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-muted)]">—</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Home-page strip: the current performance-rating leader on each of the five boards, per event. */
export default async function OlympiadBoardLeaders() {
  const [open, women] = await Promise.all([getOlympiadBoardRace('open'), getOlympiadBoardRace('women')]);
  if (open.lastRound === 0 && women.lastRound === 0) return null;
  const through = Math.max(open.lastRound, women.lastRound);
  return (
    <div className="surface-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Board prize race · after round {through}</p>
          <h3 className="font-heading text-lg text-[var(--text-primary)]">Who leads each board?</h3>
        </div>
        <Link href={boardsHref('open')} className="text-sm text-gold-ink hover:translate-x-1 transition-transform shrink-0">All boards &rarr;</Link>
      </div>
      <div className="space-y-3">
        <LeaderRow event="open" />
        <LeaderRow event="women" />
      </div>
      <p className="mt-3 text-[11px] text-[var(--text-muted)]">Individual medals go to the best performance rating on each board with at least 8 games; early leaders shift quickly.</p>
    </div>
  );
}
