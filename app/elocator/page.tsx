'use client'

import { useState } from 'react';
import ChessBoardManager from "@/components/elocator/ChessBoardManager";
import AnalyzeGame from "@/components/elocator/AnalyzeGame";
import ChessButton from '@/components/Button';

export default function Home() {
  const [analysisType, setAnalysisType] = useState('singlePosition');

  return (
    <main className="page-shell space-y-10">
      <section className="glass-panel space-y-6 p-6">
        <div className="flex flex-col gap-2 text-center">
          <span className="tag-pill mx-auto">Elocator</span>
          <h1 className="font-display text-3xl uppercase tracking-[0.35em] text-paper">
            Chess complexity calculator
          </h1>
          <p className="text-slate">
            Score a single position or replay an entire game to understand how volatile it felt for a human to navigate.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <ChessButton text="Single Position" onClick={() => setAnalysisType('singlePosition')} />
          <ChessButton text="Full Game" onClick={() => setAnalysisType('fullGame')} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          {analysisType === 'singlePosition' ? <ChessBoardManager /> : <AnalyzeGame />}
        </div>
      </section>

      <section className="glass-panel space-y-4 p-6 text-slate">
        <h2 className="font-display text-2xl uppercase tracking-[0.35em] text-paper">How it works</h2>
        <p>
          Elocator defines complexity as the expected change in win percentage immediately after a human move. A +1
          Stockfish evaluation implies a 59% score for white; the model estimates how far that percentage typically slides
          once a grandmaster plays their next move.
        </p>
        <p>
          Using more than 100,000 classical GM moves, we mapped each FEN to the drop in{" "}
          <a className="text-mint" href="https://lichess.org/page/accuracy" target="_blank" rel="noreferrer">
            win%
          </a>
          . A neural net then learns the expected loss per position, producing a 1–10 score that correlates with “this felt
          hard” moments.
        </p>
        <p>
          Queens on the board, imbalanced pawn shells, and open kings all contribute to sharper swings—the model quantifies
          those intuitions without needing an engine eval.
        </p>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs font-mono text-paper">
          <p>Example FENs</p>
          <p className="mt-2">Low: r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3</p>
          <p>Medium: 4rk2/ppp1qppp/3p2R1/8/4P3/2Q1R2P/PPP2PP1/6K1 b - - 0 1</p>
          <p>High: 2kr3r/ppqb4/3p1b1p/2pPnpp1/NPP1p1nP/6PB/PB2PPN1/2RQ1RK1 w - - 0 1</p>
        </div>
        <div>
          <p className="font-display text-lg uppercase tracking-[0.35em] text-paper">Roadmap</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Expand the training dataset and experiment with stronger architectures (HalfKA).</li>
            <li>Translate complexity scores into game-level narratives and tournament projections.</li>
            <li>Flag statistical outliers that can inform fair-play investigations.</li>
          </ol>
        </div>
        <p>
          Dive deeper into the math and data on{" "}
          <a className="text-mint" href="https://github.com/cmwetherell/elocator" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </section>
    </main>
  );
}
