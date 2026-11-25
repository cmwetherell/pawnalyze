'use client';

import Link from 'next/link';

import { LiveDot } from '@/components/ui/LiveDot';
import { goldLine, hoverGround } from '@/components/ui/styles';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import type { ScheduleDay } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import type { WccGame } from '@/lib/wcc/types';

interface MatchCalendarProps {
  days: ScheduleDay[];
  games: WccGame[];
  players: Players;
  hrefFor: (gameNo: number) => string;
  className?: string;
}

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHORT: Record<ScheduleDay['kind'], string> = { game: '', rest: 'Rest', ceremony: 'Open', tiebreak: 'TB', departure: 'End', free: 'Free' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Month grid, Monday first. Game days link to the live page. */
export function MatchCalendar({ days, games, players, hrefFor, className }: MatchCalendarProps) {
  const now = useNow(60_000);
  if (days.length === 0) return null;
  const today = now === null ? null : new Date(now).toISOString().slice(0, 10);
  const byNo = new Map(games.filter(g => g.stage === 'classical').map(g => [g.gameNo, g]));
  const lead = (new Date(`${days[0].date}T12:00:00Z`).getUTCDay() + 6) % 7;
  const tail = (7 - ((lead + days.length) % 7)) % 7;
  const anyLive = games.some(g => g.status === 'live');
  const nextNo = anyLive ? undefined : days.find(d => d.gameNo !== undefined && (byNo.get(d.gameNo)?.status ?? 'scheduled') === 'scheduled')?.gameNo;
  return (
    <div className={className}>
      <div aria-hidden className="grid grid-cols-7 border-b border-control pb-2 type-small text-ink-3">{DOW.map(d => <span key={d}>{d}</span>)}</div>
      <ol className="grid grid-cols-7" aria-label="Match calendar">
        {Array.from({ length: lead }, (_, i) => <li key={`e${i}`} aria-hidden className="border-b border-line" />)}
        {days.map(c => {
          const day = Number(c.date.slice(8, 10));
          const month = MONTHS[Number(c.date.slice(5, 7)) - 1];
          const game = c.gameNo ? byNo.get(c.gameNo) : undefined;
          const winner = game?.result && game.result !== '1/2-1/2' && game.whitePlayerId ? ((game.result === '1-0') === (game.whitePlayerId === 1) ? 1 : 2) : null;
          const done = game?.status === 'final';
          const live = game?.status === 'live';
          const off = game?.status === 'not_played';
          const event = c.kind === 'ceremony' || c.kind === 'tiebreak';
          const next = c.gameNo !== undefined && c.gameNo === nextNo;
          const name = c.label;
          const outcome = done ? (game.result === '1/2-1/2' ? '½' : winner ? players[winner].shortName[0] : null) : null;
          const inner = (
            <>
              {done && <span aria-hidden className={cn('absolute -top-px left-2 right-1 h-[3px] sm:right-2', winner === 1 ? 'bg-p1' : winner === 2 ? 'bg-p2' : 'bg-draw')} />}
              {next && <span aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px -top-px border-2 border-ink" />}
              <span className="flex items-center justify-between gap-1">
                <span className={cn('whitespace-nowrap type-label tnum sm:type-small', c.date === today ? 'font-semibold text-ink' : 'text-ink-3')}>
                  {(day === 1 || c === days[0]) && `${month} `}{day}
                </span>
                {live && <LiveDot />}
                {outcome && <span aria-hidden className="type-label font-semibold text-ink">{outcome}</span>}
              </span>
              <span className={cn('mt-auto text-balance type-label sm:type-data', off ? 'text-ink-3' : c.kind === 'game' ? cn('font-medium text-ink group-hover/day:underline', goldLine) : event ? 'font-medium text-brand' : 'text-ink-3')}>
                <span className="whitespace-nowrap sm:hidden">{c.kind === 'game' ? `G${c.gameNo}` : SHORT[c.kind]}</span>
                <span className="hidden sm:inline">{c.kind === 'game' ? `Game ${c.gameNo}` : name}</span>
              </span>
            </>
          );
          // The ground and the outline stand outside the words: the cell starts a little left of its column.
          const cls = 'group/day relative -ml-2 mr-2 flex h-full min-h-14 flex-col gap-1 py-2 pl-2 pr-1 sm:min-h-24 sm:pr-2';
          const label = `${month} ${day}: ${name}${done ? `, played${outcome === '½' ? ', draw' : winner ? `, ${players[winner].shortName} won` : ''}` : ''}${live ? ', live now' : ''}${off ? ', not played' : ''}${next ? ', next game' : ''}`;
          return (
            <li key={c.date} aria-current={c.date === today ? 'date' : undefined} className="min-w-0 border-b border-line">
              {c.gameNo !== undefined
                ? <Link href={hrefFor(c.gameNo)} aria-label={label} className={cn(cls, 'transition-colors duration-in', hoverGround)}>{inner}</Link>
                : <div className={cls}>{inner}</div>}
            </li>
          );
        })}
        {Array.from({ length: tail }, (_, i) => <li key={`t${i}`} aria-hidden className="border-b border-line" />)}
      </ol>
    </div>
  );
}
