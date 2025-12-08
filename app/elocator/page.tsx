'use client'

import { useState } from 'react';
import Link from "next/link";
import ChessBoardManager from "@/components/elocator/ChessBoardManager";
import AnalyzeGame from "@/components/elocator/AnalyzeGame";
import ChessButton from '@/components/Button';

export default function ElocatorPage() {
  const [analysisType, setAnalysisType] = useState<'singlePosition' | 'fullGame'>('singlePosition');

  const exampleFens = [
    { label: "Low Complexity", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3" },
    { label: "Medium Complexity", fen: "4rk2/ppp1qppp/3p2R1/8/4P3/2Q1R2P/PPP2PP1/6K1 b - - 0 1" },
    { label: "High Complexity", fen: "2kr3r/ppqb4/3p1b1p/2pPnpp1/NPP1p1nP/6PB/PB2PPN1/2RQ1RK1 w - - 0 1" },
  ];

  return (
    <main className="min-h-screen pt-28 pb-20">
      <title>Elocator: Chess Complexity Calculator | Pawnalyze</title>
      
      <div className="section-container">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">AI-Powered Analysis</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-ivory-100 mb-6">
            Elocator
          </h1>
          
          <p className="text-obsidian-300 text-lg max-w-2xl mx-auto">
            Calculate the complexity of any chess position. Powered by a neural network 
            trained on 100,000+ grandmaster moves.
          </p>
        </div>

        {/* Analysis Type Toggle */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setAnalysisType('singlePosition')}
            className={`
              px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300
              ${analysisType === 'singlePosition'
                ? 'bg-amber-400 text-obsidian-950'
                : 'bg-white/[0.03] text-obsidian-300 border border-white/[0.06] hover:border-amber-400/30 hover:text-ivory-100'
              }
            `}
          >
            Single Position
          </button>
          <button
            onClick={() => setAnalysisType('fullGame')}
            className={`
              px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300
              ${analysisType === 'fullGame'
                ? 'bg-amber-400 text-obsidian-950'
                : 'bg-white/[0.03] text-obsidian-300 border border-white/[0.06] hover:border-amber-400/30 hover:text-ivory-100'
              }
            `}
          >
            Full Game
          </button>
        </div>

        {/* Main Analysis Area */}
        <div className="glass-card p-6 md:p-8 mb-16">
          {analysisType === 'singlePosition' ? <ChessBoardManager /> : <AnalyzeGame />}
        </div>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ivory-100 mb-4">
              How Does It Work?
            </h2>
            <p className="text-obsidian-400 max-w-2xl mx-auto">
              Elocator calculates complexity by predicting how much a grandmaster is expected 
              to lose in win percentage after making a move in a given position.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Explanation */}
            <div className="glass-card p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold text-ivory-100 mb-4">
                Defining Complexity
              </h3>
              <div className="space-y-4 text-obsidian-300 text-sm leading-relaxed">
                <p>
                  How can we define the complexity of a chess position? I&apos;ve chosen to define 
                  complexity as the <span className="text-amber-400">expected change in Win %</span> after 
                  a move is made.
                </p>
                <p>
                  Imagine a position where white has a +1 advantage from Stockfish, implying a 59% win rate. 
                  Assuming Stockfish is perfect, a human can only play a move that is as good or worse.
                </p>
                <p>
                  Over a large dataset, we can correlate board states with expected win % loss. For example, 
                  positions with a queen on the board are about 7% more complex than those without.
                </p>
              </div>
            </div>

            {/* Technical Details */}
            <div className="glass-card p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold text-ivory-100 mb-4">
                The Model
              </h3>
              <div className="space-y-4 text-obsidian-300 text-sm leading-relaxed">
                <p>
                  Underlying this tool is a neural network trained on <span className="text-amber-400">100,000+ 
                  chess moves</span> made by grandmasters in classical OTB games.
                </p>
                <p>
                  The model learned to predict complexity by analyzing the expected change in Win % after 
                  a move, as measured by Stockfish 16 at depth 20.
                </p>
                <p>
                  The complexity score ranges from 1-10, with higher scores indicating positions where 
                  even grandmasters are expected to lose significant winning chances.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Positions */}
        <section className="mb-16">
          <h3 className="font-display text-xl font-semibold text-ivory-100 mb-6 text-center">
            Example Positions
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {exampleFens.map((example, index) => (
              <div key={index} className="glass-card p-4">
                <div className={`
                  inline-block px-3 py-1 rounded-full text-xs font-medium mb-3
                  ${example.label === 'Low Complexity' ? 'bg-green-400/10 text-green-400' :
                    example.label === 'Medium Complexity' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-red-400/10 text-red-400'}
                `}>
                  {example.label}
                </div>
                <code className="block text-obsidian-400 text-xs font-mono break-all">
                  {example.fen}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* Future Goals */}
        <section className="glass-card p-6 md:p-8">
          <h3 className="font-display text-xl font-semibold text-ivory-100 mb-6 text-center">
            Roadmap
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Better Model", desc: "Larger training dataset, improved NN structure (e.g., HalfKA)" },
              { title: "Game Evaluations", desc: "Convert complexity scores into comprehensive game evaluations" },
              { title: "Tournament Scoring", desc: "Aggregate game analyses into tournament-level insights" },
              { title: "Outlier Detection", desc: "Identify statistical anomalies for integrity analysis" },
            ].map((goal, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <span className="font-display font-bold">{index + 1}</span>
                </div>
                <h4 className="text-ivory-100 font-medium mb-2">{goal.title}</h4>
                <p className="text-obsidian-400 text-sm">{goal.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-obsidian-400 text-sm mb-4">
              Long term, I view this as an opportunity for the chess community to develop open source 
              cheating detection and analysis tools.
            </p>
            <Link
              href="https://github.com/cmwetherell/elocator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              View on GitHub
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
