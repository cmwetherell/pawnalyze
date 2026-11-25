'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LiveDot } from '@/components/ui/LiveDot';
import { PickToggle, type PickOption } from '@/components/ui/PickToggle';
import { TextLink } from '@/components/ui/TextLink';
import { formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Players } from '@/lib/wcc/display';
import { WCC_PHOTOS } from '@/lib/wcc/photos';
import type { PickOutcome } from '@/lib/wcc/scenario';
import type { HalfPoints, Triplet } from '@/lib/wcc/types';
import { PieceDot } from './PieceDot';

export interface GameCellView {
  gameNo: number;
  dateLabel: string;
  whiteName: string | null;
  whiteAssumed: boolean;
  odds: Triplet;
  pPlayed: number;
  result: HalfPoints | null;
  live: boolean;
  next: boolean;
  unreachable: boolean;
  pick?: PickOutcome;
  swing: Record<PickOutcome, number> | null;
  /** /world-chess-championship-2026/live?game=N */
  href: string;
}

export interface GameSheetProps {
  games: GameCellView[];
  players: Players;
  locked: boolean;
  onPick(g: number, v: PickOutcome | null): void;
  onPreview?(p: number | null): void;
  className?: string;
}

/** Phones show this many games until asked. */
const FIRST = 7;

/** The fourteen games as a ruled sheet: 7 by 2 from 1024, one row a game below. Every game number opens the live page. */
export function GameSheet({ games, players, locked, onPick, onPreview, className }: GameSheetProps) {
  const listId = useId();
  const [more, setMore] = useState(false);
  const rest = games.slice(FIRST);
  const needed = rest.some(g => g.pick !== undefined || g.live || g.next || g.result !== null);
  const open = more || needed;
  return (
    <div className={className}>
      <ol id={listId} aria-label="Classical games" className="grid grid-cols-1 border-t border-control lg:grid-cols-7">
        {games.map((g, i) => (
          <GameCell
            key={g.gameNo} game={g} players={players} locked={locked} onPick={onPick} onPreview={onPreview}
            className={i >= FIRST && !open ? 'hidden lg:flex' : undefined}
          />
        ))}
      </ol>
      {rest.length > 0 && !needed && (
        <Button full aria-expanded={more} aria-controls={listId} onClick={() => setMore(m => !m)} iconEnd={more ? 'chevron-up' : 'chevron-down'} className="mt-4 lg:hidden">
          {more ? 'Hide' : 'Show'} games {rest[0].gameNo} to {rest[rest.length - 1].gameNo}
        </Button>
      )}
    </div>
  );
}

interface GameCellProps {
  game: GameCellView;
  players: Players;
  locked: boolean;
  onPick(g: number, v: PickOutcome | null): void;
  onPreview?(p: number | null): void;
  className?: string;
}

const OUTCOMES = ['1', 'd', '2'] as const;

