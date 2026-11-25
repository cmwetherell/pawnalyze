import { token } from '@/lib/theme/css';
import { cn } from '@/lib/utils';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface BoardProps {
  fen: string;
  /** Squares of the last move. */
  from?: string | null;
  to?: string | null;
  flipped?: boolean;
  label: string;
  /** Hidden anyway on boards under 420px, where 12px letters would cover the pieces. */
  coords?: boolean;
  className?: string;
}

function piecesFromFen(fen: string): { file: number; rank: number; piece: string }[] {
  return fen.split(' ')[0].split('/').flatMap((row, r) => {
    const out: { file: number; rank: number; piece: string }[] = [];
    let file = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) { file += Number(ch); continue; }
      out.push({ file, rank: 7 - r, piece: `${ch === ch.toUpperCase() ? 'w' : 'b'}${ch.toUpperCase()}` });
      file++;
    }
    return out;
  });
}

/** A static SVG board for a FEN; fills its container. */
export function Board({ fen, from, to, flipped = false, label, coords = true, className }: BoardProps) {
  const at = (file: number, rank: number) => ({ x: (flipped ? 7 - file : file) * 10, y: (flipped ? rank : 7 - rank) * 10 });
  const files = flipped ? [...FILES].reverse() : FILES;
  const ranks = Array.from({ length: 8 }, (_, i) => (flipped ? i + 1 : 8 - i));
  return (
    <div className={cn('relative w-full [container-type:inline-size]', className)}>
      <svg viewBox="0 0 80 80" role="img" aria-label={label} className="block aspect-square w-full select-none overflow-hidden rounded-sm">
        {Array.from({ length: 64 }, (_, i) => {
          const file = i % 8;
          const rank = Math.floor(i / 8);
          const square = `${FILES[file]}${rank + 1}`;
          const p = at(file, rank);
          return (
            <g key={square}>
              <rect {...p} width={10.05} height={10.05} fill={token((file + rank) % 2 === 0 ? 'board-dark' : 'board-light')} />
              {(square === from || square === to) && <rect {...p} width={10.05} height={10.05} fill={token('board-mark', 0.55)} />}
            </g>
          );
        })}
        {piecesFromFen(fen).map(p => {
          const { x, y } = at(p.file, p.rank);
          return <image key={`${p.file}${p.rank}`} href={`/img/chesspieces/${p.piece}.svg`} x={x + 0.6} y={y + 0.6} width={8.8} height={8.8} />;
        })}
      </svg>
      {coords && (
        // Outside the SVG, so the letters stay 12px however small the board is drawn.
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden text-board-ink type-micro leading-none [@container_(min-width:420px)]:block">
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-8">{files.map(f => <span key={f} className="pb-0.5 pr-0.5 text-right">{f}</span>)}</div>
          <div className="absolute inset-y-0 left-0 grid grid-rows-8">{ranks.map(r => <span key={r} className="pl-0.5 pt-0.5">{r}</span>)}</div>
        </div>
      )}
    </div>
  );
}
