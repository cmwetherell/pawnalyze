import { useMemo } from 'react';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

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

interface BoardSvgProps {
  fen: string;
  /** Squares of the last move, highlighted. */
  from?: string | null;
  to?: string | null;
  flipped?: boolean;
  label: string;
}

/** A static SVG board for a FEN; scales to its container. */
export default function BoardSvg({ fen, from, to, flipped = false, label }: BoardSvgProps) {
  const pieces = useMemo(() => piecesFromFen(fen), [fen]);
  const sq = (file: number, rank: number) => {
    const x = flipped ? 7 - file : file;
    const y = flipped ? rank : 7 - rank;
    return { x: x * 12.5, y: y * 12.5 };
  };
  const coords = (square: string) => sq(FILES.indexOf(square[0]), Number(square[1]) - 1);

  return (
    <svg viewBox="0 0 100 100" className="w-full aspect-square rounded-md overflow-hidden select-none" role="img" aria-label={label}>
      {Array.from({ length: 64 }, (_, i) => {
        const file = i % 8;
        const rank = 7 - Math.floor(i / 8);
        const { x, y } = sq(file, rank);
        const dark = (file + rank) % 2 === 0;
        const square = `${FILES[file]}${rank + 1}`;
        const hl = square === from || square === to;
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
  );
}
