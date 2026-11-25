'use client';

import { Chess } from 'chess.js';
import { useMemo, useState } from 'react';

import { TextLink } from '@/components/ui/TextLink';
import { START_FEN } from '@/lib/live/pgn';
import { BoardControls } from './BoardControls';
import { BoardPane } from './BoardPane';
import { MoveList } from './MoveList';
import { PlayerClock } from './PlayerClock';
import { Replay } from './Replay';

interface Side {
  name: string;
  rating?: number;
}

interface GameViewerProps {
  /** SAN move text, e.g. "1. e4 e5 2. Nf3 ..." (result token optional) */
  moves: string;
  white: Side;
  black: Side;
  result: string;
  /** Which side sits at the bottom initially */
  orientation?: 'w' | 'b';
  /** Start at the final position (default) or the initial one */
  startAtEnd?: boolean;
}

interface Ply { san: string; fen: string; from: string; to: string }

function parsePlies(moves: string): { plies: Ply[]; error: boolean } {
  try {
    const chess = new Chess();
    chess.loadPgn(moves.replace(/\{[^}]*\}/g, '').replace(/\$\d+/g, ''));
    return { plies: chess.history({ verbose: true }).map(m => ({ san: m.san, fen: m.after, from: m.from, to: m.to })), error: false };
  } catch {
    return { plies: [], error: true };
  }
}

export function lichessAnalysisHref(moves: string): string {
  return `https://lichess.org/analysis/pgn/${encodeURIComponent(moves.trim()).replace(/%20/g, '_')}`;
}

/** Self-contained game replay: board, move list, keyboard arrows, flip, Lichess link. */
export function GameViewer({ moves, white, black, result, orientation = 'w', startAtEnd = true }: GameViewerProps) {
  const { plies, error } = useMemo(() => parsePlies(moves), [moves]);
  const [ply, setPly] = useState(startAtEnd ? plies.length : 0);
  const [flipped, setFlipped] = useState(orientation === 'b');

  const last = ply === 0 ? null : plies[ply - 1];
  const go = (n: number) => setPly(Math.min(Math.max(n, 0), plies.length));
  const flip = () => setFlipped(v => !v);

  if (error || plies.length === 0) {
    return <p className="py-3 type-small text-ink-3">Moves for this game are not available{error ? ' (the broadcast record could not be parsed)' : ''}.</p>;
  }

  const name = (c: 'white' | 'black') => {
    const s = c === 'white' ? white : black;
    return <PlayerClock name={s.name} rating={s.rating} tone="ink" side={c} />;
  };
  return (
    <Replay
      label="Game replay; use the arrow keys to step through the moves"
      ply={ply} last={plies.length} onGo={go} onFlip={flip}
      board={(
        <BoardPane
          fen={last?.fen ?? START_FEN} from={last?.from} to={last?.to} flipped={flipped}
          label={`Position after ${ply} ${ply === 1 ? 'ply' : 'plies'}`}
          top={name(flipped ? 'white' : 'black')} bottom={name(flipped ? 'black' : 'white')}
          controls={<BoardControls ply={ply} last={plies.length} onGo={go} onFlip={flip} />}
        />
      )}
      aside={(
        <div>
          <MoveList moves={plies} ply={ply} onGo={go} maxHeight="clamp(280px, 60vh, 440px)" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 type-small">
            <span className="whitespace-nowrap font-medium text-ink tnum">{result.replace('1/2-1/2', '½–½')}</span>
            <TextLink standalone href={lichessAnalysisHref(moves)}>Analyze on Lichess</TextLink>
          </div>
        </div>
      )}
    />
  );
}

export default GameViewer;
