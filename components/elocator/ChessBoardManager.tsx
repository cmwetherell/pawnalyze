'use client';
import React, { useState } from 'react';
import ChessBoard from './ChessBoard'; // Adjust the path as necessary
import ComplexityBar from './ComplexityBar'; // Adjust the path as necessary
import ChessButton from '../Button';

const ChessBoardManager: React.FC = () => {
  const startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const [fen, setFen] = useState(startingFEN);
  const [complexityScore, setComplexityScore] = useState('');

  const fetchComplexityScore = async (fenStr: string) => {
    const url = 'https://elocator.fly.dev/complexity/';
    // ternary iperator, if fenStr = "", set to startingFEN, else set to fenStr
    fenStr = fenStr === "" ? startingFEN : fenStr;
    const data = JSON.stringify({ fen: fenStr });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        setComplexityScore(`${jsonResponse.complexity_score}`);
        console.log(complexityScore);
      } else {
        setComplexityScore('Error fetching complexity score');
      }
    } catch (error) {
      console.error('Error:', error);
      setComplexityScore('Error fetching complexity score');
    }
  };

  const updateBoard = () => {
    const fenInput = (document.getElementById('fenInput') as HTMLInputElement).value;
    // if fen = null, set to startingFEN, else set to fenInput
    if (fenInput === "") {
      setFen(startingFEN);
    }
    else {
      setFen(fenInput);
    }
    fetchComplexityScore(fenInput);
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm uppercase tracking-[0.4em] text-slate">Enter the FEN you&apos;d like to analyze</p>
      <input
        className="w-full rounded-2xl border border-white/15 bg-black/30 p-4 text-paper placeholder:text-slate focus:border-mint/60 focus:outline-none"
        type="text"
        placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        id="fenInput"
        defaultValue={""}
      />
      <ChessButton text="Get Complexity" onClick={updateBoard} />
      <div className="rounded-2xl border border-white/10 bg-ink-soft/70 p-4">
        <ChessBoard fen={fen} />
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-slate">
        {complexityScore !== null ? (
          <>
            <p className="text-paper">Complexity Score: {complexityScore}</p>
            <ComplexityBar score={Number(complexityScore)} />
          </>
        ) : (
          'Complexity score not available'
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 font-mono text-xs text-paper">
        Current FEN: {fen}
      </div>
    </div>
  );
};

export default ChessBoardManager;
