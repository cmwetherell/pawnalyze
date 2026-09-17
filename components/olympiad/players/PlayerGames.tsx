'use client';

import Link from 'next/link';
import GameViewer from '@/components/chess/GameViewer';
import Flag from '@/components/ui/Flag';
import { setHash, useHash } from '@/hooks/useUrlParam';
import { eventHref, playerHref } from '@/lib/olympiad/config';
import { displayName } from '@/lib/olympiad/tpr';
import type { FormEntry, OlympiadEvent, PlayerGame, PlayerRaceRow } from '@/lib/olympiad/types';

interface PlayerGamesProps {
  event: OlympiadEvent;
  player: PlayerRaceRow;
  games: PlayerGame[];
  /** Rounds to show (1..lastRound); rounds without a game are "rested" */
  lastRound: number;
  /** Lets an opponent link to their own profile when they are in the race */
  knownFideIds: number[];
}

const RESULT_STYLE = { 1: 'bg-emerald-500/15 text-emerald-500', 0.5: 'bg-[var(--bg-surface-3)] text-[var(--text-secondary)]', 0: 'bg-rose-500/15 text-rose-400' } as const;
const RESULT_WORD = { 1: 'Win', 0.5: 'Draw', 0: 'Loss' } as const;

export default function PlayerGames({ event, player, games, lastRound, knownFideIds }: PlayerGamesProps) {
  // The open replay lives in the hash (#r5) so a specific game can be shared.
  const hash = useHash();
  const open = /^r\d+$/.test(hash) ? Number(hash.slice(1)) : null;
  const setOpen = (r: number | null) => setHash(r === null ? '' : `r${r}`);
  const known = new Set(knownFideIds);
  const byRound = new Map<number, { form: FormEntry; game: PlayerGame | undefined }>();
  for (const f of player.form) byRound.set(f.round, { form: f, game: games.find(g => g.round === f.round) });
  const rounds = Array.from({ length: Math.max(lastRound, player.form.length ? Math.max(...player.form.map(f => f.round)) : 0) }, (_, i) => i + 1);

  return (
    <ol className="space-y-2">
      {rounds.map(r => {
        const entry = byRound.get(r);
        if (!entry) {
          return (
            <li key={r} className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--border)] px-3 h-12 text-sm text-[var(--text-muted)]">
              <span className="w-8 tabular-nums">R{r}</span>
              <span>Rested</span>
            </li>
          );
        }
        const { form, game } = entry;
        const isOpen = open === r;
        const oppHref = form.oppFideId !== null && known.has(form.oppFideId) ? playerHref(event, form.oppFideId) : null;
        return (
          <li key={r} id={`r${r}`} className={`rounded-lg border transition-colors min-w-0 scroll-mt-24 ${isOpen ? 'border-chess-gold/40 bg-[var(--bg-surface-1)]' : 'border-[var(--border)]'}`}>
            <div className="flex items-center gap-2 sm:gap-3 px-3 min-h-12 py-1.5 text-sm">
              <span className="w-8 tabular-nums text-[var(--text-muted)] shrink-0">R{r}</span>
              <span
                className={`w-3.5 h-3.5 rounded-sm border shrink-0 ${form.colour === 'w' ? 'bg-[#f0f0f0] border-[#999]' : 'bg-[#222] border-[#555]'}`}
                title={form.colour === 'w' ? 'Played white' : 'Played black'}
                aria-label={form.colour === 'w' ? 'white' : 'black'}
              />
              {form.oppFedCode && <Flag code={form.oppFedCode} size="xs" className="!ring-0 shrink-0" aria-hidden />}
              <span className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                {oppHref ? (
                  <Link href={oppHref} className="truncate font-medium text-[var(--text-primary)] hover:text-gold-ink underline-offset-4 decoration-dotted hover:underline">{displayName(form.oppName)}</Link>
                ) : (
                  <span className="truncate font-medium text-[var(--text-primary)]">{displayName(form.oppName)}</span>
                )}
                <span className="text-[11px] text-[var(--text-muted)] truncate">
                  {form.oppRating || 'unrated'}
                  {form.oppTeamId !== null && form.oppFedCode && (
                    <> · <Link href={`${eventHref(event)}?team=${form.oppTeamId}`} className="hover:text-gold-ink">{form.oppFedCode}</Link></>
                  )}
                </span>
              </span>
              <span className={`shrink-0 inline-flex items-center h-7 px-2 rounded-md text-xs font-semibold ${RESULT_STYLE[form.score]}`}>{RESULT_WORD[form.score]}</span>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r)}
                aria-expanded={isOpen}
                disabled={!game?.moves}
                className="shrink-0 h-10 px-2.5 rounded-md text-xs font-medium text-gold-ink hover:bg-chess-gold/10 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                {game?.moves ? (isOpen ? 'Hide' : 'Replay') : 'No moves'}
              </button>
            </div>
            {isOpen && game && (
              <div className="border-t border-[var(--border)] px-3 py-3">
                <GameViewer
                  moves={game.moves}
                  white={{ name: form.colour === 'w' ? displayName(player.name) : displayName(form.oppName), rating: form.colour === 'w' ? player.rating : form.oppRating }}
                  black={{ name: form.colour === 'b' ? displayName(player.name) : displayName(form.oppName), rating: form.colour === 'b' ? player.rating : form.oppRating }}
                  result={game.result}
                  orientation={form.colour}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
