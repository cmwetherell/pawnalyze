'use client';

import { Chess } from 'chess.js';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Side {
  name: string;
  rating?: number;
}

interface GameViewerProps {
  /** SAN move text, e.g. "1. e4 e5 2. Nf3 …" (result token optional) */
  moves: string;
  white: Side;
  black: Side;
  result: string;
  /** Which side sits at the bottom initially */
  orientation?: 'w' | 'b';
  /** Start at the final position (default) or the initial one */
  startAtEnd?: boolean;
}

interface Ply {
  san: string;
  fen: string;
  from: string;
  to: string;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function parsePlies(moves: string): { plies: Ply[]; error: boolean } {
  try {
    const chess = new Chess();
    chess.loadPgn(moves.replace(/\{[^}]*\}/g, '').replace(/\$\d+/g, ''));
    const plies = chess.history({ verbose: true }).map(m => ({ san: m.san, fen: m.after, from: m.from, to: m.to }));
    return { plies, error: false };
  } catch {
    return { plies: [], error: true };
  }
}

function piecesFromFen(fen: string): { square: string; piece: string }[] {
  const out: { square: string; piece: string }[] = [];
  const rows = fen.split(' ')[0].split('/');
  rows.forEach((row, r) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) { f += Number(ch); continue; }
      const colour = ch === ch.toUpperCase() ? 'w' : 'b';
      out.push({ square: `${FILES[f]}${8 - r}`, piece: `${colour}${ch.toUpperCase()}` });
      f++;
    }
  });
  return out;
}

export function lichessAnalysisHref(moves: string): string {
  return `https://lichess.org/analysis/pgn/${encodeURIComponent(moves.trim()).replace(/%20/g, '_')}`;
}

