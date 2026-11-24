'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';

import { CLASSICAL_SCHEDULE, OPENING_CEREMONY, TIEBREAK_START, WCC_HREF } from '@/lib/wcc/config';
import { fmtPoints, type MatchState } from '@/lib/wcc/status';
import type { Players } from './ui';

function subscribeSecond(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}
const secondSnapshot = () => Math.floor(Date.now() / 1000) * 1000;

/** Current time, ticking each second on the client; null during SSR/prerender. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribeSecond, secondSnapshot, () => null);
}

export function localTime(iso: string, opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }): string {
  return new Date(iso).toLocaleTimeString(undefined, opts);
}
export function localDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function Countdown({ to, now }: { to: string; now: number }) {
  const ms = Math.max(0, new Date(to).getTime() - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const parts = [
    { v: d, l: d === 1 ? 'day' : 'days' },
    { v: h, l: 'hrs' },
    { v: m, l: 'min' },
    { v: s, l: 'sec' },
  ];
  return (
    <div className="flex items-end gap-1.5 sm:gap-2" role="timer" aria-label={`${d} days ${h} hours ${m} minutes`}>
      {parts.map((p, i) => (
        <div key={p.l} className="flex items-end gap-1.5 sm:gap-2">
          {i > 0 && <span aria-hidden className="pb-3 text-[var(--text-muted)]">:</span>}
          <div className="text-center">
            <div className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)] leading-none min-w-[2ch]">
              {String(p.v).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{p.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveDot() {
  return <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-live" aria-hidden />;
}

/**
 * The match clock: countdown to game 1, the running score and the next game during the match.
 * All time-relative rendering happens here, on the client.
 */
export default function MatchStatus({ state, players }: { state: MatchState; players: Players }) {
  const now = useNow();
  const g1 = CLASSICAL_SCHEDULE[0].startsAt;
  const next = state.classical.find(g => g.status === 'scheduled' && g.startsAt && (now === null || new Date(g.startsAt).getTime() > now - 6 * 3_600_000));
  const started = state.lastFinal > 0 || state.anyLive || (now !== null && now >= new Date(g1).getTime());
  const level14 = state.lastFinal === 14 && state.score1 === state.score2 && !state.winner;

  const score = (
    <div className="flex items-center gap-3 font-heading text-3xl sm:text-4xl text-[var(--text-primary)]" aria-label={`Score: ${players[1].shortName} ${fmtPoints(state.score1)}, ${players[2].shortName} ${fmtPoints(state.score2)}`}>
      <span className="text-sm sm:text-base font-sans font-semibold text-[var(--text-secondary)]">{players[1].shortName}</span>
      <span>{fmtPoints(state.score1) || '0'}</span>
      <span className="text-[var(--text-muted)]">–</span>
      <span>{fmtPoints(state.score2) || '0'}</span>
      <span className="text-sm sm:text-base font-sans font-semibold text-[var(--text-secondary)]">{players[2].shortName}</span>
    </div>
  );

  if (!started) {
    const beforeDraw = now === null || now < new Date(`${OPENING_CEREMONY}T17:00:00Z`).getTime();
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Game 1 starts in</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {now === null ? 'Tue 24 Nov · 15:00 CET' : `${localDay(g1)} · ${localTime(g1, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}`}
            {beforeDraw && <> · colours drawn 22 Nov</>}
          </p>
        </div>
        {now === null ? <div className="h-[46px]" aria-hidden /> : <Countdown to={g1} now={now} />}
      </div>
    );
  }

  let line: React.ReactNode;
  if (state.live) {
    const label = state.live.stage === 'classical' ? `Game ${state.live.gameNo}` : `Tiebreak game ${state.live.stageGame}`;
    line = <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold"><LiveDot /> {label} is live</span>;
  } else if (level14) {
    line = <>Level at 7–7 · tiebreaks {now !== null ? `${localDay(TIEBREAK_START)}, ${localTime(TIEBREAK_START)}` : 'Sat 12 Dec'}</>;
  } else if (next?.startsAt) {
    const nextDay = now !== null ? localDay(next.startsAt) : '';
    const today = now !== null && new Date(next.startsAt).toDateString() === new Date(now).toDateString();
    line = now === null
      ? <>Next: game {next.gameNo}</>
      : <>{today ? 'Today' : `${nextDay}`}: game {next.gameNo} at {localTime(next.startsAt)}{!today && new Date(next.startsAt).getTime() - now > 30 * 3_600_000 ? ' · rest day' : ''}</>;
  } else {
    line = <>Awaiting results</>;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {state.lastFinal > 0 ? `Score after game ${state.lastFinal}` : 'Match score'}
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{line}</p>
        <Link href={`${WCC_HREF}/live`} className="inline-block mt-1 text-sm text-gold-ink hover:text-chess-gold-light underline decoration-chess-gold/30">
          Live board, evaluation and complexity
        </Link>
      </div>
      {score}
    </div>
  );
}

/** One-line countdown for teasers: "Game 1 in 57d 20h 07m". */
export function CompactCountdown({ to, label = 'Game 1 in' }: { to: string; label?: string }) {
  const now = useNow();
  if (now === null) return <span>{label} …</span>;
  const ms = Math.max(0, new Date(to).getTime() - now);
  if (ms === 0) return null;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return <span className="tabular-nums">{label} {d}d {String(h).padStart(2, '0')}h {String(m).padStart(2, '0')}m</span>;
}
