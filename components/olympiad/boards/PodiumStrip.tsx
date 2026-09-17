'use client';

import Flag from '@/components/ui/Flag';
import { BOARD_LABELS } from '@/lib/olympiad/config';
import { displayName, formatScore } from '@/lib/olympiad/tpr';
import type { BoardRaceLite as BoardRace, BoardRaceRowLite as PlayerRaceRow } from '@/lib/olympiad/types';

interface PodiumStripProps {
  race: BoardRace;
  selected: number;
  onSelect: (board: number) => void;
}

const MEDAL = ['bg-medal-gold text-chess-dark', 'bg-medal-silver text-chess-dark', 'bg-medal-bronze text-white'];

function Mover({ row }: { row: PlayerRaceRow }) {
  if (row.rank === null || row.prevRank === null || row.prevRank === row.rank) return null;
  const up = row.prevRank > row.rank;
  return (
    <span className={`text-[10px] tabular-nums font-semibold ${up ? 'text-emerald-500' : 'text-rose-400'}`} title={`Ranked ${row.prevRank} after the previous round`}>
      {up ? '▲' : '▼'}{Math.abs(row.prevRank - row.rank)}
    </span>
  );
}

/** Five cards, one per prize board, each showing today's gold / silver / bronze by performance rating. */
export default function PodiumStrip({ race, selected, onSelect }: PodiumStripProps) {
  return (
    <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-5 gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none pb-1">
      {BOARD_LABELS.map((label, i) => {
        const board = i + 1;
        const rows = race.boards[i].slice(0, 3);
        const active = selected === board;
        const leader = rows[0];
        const newLeader = leader && leader.prevRank !== null && leader.prevRank !== 1;
        return (
          <button
            key={board}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(board)}
            className={`snap-center shrink-0 w-[78vw] sm:w-auto text-left rounded-xl border p-3 transition-all outline-none focus-visible:ring-2 focus-visible:ring-chess-gold ${
              active
                ? 'border-chess-gold/60 bg-chess-gold/[0.06] shadow-gold'
                : 'border-[var(--border)] bg-[var(--bg-surface-1)] hover:border-chess-gold/40 sm:opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] uppercase tracking-wider font-semibold ${active ? 'text-gold-ink' : 'text-[var(--text-muted)]'}`}>{label}</span>
              {newLeader ? (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gold-ink">New leader</span>
              ) : (
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{race.ranked[i]} ranked</span>
              )}
            </div>
            <ol className="space-y-1.5">
              {[0, 1, 2].map(k => {
                const row = rows[k];
                return (
                  <li key={k} className="flex items-center gap-2 min-w-0">
                    <span className={`w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 ${MEDAL[k]}`} aria-hidden>{k + 1}</span>
                    {row ? (
                      <>
                        <Flag code={row.fedCode} size="xs" className="!ring-0 shrink-0" aria-hidden />
                        <span className={`truncate text-sm ${k === 0 ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`} title={`${displayName(row.name)} (${row.fedCode}) · ${formatScore(row.score, row.games)}`}>
                          {displayName(row.name)}
                        </span>
                        <Mover row={row} />
                        <span className={`ml-auto font-mono text-sm tabular-nums shrink-0 ${k === 0 ? 'text-gold-ink font-semibold' : 'text-[var(--text-secondary)]'}`}>{row.tpr}</span>
                      </>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">—</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </button>
        );
      })}
    </div>
  );
}
