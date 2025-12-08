'use client';
import React, { useState } from 'react';
import ChessBoard from './ChessBoard';
import ComplexityBar from './ComplexityBar';
import ChessButton from '../Button';

const ChessBoardManager: React.FC = () => {
  const startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const [fen, setFen] = useState(startingFEN);
  const [complexityScore, setComplexityScore] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComplexityScore = async (fenStr: string) => {
    const url = 'https://elocator.fly.dev/complexity/';
    fenStr = fenStr === "" ? startingFEN : fenStr;
    const data = JSON.stringify({ fen: fenStr });

    setIsLoading(true);
    setError('');

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
      } else {
        setError('Error fetching complexity score');
        setComplexityScore('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error fetching complexity score');
      setComplexityScore('');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBoard = () => {
    const fenInput = (document.getElementById('fenInput') as HTMLInputElement).value;
    if (fenInput === "") {
      setFen(startingFEN);
    } else {
      setFen(fenInput);
    }
    fetchComplexityScore(fenInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateBoard();
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="space-y-4">
        <label htmlFor="fenInput" className="block">
          <span className="text-ivory-100 font-medium mb-2 block">Enter FEN Position</span>
          <span className="text-obsidian-400 text-sm block mb-3">
            Paste a FEN string to analyze its complexity
          </span>
        </label>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            className="input-field flex-1 font-mono text-sm"
            type="text"
            placeholder={startingFEN}
            id="fenInput"
            defaultValue=""
            onKeyPress={handleKeyPress}
          />
          <ChessButton
            text={isLoading ? "Analyzing..." : "Analyze"}
            onClick={updateBoard}
            variant="primary"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Chess Board */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-auto flex justify-center">
          <ChessBoard fen={fen} />
        </div>

        {/* Results Panel */}
        <div className="flex-1 w-full space-y-6">
          {/* Complexity Score */}
          <div className="glass-card p-6">
            <h3 className="text-obsidian-400 text-sm uppercase tracking-wider mb-4">
              Complexity Score
            </h3>
            
            {error ? (
              <div className="text-red-400 text-sm">{error}</div>
            ) : isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
                <span className="text-obsidian-400">Analyzing position...</span>
              </div>
            ) : complexityScore ? (
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-amber-400">
                    {parseFloat(complexityScore).toFixed(1)}
                  </span>
                  <span className="text-obsidian-400 text-lg">/ 10</span>
                </div>
                <ComplexityBar score={Number(complexityScore)} />
                <p className="text-obsidian-400 text-sm">
                  {Number(complexityScore) < 3 
                    ? "This is a relatively straightforward position."
                    : Number(complexityScore) < 6
                    ? "This position has moderate complexity."
                    : Number(complexityScore) < 8
                    ? "This is a complex position that requires careful calculation."
                    : "This is a highly complex position where even GMs struggle."
                  }
                </p>
              </div>
            ) : (
              <p className="text-obsidian-400 text-sm">
                Enter a FEN and click Analyze to see the complexity score
              </p>
            )}
          </div>

          {/* Current FEN */}
          <div className="glass-card p-6">
            <h3 className="text-obsidian-400 text-sm uppercase tracking-wider mb-3">
              Current Position
            </h3>
            <code className="block text-ivory-100 font-mono text-sm break-all bg-obsidian-950/50 rounded-lg p-3 border border-white/[0.06]">
              {fen}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoardManager;
