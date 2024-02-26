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
    <>
      <p className="text-2xl font-bold">Enter the FEN youd like to analyze below.</p>
      <input
      className="w-1/2 h-12 p-4 rounded-lg border-2 border-gray-300 text-black "
      type="text"
      placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      id="fenInput"
      defaultValue={""}
      />
      <ChessButton
        text="Get Complexity"
        onClick={updateBoard}
      />
      {/* <button className="bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-4 rounded mt-3 mb-3"
        onClick={updateBoard} style={{ padding: '5px 10px' }}>Get Complexity
      </button> */}
      <div className="mt-3"></div>
      <ChessBoard fen={fen} />
        
      <div id="complexityScore" style={{ marginTop: '10px' }}>
        {complexityScore !== null ? (
          <>
            Complexity Score: {complexityScore}
            <ComplexityBar score={Number(complexityScore)} />
          </>
        ) : (
          'Complexity score not available'
        )}
      </div>

      <div>
        Current FEN: {fen}
      </div>
    </>
  );
};

export default ChessBoardManager;
