/**
 * Parsing for Lichess broadcast PGN, as sent by
 * https://lichess.org/api/stream/broadcast/round/{id}.pgn
 *
 * The stream sends every game once on connect, then the whole PGN of a game again after each move.
 * Chunks split anywhere; each PGN ends with two blank lines, and idle keep-alives are whitespace.
 */
import { Chess } from 'chess.js';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export type Color = 'w' | 'b';

/** Engine evaluation from White's point of view. Exactly one of cp / mate is set. */
export interface Evaluation {
  cp?: number;
  /** Moves to mate; positive when White mates, negative when Black does. 0 = already checkmate. */
  mate?: number;
  /** Who delivered it, when mate is 0. */
  mateBy?: Color;
  depth?: number;
  source: 'broadcast' | 'cloud' | 'rules';
}

export interface LivePosition {
  /** Plies played to reach this position; 0 is the starting position. */
  ply: number;
  san: string | null;
  from: string | null;
  to: string | null;
  fen: string;
  toMove: Color;
  /** Mover's remaining time in seconds after the move that reached this position. */
  clock: number | null;
  /** Evaluation given in the PGN (Lichess adds these once its post-game analysis is done). */
  evaluation: Evaluation | null;
  /** Checkmate, stalemate or dead position: nothing left to evaluate. */
  over: boolean;
}

export interface LiveGame {
  headers: Record<string, string>;
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  /** positions[0] is the start; positions[n] follows ply n. */
  positions: LivePosition[];
  /** A move could not be replayed; positions stop before it. */
  truncated: boolean;
}

/** Collects stream chunks and returns each PGN once it is complete. */
export class PgnSplitter {
  private buf = '';

  push(chunk: string): string[] {
    this.buf = (this.buf + chunk).replace(/\r/g, '');
    const out: string[] = [];
    for (;;) {
      const end = /\n{3,}/.exec(this.buf);
      if (!end) break;
      const pgn = this.buf.slice(0, end.index).trim();
      this.buf = this.buf.slice(end.index + end[0].length);
      if (pgn.includes('[Event ')) out.push(pgn);
    }
    // Keep-alives arrive as bare whitespace between games.
    if (!this.buf.trim()) this.buf = '';
    return out;
  }
}

/** Split a complete multi-game PGN document. */
export function splitPgn(doc: string): string[] {
  return new PgnSplitter().push(`${doc}\n\n\n`);
}

function parseClock(s: string): number | null {
  const m = /\[%clk\s+(\d+):(\d{1,2}):(\d{1,2})(?:\.\d+)?\]/.exec(s);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}

function parseEval(s: string): Evaluation | null {
  const m = /\[%eval\s+(#?)(-?\d+(?:\.\d+)?)(?:,(\d+))?\]/.exec(s);
  if (!m) return null;
  const depth = m[3] ? Number(m[3]) : undefined;
  return m[1] ? { mate: Number(m[2]), depth, source: 'broadcast' } : { cp: Math.round(Number(m[2]) * 100), depth, source: 'broadcast' };
}

function terminal(chess: Chess): Evaluation | null {
  if (chess.isCheckmate()) return { mate: 0, mateBy: chess.turn() === 'w' ? 'b' : 'w', source: 'rules' };
  if (chess.isStalemate() || chess.isInsufficientMaterial()) return { cp: 0, source: 'rules' };
  return null;
}

/** Parse one PGN. Never throws: an unreadable move ends the list and sets `truncated`. */
export function parseLiveGame(pgn: string): LiveGame {
  const headers: Record<string, string> = {};
  const tag = /^\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/gm;
  for (const m of pgn.matchAll(tag)) headers[m[1]] = m[2].replace(/\\(.)/g, '$1');
  const text = pgn.replace(tag, '');

  let chess: Chess;
  try {
    chess = headers.FEN ? new Chess(headers.FEN) : new Chess();
  } catch {
    return { headers, result: null, positions: [], truncated: true };
  }
  const startFen = chess.fen();
  const positions: LivePosition[] = [
    { ply: 0, san: null, from: null, to: null, fen: startFen, toMove: chess.turn(), clock: null, evaluation: terminal(chess), over: false },
  ];
  let result: LiveGame['result'] = null;
  let truncated = false;
  let depth = 0; // inside ( variations )

  for (const tok of text.match(/\{[^}]*\}|;[^\n]*|\(|\)|[^\s(){};]+/g) ?? []) {
    if (tok === '(') { depth++; continue; }
    if (tok === ')') { depth = Math.max(0, depth - 1); continue; }
    if (depth > 0) continue;
    if (tok.startsWith('{')) {
      const p = positions[positions.length - 1];
      p.clock = parseClock(tok) ?? p.clock;
      if (!p.over) p.evaluation = parseEval(tok) ?? p.evaluation;
      continue;
    }
    if (tok.startsWith(';') || tok.startsWith('$')) continue;
    if (tok === '1-0' || tok === '0-1' || tok === '1/2-1/2') { result = tok; continue; }
    if (tok === '*') continue;
    const san = tok.replace(/^\d+\.+/, '').replace(/[?!]+$/, '');
    if (!san) continue;
    if (truncated) continue;
    try {
      const mv = chess.move(san);
      const end = terminal(chess);
      positions.push({
        ply: positions.length, san: mv.san, from: mv.from, to: mv.to, fen: mv.after, toMove: chess.turn(),
        clock: null, evaluation: end, over: end !== null,
      });
    } catch {
      truncated = true;
    }
  }
  // Broadcasts set the result tag too, sometimes before the movetext has it.
  if (!result) {
    const r = headers.Result;
    if (r === '1-0' || r === '0-1' || r === '1/2-1/2') result = r;
  }
  return { headers, result, positions, truncated };
}

/** The part of a FEN that decides its score and evaluation, with the move counters dropped. */
export function fenKey(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(' ');
}

/** "+0.35", "−1.20", "M3", "−M2" style label, from White's point of view. */
export function fmtEval(e: Evaluation): string {
  if (e.mate !== undefined) {
    if (e.mate === 0) return e.mateBy === 'b' ? '0-1' : '1-0';
    return `${e.mate < 0 ? '−' : ''}M${Math.abs(e.mate)}`;
  }
  const v = (e.cp ?? 0) / 100;
  if (Math.abs(v) < 0.005) return '0.00';
  return `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(Math.abs(v) >= 10 ? 1 : 2)}`;
}

/** Evaluation in pawns, capped for plotting. */
export function evalPawns(e: Evaluation, cap: number): number {
  if (e.mate !== undefined) return e.mate > 0 || (e.mate === 0 && e.mateBy === 'w') ? cap : -cap;
  return Math.max(-cap, Math.min(cap, (e.cp ?? 0) / 100));
}

/** Share of the evaluation bar that is White's: Lichess's win-chance curve. */
export function whiteShare(e: Evaluation): number {
  if (e.mate !== undefined) return evalPawns(e, 1) > 0 ? 1 : 0;
  return 1 / (1 + Math.exp(-0.00368208 * (e.cp ?? 0)));
}
