import Link from 'next/link';
import { notFound } from 'next/navigation';

import PlayerGames from './PlayerGames';
import TprTrend from './TprTrend';
import EligibilityPips, { eligibilityLabel } from '@/components/olympiad/boards/EligibilityPips';
import FormPips from '@/components/olympiad/boards/FormPips';
import CopyLink from '@/components/ui/CopyLink';
import Flag from '@/components/ui/Flag';
import { OLYMPIAD_EVENTS, boardLabel, boardsHref, eventHref, playerHref } from '@/lib/olympiad/config';
import { ordinal } from '@/lib/olympiad/odds';
import { getOlympiadBoardRace, getOlympiadPlayerGames } from '@/lib/olympiad/queries';
import { MIN_GAMES_FOR_PRIZE, displayName, formatScore } from '@/lib/olympiad/tpr';
import type { BoardRace, OlympiadEvent, PlayerRaceRow } from '@/lib/olympiad/types';

export function findPlayer(race: BoardRace, fideId: number): PlayerRaceRow | null {
  for (const rows of race.boards) {
    const hit = rows.find(r => r.fideId === fideId);
    if (hit) return hit;
  }
  return null;
}

export function playerSummary(p: PlayerRaceRow, race: BoardRace): string {
  const label = boardLabel(p.board).toLowerCase();
  if (p.tpr === null) return `${displayName(p.name)} has not played yet on ${label}.`;
  const rank = p.rank !== null ? `${ordinal(p.rank)} of ${race.ranked[p.board - 1]} on ${label}` : label;
  return `TPR ${p.tpr} after ${p.games} ${p.games === 1 ? 'game' : 'games'} (${formatScore(p.score, p.games)}), ${rank}. ${eligibilityLabel(p.games, p.needed, p.canReach)} for the ${MIN_GAMES_FOR_PRIZE}-game minimum.`;
}

const MEDAL = ['bg-medal-gold text-chess-dark', 'bg-medal-silver text-chess-dark', 'bg-medal-bronze text-white'];

