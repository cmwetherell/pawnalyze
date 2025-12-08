import React from 'react';
import Image from "next/image";

interface SquareProps {
  dark: boolean;
  piece?: string;
  file: string;
  rank: number;
  showCoordinates: boolean;
}

const Square: React.FC<SquareProps> = ({ dark, piece, file, rank, showCoordinates }) => {
  return (
    <div 
      className={`
        relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center
        ${dark ? 'bg-amber-700/80' : 'bg-amber-100'}
        transition-colors duration-200
      `}
    >
      {/* Coordinate labels */}
      {showCoordinates && rank === 1 && (
        <span className={`absolute bottom-0.5 right-1 text-[10px] font-medium ${dark ? 'text-amber-100/60' : 'text-amber-700/60'}`}>
          {file}
        </span>
      )}
      {showCoordinates && file === 'a' && (
        <span className={`absolute top-0.5 left-1 text-[10px] font-medium ${dark ? 'text-amber-100/60' : 'text-amber-700/60'}`}>
          {rank}
        </span>
      )}
      
      {/* Chess piece */}
      {piece && (
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md">
          <Image 
            src={`/img/chesspieces/${piece}.png`}
            alt={piece}
            fill
            sizes="48px"
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
};

interface ChessBoardProps {
  fen: string;
  showCoordinates?: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ fen, showCoordinates = true }) => {
  const boardSize = 8;
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  let board = [];
  const piecePositions = parseFEN(fen);

  for (let y = 0; y < boardSize; y++) {
    let row = [];
    for (let x = 0; x < boardSize; x++) {
      const squareIndex = y * 8 + x;
      const isDarkSquare = (x + y) % 2 === 1;
      row.push(
        <Square
          key={`${x},${y}`}
          dark={isDarkSquare}
          piece={piecePositions[squareIndex]}
          file={files[x]}
          rank={8 - y}
          showCoordinates={showCoordinates}
        />
      );
    }
    board.push(
      <div key={y} className="flex">
        {row}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {/* Board shadow and border */}
      <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/20 to-transparent rounded-lg blur-sm" />
      <div className="relative rounded-lg overflow-hidden border border-amber-400/20 shadow-elevated">
        {board}
      </div>
    </div>
  );
};

function parseFEN(fen: string): Record<number, string> {
  const piecesMap = {
    'p': 'bP', 'r': 'bR', 'n': 'bN', 'b': 'bB', 'q': 'bQ', 'k': 'bK',
    'P': 'wP', 'R': 'wR', 'N': 'wN', 'B': 'wB', 'Q': 'wQ', 'K': 'wK',
  };
  const fenParts = fen.split(' ')[0];
  let squares: Record<number, string> = {};
  let row = 0, col = 0;

  for (const char of fenParts) {
    if (char === '/') {
      row++;
      col = 0;
    } else if (isFinite(parseInt(char))) {
      col += parseInt(char);
    } else {
      const squareIndex = row * 8 + col;
      squares[squareIndex] = piecesMap[char as keyof typeof piecesMap];
      col++;
    }
  }

  return squares;
}

export default ChessBoard;
