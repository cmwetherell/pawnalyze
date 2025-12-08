'use client'

import { useState } from 'react';
import ChessBoardManager from "@/components/elocator/ChessBoardManager";
import AnalyzeGame from "@/components/elocator/AnalyzeGame";
import Link from 'next/link';

export default function ElocatorPage() {
  const [analysisType, setAnalysisType] = useState('singlePosition');

  return (
    <div className="relative pt-32 pb-20">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="max-w-3xl">
          <div 
            className="
              inline-flex items-center gap-2 
              px-3 py-1.5 mb-4
              rounded-full
              bg-accent/10 
              border border-accent/20
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '100ms' }}
          >
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs text-accent font-medium uppercase tracking-wider">AI-Powered Analysis</span>
          </div>
          
          <h1 
            className="
              font-display text-display-md md:text-display-lg
              text-text-primary
              mb-6
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '200ms' }}
          >
            Elocator
          </h1>
          
          <p 
            className="
              text-lg text-text-secondary
              leading-relaxed
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '300ms' }}
          >
            Calculate the complexity of any chess position. Understand what makes 
            a position difficult for humans using our neural network trained on 
            100,000+ grandmaster moves.
          </p>
        </div>
      </section>

      {/* Mode Selector */}
      <section 
        className="mb-8 animate-fade-in-up opacity-0"
        style={{ animationDelay: '400ms' }}
      >
        <div className="inline-flex p-1.5 rounded-xl bg-bg-elevated border border-border-subtle">
          <button
            onClick={() => setAnalysisType('singlePosition')}
            className={`
              px-6 py-3 rounded-lg
              text-sm font-medium
              transition-all duration-300 ease-out-expo
              ${analysisType === 'singlePosition' 
                ? 'bg-accent text-bg-primary shadow-glow-sm' 
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            Single Position
          </button>
          <button
            onClick={() => setAnalysisType('fullGame')}
            className={`
              px-6 py-3 rounded-lg
              text-sm font-medium
              transition-all duration-300 ease-out-expo
              ${analysisType === 'fullGame' 
                ? 'bg-accent text-bg-primary shadow-glow-sm' 
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            Full Game
          </button>
        </div>
      </section>

      {/* Analysis Component */}
      <section 
        className="mb-16 animate-fade-in-up opacity-0"
        style={{ animationDelay: '500ms' }}
      >
        <div className="glass-card p-6 md:p-8">
          {analysisType === 'singlePosition' ? <ChessBoardManager /> : <AnalyzeGame />}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <h2 className="font-display text-heading-xl text-text-primary mb-8">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="
                w-10 h-10 
                rounded-lg 
                bg-accent/10 
                flex items-center justify-center
                text-accent font-bold
              ">
                1
              </div>
              <h3 className="font-display text-heading-md text-text-primary">
                Defining Complexity
              </h3>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Complexity is defined as the expected change in Win % after a move is made. 
              Imagine a position where white has a +1 advantage from Stockfish, implying 
              a 59% win rate. After a human plays a move, that advantage might change 
              based on how difficult the position was to navigate.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="
                w-10 h-10 
                rounded-lg 
                bg-accent/10 
                flex items-center justify-center
                text-accent font-bold
              ">
                2
              </div>
              <h3 className="font-display text-heading-md text-text-primary">
                Neural Network Analysis
              </h3>
            </div>
            <p className="text-text-secondary leading-relaxed">
              The underlying AI has been trained on 100,000+ chess moves made by grandmasters 
              in classical OTB games. It learns patterns that correlate with how much win 
              percentage typically changes after a move in similar positions.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="
                w-10 h-10 
                rounded-lg 
                bg-accent/10 
                flex items-center justify-center
                text-accent font-bold
              ">
                3
              </div>
              <h3 className="font-display text-heading-md text-text-primary">
                Real Examples
              </h3>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Over 20,000 moves, the data shows GMs lose about 1.4% win rate in positions 
              with a queen on the board, compared to 1.3% without. This means positions 
              are roughly 7% more complex when queens are present.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="
                w-10 h-10 
                rounded-lg 
                bg-accent/10 
                flex items-center justify-center
                text-accent font-bold
              ">
                4
              </div>
              <h3 className="font-display text-heading-md text-text-primary">
                Complexity Score
              </h3>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Each position receives a score from 1-10, where 1 is the least complex 
              and 10 is the most complex. This score predicts how challenging the 
              position will be for a human player to navigate correctly.
            </p>
          </div>
        </div>
      </section>

      {/* Example FENs */}
      <section className="mb-16">
        <h2 className="font-display text-heading-xl text-text-primary mb-6">
          Example Positions
        </h2>
        
        <div className="space-y-4">
          {[
            { 
              label: 'Low Complexity', 
              fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
              color: 'text-emerald-400'
            },
            { 
              label: 'Medium Complexity', 
              fen: '4rk2/ppp1qppp/3p2R1/8/4P3/2Q1R2P/PPP2PP1/6K1 b - - 0 1',
              color: 'text-yellow-400'
            },
            { 
              label: 'High Complexity', 
              fen: '2kr3r/ppqb4/3p1b1p/2pPnpp1/NPP1p1nP/6PB/PB2PPN1/2RQ1RK1 w - - 0 1',
              color: 'text-red-400'
            }
          ].map((example, index) => (
            <div 
              key={index}
              className="
                flex flex-col md:flex-row md:items-center gap-4
                p-4
                rounded-lg
                bg-bg-elevated
                border border-border-subtle
              "
            >
              <span className={`font-medium ${example.color} min-w-[140px]`}>
                {example.label}
              </span>
              <code className="
                flex-1
                px-3 py-2
                rounded
                bg-bg-primary
                text-text-secondary text-sm
                font-mono
                overflow-x-auto
              ">
                {example.fen}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Future Goals */}
      <section className="mb-16">
        <h2 className="font-display text-heading-xl text-text-primary mb-6">
          Future Development
        </h2>
        
        <div className="glass-card p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Improve complexity model with larger training datasets and better NN architectures (e.g., HalfKA)',
              'Develop mechanisms to convert complexity scores into game evaluations',
              'Create tournament scoring systems based on position complexity',
              'Build outlier detection for identifying potential cheating beyond certain percentiles'
            ].map((goal, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="
                  w-6 h-6 
                  rounded-full 
                  bg-accent/10 
                  flex items-center justify-center
                  text-accent text-xs font-bold
                  flex-shrink-0
                  mt-0.5
                ">
                  {index + 1}
                </div>
                <p className="text-text-secondary">{goal}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-border-subtle">
            <p className="text-text-secondary mb-4">
              Longer term, I view this as an opportunity for the chess community to develop 
              open source cheating detection, among other things.
            </p>
            <Link 
              href="https://github.com/cmwetherell/elocator"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2
                text-accent
                transition-colors duration-300
                hover:text-accent-light
              "
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>View on GitHub</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
