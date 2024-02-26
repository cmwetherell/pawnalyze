import React, { useEffect, useState } from 'react';
import Image from "next/image";

interface SquareProps {
    dark: boolean;
    piece?: string;
  }
  
  const Square: React.FC<SquareProps> = ({ dark, piece }) => {
    const fill = dark ? 'green' : 'white'; // Change 'black' to 'orange' for dark squares
    const style = {
      backgroundColor: fill,
      width: '50px',
      height: '50px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
  
    return (
      <div style={style}>
        {piece && <Image 
        src={`/img/chesspieces/${piece}.png`}
        alt={piece}
        width = {50}
        height = {50}
        />}
      </div>
    );
  };
  

  interface ChessBoardProps {
    fen: string; // Add this prop to allow passing a FEN string
  }
  
  const ChessBoard: React.FC<ChessBoardProps> = ({ fen }) => {
    const boardSize = 8;
    let board = [];
    const piecePositions = parseFEN(fen); // Parse the FEN string
  
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
          />
        );
      }
      board.push(<div key={y} style={{ display: 'flex' }}>{row}</div>);
    }
  
    return <div>{board}</div>;
  };

function parseFEN(fen: string): Record<number, string> {
    const piecesMap = {
      'p': 'bP', 'r': 'bR', 'n': 'bN', 'b': 'bB', 'q': 'bQ', 'k': 'bK',
      'P': 'wP', 'R': 'wR', 'N': 'wN', 'B': 'wB', 'Q': 'wQ', 'K': 'wK',
    };
    const fenParts = fen.split(' ')[0]; // Get the piece placement data from the FEN
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