export function GameCell({ game: g, players, locked, onPick, onPreview, className }: GameCellProps) {
  const done = g.result !== null;
  const option = (value: PickOutcome): PickOption<PickOutcome> => {
    const preview = g.swing ? `${players[1].shortName} then ${formatPct(g.swing[value])} to win the match` : undefined;
    if (value === 'd') return { value, label: 'Draw', glyph: '½', pct: g.odds[1], tone: 'draw', preview };
    const id = value === '1' ? 1 : 2;
    const photo = id === 1 ? WCC_PHOTOS.gukesh.avatar : WCC_PHOTOS.sindarov.avatar;
    return { value, label: `${players[id].shortName} wins`, face: { src: photo.src, name: players[id].shortName }, pct: g.odds[id === 1 ? 0 : 2], tone: id === 1 ? 'p1' : 'p2', preview };
  };
  const black = g.whiteName === null ? null : g.whiteName === players[1].shortName ? players[2].shortName : players[1].shortName;
  const note = g.unreachable ? 'Not played: match already decided' : g.gameNo >= 8 && !done ? `Played in ${formatPct(g.pPlayed, 0)}` : null;

  const when = g.live ? <Link href={g.href} className="rounded-sm underline-offset-4 hover:underline"><LiveDot label="Live now" /></Link> : g.dateLabel;

  return (
    <li
      className={cn(
        'relative grid min-w-0 grid-cols-[minmax(0,1fr)_min(12.5rem,calc(100%-9rem))] gap-x-3 border-b border-control py-3',
        'lg:flex lg:flex-col lg:gap-y-3 lg:border-l lg:border-l-line lg:px-2 lg:pb-4 lg:pt-1 xl:px-3 lg:[&:nth-child(7n+1)]:border-l-0 lg:[&:nth-child(7n+1)]:pl-0 lg:[&:nth-child(7n)]:pr-0',
        className,
      )}
    >
      {/* Result and live edges lie on the rule above the cell. */}
      {(done || g.live) && (
        <span aria-hidden className={cn('absolute inset-x-0 -top-px', g.live ? 'h-0.5 bg-live' : cn('h-[3px]', g.result === 2 ? 'bg-p1' : g.result === 0 ? 'bg-p2' : 'bg-draw'))} />
      )}
      {/* The outline stands outside the words, on phones and at the two ends of a row. */}
      {g.next && !g.live && (
        <span aria-hidden className={cn('pointer-events-none absolute -inset-x-3 -bottom-px -top-px border-2 border-ink lg:inset-x-0', g.gameNo % 7 === 1 && 'lg:-left-3', g.gameNo % 7 === 0 && 'lg:-right-3')} />
      )}

      <div className="flex min-w-0 flex-col justify-center lg:gap-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2">
          <Link
            href={g.href}
            aria-label={`Game ${g.gameNo}, watch or replay`}
            className={cn('-my-2 inline-flex min-h-tap items-center gap-2 whitespace-nowrap rounded-sm type-h3 lg:my-0 underline-offset-4 transition-colors duration-in hover:underline hover:decoration-brand-mark', g.unreachable ? 'text-ink-3' : 'text-ink')}
          >
            <span><span className="lg:hidden">Game </span>{g.gameNo}</span>
            <Icon name="play" size={14} className="text-ink-3" />
          </Link>
          <span className={cn('hidden whitespace-nowrap type-label lg:block', g.unreachable ? 'text-ink-3' : 'text-ink-2')}>{when}</span>
        </div>
        <p className={cn('type-label lg:hidden', g.unreachable ? 'text-ink-3' : 'text-ink-2')}>{when}</p>
        <p className={cn('mt-1 flex items-center gap-1.5 type-label lg:mt-0 xl:gap-2 xl:type-small', g.unreachable ? 'text-ink-3' : 'text-ink-2')} title={g.whiteAssumed ? 'Colours are assumed until the draw' : undefined}>
          <PieceDot side="white" />
          <span className="min-w-0 truncate">White: {g.whiteName ?? 'to be drawn'}</span>
          {black && <span className="sr-only">, {black} Black{g.whiteAssumed ? ' (assumed colours)' : ''}</span>}
        </p>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-y-2 lg:justify-start">
        {done ? (
          <div className="flex flex-col items-start">
            <p className="type-h3 text-ink">{g.result === 1 ? 'Draw ½–½' : `${players[g.result === 2 ? 1 : 2].shortName} won`}</p>
            <TextLink href={g.href} quiet standalone>Final. Replay</TextLink>
          </div>
        ) : (
          <>
            <PickToggle
              legend={`Game ${g.gameNo}`} options={OUTCOMES.map(option)} value={g.pick ?? null} disabled={locked || g.unreachable}
              onChange={v => onPick(g.gameNo, v)} onPreview={onPreview ? v => onPreview(v && g.swing ? g.swing[v] : null) : undefined}
            />
          </>
        )}
        {note && <p className="type-label text-ink-3">{note}</p>}
      </div>
    </li>
  );
}