export default async function PlayerPage({ event, fideId }: { event: OlympiadEvent; fideId: number }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const race = await getOlympiadBoardRace(event);
  const player = findPlayer(race, fideId);
  if (!player) notFound();
  const games = await getOlympiadPlayerGames(event, fideId);
  const boardRows = race.boards[player.board - 1];
  const idx = boardRows.findIndex(r => r.fideId === fideId);
  const prev = idx > 0 ? boardRows[idx - 1] : null;
  const next = idx >= 0 && idx < boardRows.length - 1 && boardRows[idx + 1].tpr !== null ? boardRows[idx + 1] : null;
  const name = displayName(player.name);
  const delta = player.tpr !== null && player.rating > 0 ? player.tpr - player.rating : null;
  const wins = player.form.filter(f => f.score === 1).length;
  const draws = player.form.filter(f => f.score === 0.5).length;
  const losses = player.form.filter(f => f.score === 0).length;
  const medal = player.rank !== null && player.rank <= 3 ? MEDAL[player.rank - 1] : null;
  const ctrl = 'w-10 h-10 inline-flex items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)] transition-colors';

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[var(--text-muted)] min-w-0">
          <Link href="/simulations" className="hover:text-gold-ink shrink-0">Simulations</Link>
          <span>/</span>
          <Link href={eventHref(event)} className="hover:text-gold-ink truncate">{cfg.shortTitle}</Link>
          <span>/</span>
          <Link href={`${boardsHref(event)}?board=${player.board}`} className="hover:text-gold-ink shrink-0">Board prizes</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] truncate">{name}</span>
        </nav>

        <header className="surface-card overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-surface-2)]/60">
            <Flag code={player.fedCode} size="xl" title={player.teamName} aria-hidden />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-heading text-[var(--text-primary)] leading-tight truncate">
                {player.title && <span className="text-gold-ink text-base sm:text-lg font-semibold mr-1.5">{player.title}</span>}{player.title ? ' ' : ''}
                {name}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                <Link href={`${eventHref(event)}?team=${player.teamId}`} className="hover:text-gold-ink font-medium">{player.teamName}</Link>
                <span className="text-[var(--text-muted)]">·</span>
                <span>{boardLabel(player.board)}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="tabular-nums">{player.rating ? `rating ${player.rating}` : 'unrated'}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <CopyLink className="hidden sm:inline-flex" />
              {prev ? <Link href={playerHref(event, prev.fideId)} className={ctrl} aria-label={`Previous on ${boardLabel(player.board)}: ${displayName(prev.name)}`} title={displayName(prev.name)}>‹</Link> : <span className={`${ctrl} opacity-30`} aria-hidden>‹</span>}
              {next ? <Link href={playerHref(event, next.fideId)} className={ctrl} aria-label={`Next on ${boardLabel(player.board)}: ${displayName(next.name)}`} title={displayName(next.name)}>›</Link> : <span className={`${ctrl} opacity-30`} aria-hidden>›</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4">
            <Tile label="Performance" hint="Tournament performance rating">
              <span className={`font-mono text-2xl sm:text-3xl font-semibold ${player.rank === 1 ? 'text-gold-ink' : 'text-[var(--text-primary)]'}`}>{player.tpr ?? '–'}</span>
              {delta !== null && <span className={`block text-xs ${delta >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>{delta >= 0 ? '+' : '−'}{Math.abs(delta)} vs rating</span>}
            </Tile>
            <Tile label={boardLabel(player.board)} hint="Rank on this board among players with a game">
              <span className="inline-flex items-center gap-2">
                {medal && <span className={`w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center ${medal}`}>{player.rank}</span>}
                <span className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">{player.rank !== null ? ordinal(player.rank) : '–'}</span>
              </span>
              <span className="block text-xs text-[var(--text-muted)]">of {race.ranked[player.board - 1]} ranked</span>
            </Tile>
            <Tile label="Score">
              <span className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tabular-nums">{player.games ? formatScore(player.score, player.games) : '–'}</span>
              <span className="block text-xs text-[var(--text-muted)]">{wins}W {draws}D {losses}L{player.avgOpp ? ` · avg opp ${player.avgOpp}` : ''}</span>
            </Tile>
            <Tile label="Eligibility" hint={`${MIN_GAMES_FOR_PRIZE} games needed for a board medal`}>
              <span className={`text-lg sm:text-xl font-semibold ${player.eligible ? 'text-emerald-500' : player.canReach ? 'text-[var(--text-primary)]' : 'text-rose-400'}`}>{eligibilityLabel(player.games, player.needed, player.canReach)}</span>
              <span className="block mt-1"><EligibilityPips games={player.games} needed={player.needed} canReach={player.canReach} roundsLeft={race.roundsLeft} compact /></span>
              <span className="block text-xs text-[var(--text-muted)]">{race.roundsLeft} {race.roundsLeft === 1 ? 'round' : 'rounds'} left</span>
            </Tile>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <section className="surface-card p-4 sm:p-6 min-w-0" aria-labelledby="games-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h2 id="games-heading" className="text-xl font-heading text-[var(--text-primary)]">Games</h2>
              <FormPips form={player.form} lastRound={race.lastRound} size="md" />
            </div>
            <PlayerGames event={event} player={player} games={games} lastRound={race.lastRound} knownFideIds={race.boards.flat().map(r => r.fideId)} />
          </section>

          <aside className="space-y-6 min-w-0">
            <section className="surface-card p-4 sm:p-6 min-w-0 overflow-hidden" aria-labelledby="trend-heading">
              <h2 id="trend-heading" className="text-xl font-heading text-[var(--text-primary)]">Round by round</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-2">Performance rating after each round and rank on {boardLabel(player.board).toLowerCase()}</p>
              {player.tpr !== null ? (
                <TprTrend tprByRound={player.tprByRound} rankByRound={player.rankByRound} rating={player.rating} />
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No games yet.</p>
              )}
            </section>
            <section className="surface-card p-4 sm:p-6" aria-labelledby="board-heading">
              <h2 id="board-heading" className="text-xl font-heading text-[var(--text-primary)]">{boardLabel(player.board)} top 5</h2>
              <ol className="mt-2 space-y-1.5 text-sm">
                {boardRows.slice(0, 5).map(r => (
                  <li key={r.fideId} className={`flex items-center gap-2 ${r.fideId === fideId ? 'text-gold-ink font-semibold' : 'text-[var(--text-secondary)]'}`}>
                    <span className="w-5 text-right tabular-nums text-[var(--text-muted)]">{r.rank}</span>
                    <Flag code={r.fedCode} size="xs" className="!ring-0" aria-hidden />
                    <Link href={playerHref(event, r.fideId)} className="truncate flex-1 hover:text-gold-ink">{displayName(r.name)}</Link>
                    <span className="font-mono tabular-nums">{r.tpr}</span>
                  </li>
                ))}
                {idx >= 5 && (
                  <li className="flex items-center gap-2 text-gold-ink font-semibold border-t border-[var(--border)] pt-1.5 mt-1.5">
                    <span className="w-5 text-right tabular-nums">{player.rank}</span>
                    <Flag code={player.fedCode} size="xs" className="!ring-0" aria-hidden />
                    <span className="truncate flex-1">{name}</span>
                    <span className="font-mono tabular-nums">{player.tpr}</span>
                  </li>
                )}
              </ol>
              <Link href={`${boardsHref(event)}?board=${player.board}`} className="inline-flex items-center h-10 mt-2 text-sm text-gold-ink hover:text-chess-gold-light">Full {boardLabel(player.board).toLowerCase()} race →</Link>
            </section>
          </aside>
        </div>

        <p className="text-xs text-[var(--text-muted)] max-w-3xl">
          Performance rating = average opponent rating + FIDE’s bonus for the percentage score. Board medals go to the highest TPR with at least {MIN_GAMES_FOR_PRIZE} games; ties go to the player with more games. Ratings and results from the official broadcast.
        </p>
      </div>
    </main>
  );
}

function Tile({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[var(--bg-surface-2)]/60 border border-[var(--border)] px-3 py-2.5 min-w-0" title={hint}>
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{label}</div>
      {children}
    </div>
  );
}
