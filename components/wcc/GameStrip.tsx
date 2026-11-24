'use client';

import Image from 'next/image';

import { WCC_PHOTOS } from '@/lib/wcc/photos';
import type { PickOutcome } from '@/lib/wcc/scenario';
import type { HalfPoints, PlayerId, Triplet, WccGame } from '@/lib/wcc/types';
import { formatPct, type Players } from './ui';

export interface GameView {
  game: WccGame;
  /** Who has White: known from the draw, assumed from the colour toggle, or null. */
  white: PlayerId | null;
  whiteAssumed: boolean;
  odds: Triplet; // P1 [win, draw, loss]
  pPlayed: number;
  finalHp: HalfPoints | null;
  pick: PickOutcome | undefined;
  /** P(Gukesh wins the match) if this game ends each way, given everything else. */
  swing: Record<PickOutcome, number> | null;
}

const genevaDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short' }) : '';

function Piece({ white }: { white: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${white ? 'bg-white ring-1 ring-black/40' : 'bg-neutral-900 ring-1 ring-white/30'}`}
    />
  );
}

function Colours({ view, players }: { view: GameView; players: Players }) {
  if (view.white === null) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
        <Piece white /> White: <span className="font-semibold">?</span>
        <span className="sr-only">Colours are drawn on 22 November</span>
      </p>
    );
  }
  const w = players[view.white];
  const b = players[view.white === 1 ? 2 : 1];
  return (
    <p className={`flex items-center gap-1.5 text-[11px] min-w-0 ${view.whiteAssumed ? 'text-[var(--text-muted)] italic' : 'text-[var(--text-secondary)]'}`}>
      <Piece white /> <span className="truncate">White: <span className="font-semibold not-italic">{w.shortName}</span></span>
      <span className="sr-only">, {b.shortName} Black{view.whiteAssumed ? ' (assumed colours)' : ''}</span>
    </p>
  );
}

function TriBar({ odds, players }: { odds: Triplet; players: Players }) {
  const [w, d, l] = odds;
  const label = `${players[1].shortName} ${formatPct(w, 0)}, draw ${formatPct(d, 0)}, ${players[2].shortName} ${formatPct(l, 0)}`;
  return (
    <div>
      <div className="flex h-2 gap-[2px] rounded-full overflow-hidden" role="img" aria-label={label}>
        <div style={{ width: `${w * 100}%`, background: 'var(--wcc-p1)' }} />
        <div style={{ width: `${d * 100}%`, background: 'var(--wcc-draw)' }} />
        <div style={{ width: `${l * 100}%`, background: 'var(--wcc-p2)' }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[var(--text-muted)]" aria-hidden>
        <span>{Math.round(w * 100)}%</span>
        <span>½ {Math.round(d * 100)}%</span>
        <span>{Math.round(l * 100)}%</span>
      </div>
    </div>
  );
}

const AVATAR = { '1': WCC_PHOTOS.gukesh.avatar.src, '2': WCC_PHOTOS.sindarov.avatar.src } as const;

const OPTIONS: { key: PickOutcome; short: (p: Players) => string; long: (p: Players) => string }[] = [
  { key: '1', short: p => p[1].shortName, long: p => `${p[1].shortName} wins` },
  { key: 'd', short: () => 'Draw', long: () => 'Draw' },
  { key: '2', short: p => p[2].shortName, long: p => `${p[2].shortName} wins` },
];

export function PickToggle({
  gameNo, value, onChange, players, disabled, swing,
}: {
  gameNo: number;
  value: PickOutcome | undefined;
  onChange: (v: PickOutcome | null) => void;
  players: Players;
  disabled?: boolean;
  swing: Record<PickOutcome, number> | null;
}) {
  return (
    <div role="group" aria-label={`Game ${gameNo} result`} className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--bg-surface-2)] p-1">
      {OPTIONS.map(o => {
        const active = value === o.key;
        const tint = o.key === '1' ? 'var(--wcc-p1)' : o.key === '2' ? 'var(--wcc-p2)' : 'var(--wcc-draw)';
        const odds = swing ? ` (${players[1].shortName} then ${formatPct(swing[o.key])} to win the match)` : '';
        return (
          <button
            key={o.key}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            aria-label={`Game ${gameNo}: ${o.long(players)}${odds}`}
            title={swing ? `${o.long(players)} → ${players[1].shortName} ${formatPct(swing[o.key])}` : o.long(players)}
            onClick={() => onChange(active ? null : o.key)}
            className={`relative min-h-[44px] rounded-md px-0.5 text-[11px] font-semibold leading-tight transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              active
                ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-sm ring-2'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-1)]/60'
            }`}
            style={active ? { ['--tw-ring-color' as string]: tint } : undefined}
          >
            {o.key === 'd' ? (
              <span aria-hidden className="mx-auto grid place-items-center w-6 h-6 text-sm font-bold">½</span>
            ) : (
              <Image
                src={AVATAR[o.key]}
                alt=""
                width={24}
                height={24}
                className={`mx-auto w-6 h-6 rounded-full object-cover transition ${active ? '' : 'grayscale-[40%] opacity-80'}`}
              />
            )}
            <span className="sr-only">{o.short(players)}</span>
            <span aria-hidden className="mx-auto mt-1 block h-1 w-5 rounded-full" style={{ background: tint, opacity: active ? 1 : 0.45 }} />
          </button>
        );
      })}
    </div>
  );
}

function ResultBadge({ hp, players }: { hp: HalfPoints; players: Players }) {
  if (hp === 1) {
    return <p className="text-sm font-semibold text-[var(--text-primary)]">Draw <span className="text-[var(--text-muted)] font-normal">½–½</span></p>;
  }
  const winner = hp === 2 ? players[1] : players[2];
  return (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
      <span aria-hidden className="w-2.5 h-2.5 rounded-sm" style={{ background: hp === 2 ? 'var(--wcc-p1)' : 'var(--wcc-p2)' }} />
      {winner.shortName} won
    </p>
  );
}

export function GameCard({
  view, players, onPick, locked,
}: {
  view: GameView;
  players: Players;
  onPick: (g: number, v: PickOutcome | null) => void;
  locked: boolean;
}) {
  const { game } = view;
  const live = game.status === 'live';
  const done = view.finalHp !== null;
  const unreachable = !done && view.pPlayed < 1e-9;
  const accent = done ? (view.finalHp === 2 ? 'var(--wcc-p1)' : view.finalHp === 0 ? 'var(--wcc-p2)' : 'var(--wcc-draw)') : view.pick ? (view.pick === '1' ? 'var(--wcc-p1)' : view.pick === '2' ? 'var(--wcc-p2)' : 'var(--wcc-draw)') : 'transparent';

  return (
    <li
      className={`snap-start shrink-0 w-[164px] lg:w-auto rounded-xl border bg-[var(--bg-surface-1)] p-2.5 flex flex-col gap-2 transition-opacity ${
        live ? 'border-red-500/50' : 'border-[var(--border)]'
      } ${unreachable ? 'opacity-50' : ''}`}
      style={{ boxShadow: `inset 0 3px 0 ${accent}` }}
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className="font-heading text-base text-[var(--text-primary)]">G{game.gameNo}</span>
        <span className="text-[10px] text-[var(--text-muted)] truncate">{genevaDate(game.startsAt)}</span>
      </div>
      <Colours view={view} players={players} />

      {done ? (
        <div className="min-h-[76px] flex flex-col justify-center">
          <ResultBadge hp={view.finalHp!} players={players} />
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Final result</p>
        </div>
      ) : (
        <>
          {live && (
            <span className="self-start inline-flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-live" aria-hidden /> Live
            </span>
          )}
          <TriBar odds={view.odds} players={players} />
          <PickToggle
            gameNo={game.gameNo}
            value={view.pick}
            onChange={v => onPick(game.gameNo, v)}
            players={players}
            disabled={locked || unreachable}
            swing={view.swing}
          />
          <p className="text-[10px] text-[var(--text-muted)] tabular-nums h-3">
            {unreachable ? 'Not played: match already decided' : game.gameNo >= 8 ? `Played in ${formatPct(view.pPlayed, 0)} of matches` : ''}
          </p>
        </>
      )}
    </li>
  );
}

export default function GameStrip({
  views, players, onPick, locked,
}: {
  views: GameView[];
  players: Players;
  onPick: (g: number, v: PickOutcome | null) => void;
  locked: boolean;
}) {
  return (
    <ol
      className="relative -mx-4 px-4 sm:mx-0 sm:px-0 flex lg:grid lg:grid-cols-7 gap-2 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scroll-px-4 pb-2 lg:pb-0 scrollbar-none"
      aria-label="Classical games"
    >
      {views.map(v => (
        <GameCard key={v.game.gameNo} view={v} players={players} onPick={onPick} locked={locked} />
      ))}
    </ol>
  );
}
