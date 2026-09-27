'use client';

import Image from 'next/image';
import { useSyncExternalStore } from 'react';

import { PhotoCaption } from '@/components/ui/PhotoCredit';
import { CLASSICAL_SCHEDULE, EVENT, SCHEDULE_DAYS, type DayKind } from '@/lib/wcc/config';
import { WCC_PHOTOS } from '@/lib/wcc/photos';
import type { WccGame } from '@/lib/wcc/types';
import type { Players } from './ui';

const noop = () => () => {};
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

const KIND_STYLE: Record<DayKind, string> = {
  game: 'bg-[var(--bg-surface-1)] border-[var(--border)]',
  rest: 'bg-transparent border-dashed border-[var(--border)]',
  ceremony: 'bg-chess-gold/[0.08] border-chess-gold/40',
  tiebreak: 'bg-chess-gold/[0.08] border-chess-gold/40',
  free: 'bg-transparent border-dashed border-[var(--border)]',
  departure: 'bg-transparent border-dashed border-[var(--border)]',
};

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleCalendar({ games, players }: { games: WccGame[]; players: Players }) {
  const mounted = useMounted();
  const byNo = new Map(games.map(g => [g.gameNo, g]));
  const first = new Date(`${SCHEDULE_DAYS[0].date}T12:00:00Z`);
  const lead = (first.getUTCDay() + 6) % 7; // Monday-first offset
  const cells = [...Array.from({ length: lead }, () => null), ...SCHEDULE_DAYS];
  while (cells.length % 7 !== 0) cells.push(null);
  const g1 = CLASSICAL_SCHEDULE[0].startsAt;
  const tz = mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : null;
  const localStart = mounted ? new Date(g1).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : null;
  const today = mounted ? new Date().toISOString().slice(0, 10) : null;
  const venue = WCC_PHOTOS.venue;

  return (
    <section id="schedule" aria-labelledby="schedule-title" className="surface-card overflow-hidden scroll-mt-32">
      <div className="relative h-44 sm:h-60">
        <Image src={venue.src} alt={venue.alt} fill sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" style={{ objectPosition: venue.focal }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface-1)] via-[var(--bg-surface-1)]/30 to-transparent" />
        <p className="absolute right-3 top-2 text-[10px] text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
          <PhotoCaption photo={venue} />
        </p>
      </div>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-14 relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1">{EVENT.venue} · {EVENT.venueArea}</p>
        <h2 id="schedule-title" className="font-heading text-xl sm:text-2xl text-[var(--text-primary)] leading-tight">Schedule</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-2xl">
          Games start at <strong className="text-[var(--text-primary)]">15:00 CET</strong>
          {localStart && tz !== 'Europe/Zurich' && tz !== 'Europe/Paris' && tz !== 'Europe/Berlin'
            ? <> — that’s <strong className="text-[var(--text-primary)]">{localStart}</strong> where you are.</>
            : '.'}
          {' '}Opening ceremony at the {EVENT.ceremonyVenue} on 22 Nov, where the colours are drawn. {EVENT.drawRule}.
        </p>
        <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-1.5" role="grid" aria-label="Match calendar">
          {DOW.map(d => <div key={d} role="columnheader" className="text-center text-[10px] uppercase tracking-wider text-[var(--text-muted)] pb-1">{d}</div>)}
          {cells.map((c, i) => {
            if (!c) return <div key={`e${i}`} role="gridcell" aria-hidden />;
            const day = Number(c.date.slice(8, 10));
            const month = c.date.slice(5, 7) === '11' ? 'Nov' : 'Dec';
            const game = c.gameNo ? byNo.get(c.gameNo) : undefined;
            const done = game?.status === 'final';
            const live = game?.status === 'live';
            const notPlayed = game?.status === 'not_played';
            const isToday = today === c.date;
            const short = c.kind === 'game' ? `G${c.gameNo}` : c.kind === 'rest' ? 'Rest' : c.kind === 'ceremony' ? 'Opening' : c.kind === 'tiebreak' ? 'TB' : c.kind === 'departure' ? 'End' : '—';
            return (
              <div
                key={c.date}
                role="gridcell"
                aria-label={`${day} ${month}: ${c.label}${done ? ', played' : ''}${live ? ', live now' : ''}`}
                className={`relative rounded-lg border p-1 sm:p-2 min-h-[52px] sm:min-h-[72px] flex flex-col ${KIND_STYLE[c.kind]} ${isToday ? 'ring-2 ring-chess-gold' : ''} ${notPlayed ? 'opacity-50' : ''}`}
              >
                <span className="text-[10px] sm:text-xs tabular-nums text-[var(--text-muted)]">{day}{day === 22 || day === 1 ? <span className="hidden sm:inline"> {month}</span> : null}</span>
                <span className={`mt-auto text-[10px] sm:text-xs font-semibold leading-tight ${c.kind === 'game' ? 'text-[var(--text-primary)]' : c.kind === 'ceremony' || c.kind === 'tiebreak' ? 'text-gold-ink' : 'text-[var(--text-muted)]'}`}>
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{c.kind === 'game' ? `Game ${c.gameNo}` : c.label}</span>
                </span>
                {live && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-live" aria-hidden />}
                {done && game && (
                  <span className="absolute top-1 right-1 text-[9px] font-bold text-[var(--text-secondary)]" aria-hidden>
                    {game.result === '1/2-1/2' ? '½' : game.result && game.whitePlayerId
                      ? players[(game.result === '1-0') === (game.whitePlayerId === 1) ? 1 : 2].shortName[0]
                      : '✓'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-[var(--text-muted)]">
          Tiebreaks (only at 7–7) and the closing ceremony are on 12 Dec. Games after the match is decided are not played.
          {' '}<a href={EVENT.regulationsUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold-ink">FIDE regulations (PDF)</a>
        </p>
      </div>
    </section>
  );
}
