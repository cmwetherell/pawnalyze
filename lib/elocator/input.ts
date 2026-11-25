import { Chess } from 'chess.js';

import { START_FEN } from '@/lib/live/pgn';

export type InputKind = 'fen' | 'pgn' | 'error';

export function detectInputType(input: string): InputKind {
  const trimmed = input.trim();
  if (!trimmed) return 'error';

  const firstLine = trimmed.split('\n')[0].trim();
  const fenParts = firstLine.split(/\s+/);
  const ranks = fenParts[0].split('/');
  if (ranks.length === 8 && /^[rnbqkpRNBQKP1-8]+$/.test(ranks.join(''))) return 'fen';

  if (/\[\w+\s+"[^"]*"\]/.test(trimmed) || /\d+\./.test(trimmed)) return 'pgn';

  return 'error';
}

/** The FEN in the box: its first line. */
export const fenOf = (input: string): string => input.trim().split('\n')[0].trim();

/** One position of a game; `complexity` is null until Elocator has scored it. */
export interface Position {
  ply: number;
  san: string | null;
  from: string | null;
  to: string | null;
  fen: string;
  toMove: 'w' | 'b';
  complexity: number | null;
}

export const sideToMove = (fen: string): 'w' | 'b' => (fen.split(/\s+/)[1] === 'b' ? 'b' : 'w');

/** How the game ended on this position, if it did. */
export function endOf(fen: string): 'Checkmate' | 'Stalemate' | null {
  try {
    const game = new Chess(fen);
    return game.isCheckmate() ? 'Checkmate' : game.isStalemate() ? 'Stalemate' : null;
  } catch {
    return null;
  }
}

export const positionOf = (fen: string, complexity: number | null = null): Position => ({ ply: 0, san: null, from: null, to: null, fen, toMove: sideToMove(fen), complexity });

/** Every position of a game, or none when the PGN cannot be replayed. */
export function positionsOf(pgn: string): Position[] {
  try {
    // Without comments ({...}) and annotations (??, ?!, ?, !, !!).
    const game = new Chess();
    game.loadPgn(pgn.replace(/\{[^}]*\}/g, '').replace(/[?!]+/g, ''));
    const moves = game.history({ verbose: true });
    return [
      positionOf(moves[0]?.before ?? START_FEN),
      ...moves.map((m, i): Position => ({ ply: i + 1, san: m.san, from: m.from, to: m.to, fen: m.after, toMove: sideToMove(m.after), complexity: null })),
    ];
  } catch {
    return [];
  }
}