/** Self-contained game replay: SVG board, move list, keyboard arrows, flip, Lichess link. */
export default function GameViewer({ moves, white, black, result, orientation = 'w', startAtEnd = true }: GameViewerProps) {
  const { plies, error } = useMemo(() => parsePlies(moves), [moves]);
  const [ply, setPly] = useState(startAtEnd ? plies.length : 0);
  const [flipped, setFlipped] = useState(orientation === 'b');
  const listRef = useRef<HTMLOListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const fen = ply === 0 ? START_FEN : plies[ply - 1].fen;
  const last = ply === 0 ? null : plies[ply - 1];
  const pieces = useMemo(() => piecesFromFen(fen), [fen]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [ply]);

  const clamp = (n: number) => Math.min(Math.max(n, 0), plies.length);
  const go = (n: number) => setPly(clamp(n));
  const step = (d: number) => setPly(p => clamp(p + d));
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(plies.length); }
    else if (e.key === 'f') setFlipped(v => !v);
  };

  const sq = (file: number, rank: number) => {
    const x = flipped ? 7 - file : file;
    const y = flipped ? rank : 7 - rank;
    return { x: x * 12.5, y: y * 12.5 };
  };
  const coords = (square: string) => sq(FILES.indexOf(square[0]), Number(square[1]) - 1);
  const top = flipped ? white : black;
  const bottom = flipped ? black : white;
  const ctrl = 'h-10 w-10 inline-flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent';

  if (error || plies.length === 0) {
    return <p className="text-sm text-[var(--text-muted)] px-1 py-3">Moves for this game are not available{error ? ' (the broadcast record could not be parsed)' : ''}.</p>;
  }

  return (
    <div ref={rootRef} tabIndex={0} onKeyDown={onKey} className="grid gap-3 md:grid-cols-[minmax(0,380px)_minmax(11rem,1fr)] outline-none focus-visible:ring-2 focus-visible:ring-chess-gold rounded-lg" aria-label="Game replay; use the arrow keys to step through the moves">
      <div>
        <SideLabel side={top} />
        <svg viewBox="0 0 100 100" className="w-full aspect-square rounded-md overflow-hidden select-none" role="img" aria-label={`Position after ${ply} ${ply === 1 ? 'ply' : 'plies'}`}>
          {Array.from({ length: 64 }, (_, i) => {
            const file = i % 8;
            const rank = 7 - Math.floor(i / 8);
            const { x, y } = sq(file, rank);
            const dark = (file + rank) % 2 === 0;
            const square = `${FILES[file]}${rank + 1}`;
            const hl = last && (last.from === square || last.to === square);
            return (
              <g key={square}>
                <rect x={x} y={y} width={12.5} height={12.5} fill={dark ? 'var(--board-dark)' : 'var(--board-light)'} />
                {hl && <rect x={x} y={y} width={12.5} height={12.5} fill="#C9A84C" fillOpacity={0.45} />}
              </g>
            );
          })}
          {pieces.map(p => {
            const { x, y } = coords(p.square);
            return <image key={p.square} href={`/img/chesspieces/${p.piece}.svg`} x={x + 0.6} y={y + 0.6} width={11.3} height={11.3} />;
          })}
          {/* coordinates */}
          {FILES.map((f, i) => {
            const { x } = sq(i, 0);
            return <text key={f} x={x + 10.6} y={99} fontSize={2.6} fill="var(--board-dark)" opacity={0.9}>{f}</text>;
          })}
          {Array.from({ length: 8 }, (_, r) => {
            const { y } = sq(0, r);
            return <text key={r} x={0.7} y={y + 3.2} fontSize={2.6} fill={(r % 2 === 0) === !flipped ? 'var(--board-light)' : 'var(--board-dark)'} opacity={0.9}>{r + 1}</text>;
          })}
        </svg>
        <SideLabel side={bottom} />
        <div className="mt-2 flex items-center gap-1">
          <button type="button" onClick={() => go(0)} disabled={ply === 0} className={ctrl} aria-label="First move">⏮</button>
          <button type="button" onClick={() => step(-1)} disabled={ply === 0} className={ctrl} aria-label="Previous move">◀</button>
          <button type="button" onClick={() => step(1)} disabled={ply === plies.length} className={ctrl} aria-label="Next move">▶</button>
          <button type="button" onClick={() => go(plies.length)} disabled={ply === plies.length} className={ctrl} aria-label="Last move">⏭</button>
          <button type="button" onClick={() => setFlipped(v => !v)} className={ctrl} aria-label="Flip board" title="Flip board (f)">⇅</button>
          <span className="ml-auto text-xs text-[var(--text-muted)] tabular-nums">{ply}/{plies.length}</span>
        </div>
      </div>

      <div className="min-w-0">
        <ol ref={listRef} className="grid grid-cols-[2.5rem_1fr_1fr] gap-y-0.5 text-sm max-h-[280px] md:max-h-[420px] overflow-y-auto pr-1" aria-label="Moves">
          {Array.from({ length: Math.ceil(plies.length / 2) }, (_, i) => {
            const w = plies[i * 2];
            const b = plies[i * 2 + 1];
            const btn = (p: Ply | undefined, idx: number) => p ? (
              <button
                type="button"
                onClick={() => go(idx)}
                aria-current={ply === idx ? 'step' : undefined}
                className={`text-left px-1.5 h-7 rounded font-mono ${ply === idx ? 'bg-chess-gold/20 text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'}`}
              >
                {p.san}
              </button>
            ) : <span />;
            return (
              <li key={i} className="contents">
                <span className="text-[var(--text-muted)] tabular-nums h-7 inline-flex items-center px-1">{i + 1}.</span>
                {btn(w, i * 2 + 1)}
                {btn(b, i * 2 + 2)}
              </li>
            );
          })}
        </ol>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[var(--text-primary)] tabular-nums whitespace-nowrap">{result}</span>
          <a href={lichessAnalysisHref(moves)} target="_blank" rel="noopener noreferrer" className="text-gold-ink hover:text-chess-gold-light underline decoration-chess-gold/30 whitespace-nowrap">
            Analyse on Lichess ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function SideLabel({ side }: { side: Side }) {
  return (
    <div className="flex items-center justify-between text-xs py-1 text-[var(--text-secondary)]">
      <span className="truncate font-medium text-[var(--text-primary)]">{side.name}</span>
      {side.rating ? <span className="tabular-nums text-[var(--text-muted)]">{side.rating}</span> : null}
    </div>
  );
}
