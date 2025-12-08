'use client'

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import ChessBoardManager from "@/components/elocator/ChessBoardManager";
import AnalyzeGame from "@/components/elocator/AnalyzeGame";
import ChessButton from '@/components/Button';

export default function ElocatorPage() {
  const [analysisType, setAnalysisType] = useState('singlePosition');

  return (
    <main className="flex min-h-screen flex-col relative z-10">
      <section className="relative px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-luxury-gold text-center mb-4 animate-fade-in-up">
            Elocator
          </h1>
          <p className="text-xl md:text-2xl text-luxury-cream/70 font-body text-center mb-12 animate-fade-in-up-delay-1">
            Chess Complexity Calculator
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12 animate-fade-in-up-delay-2">
            <ChessButton
              text="Single Position"
              onClick={() => setAnalysisType('singlePosition')}
              variant={analysisType === 'singlePosition' ? 'primary' : 'secondary'}
            />
            <ChessButton
              text="Full Game"
              onClick={() => setAnalysisType('fullGame')}
              variant={analysisType === 'fullGame' ? 'primary' : 'secondary'}
            />
          </div>

          <div className="relative bg-luxury-charcoal/40 backdrop-blur-sm border border-luxury-amber/20 rounded-lg p-8 lg:p-12 shadow-luxury mb-16">
            {analysisType === 'singlePosition' ? <ChessBoardManager /> : <AnalyzeGame />}
          </div>
        </div>
      </section>

      <div className="decorative-line max-w-4xl mx-auto" />

      <section className="relative px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-luxury-gold mb-8">
            What is this? How does it work?
          </h2>
          
          <div className="prose prose-invert prose-lg max-w-none space-y-6">
            <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
              Elocator is a tool that calculates the complexity of a given chess position. It does this by
              analyzing the position and assigning a score from 1 to 10, with 1 being the least complex and
              10 being the most complex.
            </p>
            
            <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
              How can we define the complexity of a chess position? There are many ways to do this, but I have chosen to define complexity as the expected change in Win % after a move is made.
              Imagine a position where white has a +1 advantage from Stockfish. That implies a 59% win rate for white. Assuming Stockfish is perfect, a human can only play a move that is as good or worse than Stockfish (i.e., a move that does not increase the win rate for white).
              We know that after the next move is played, white will have a 59% or lower chance of winning.
            </p>
            
            <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
              Depending on the position a grandmaster may find the best move, or maybe it is a really difficult position to find the best move.
              Over a large enough dataset, we can make correlations between the state of the board, and how much we expect the win % to go down after a move is made. As an example, over 20,000 moves, my data shows that a GM is expected to lose 1.4% win rate after a move is made in a position with
              a queen on the board, compared to 1.3% if there is no queen. So positions are about 7% more complex when there is a queen (1.4/1.3).
            </p>
            
            <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
              I created a dataset of FENs mapped to the loss in{' '}
              <Link 
                href="https://lichess.org/page/accuracy" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-gold hover:text-luxury-amber transition-colors duration-300 underline decoration-luxury-amber/50 hover:decoration-luxury-amber underline-offset-4"
              >
                Win %
              </Link>{' '}
              from a GM that made a move in that position (classical OTB games only).
              Underlying this tool is a neural network (AI, deep learning, yada yada) that has been trained on 100,000 chess moves made by grandmasters.
              The model has learned to predict the complexity of a position by learning the expected change in Win % after a move is made, as measured by Stockfish 16 at depth 20.
            </p>
            
            <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
              The model is then used to predict the complexity of a given position. The model is not perfect, but it is a good starting point for understanding the complexity of a position.
              I look forward to making it better over time. Soon, I will publish some analytics around model performance.
            </p>

            <div className="mt-8 pt-8 border-t border-luxury-amber/20">
              <h3 className="font-display text-2xl font-bold text-luxury-gold mb-4">
                Example FENs
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div>
                  <span className="text-luxury-amber font-semibold">Low Complexity:</span>
                  <p className="text-luxury-cream/70 mt-1 break-all">r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3</p>
                </div>
                <div>
                  <span className="text-luxury-amber font-semibold">Medium Complexity:</span>
                  <p className="text-luxury-cream/70 mt-1 break-all">4rk2/ppp1qppp/3p2R1/8/4P3/2Q1R2P/PPP2PP1/6K1 b - - 0 1</p>
                </div>
                <div>
                  <span className="text-luxury-amber font-semibold">High Complexity:</span>
                  <p className="text-luxury-cream/70 mt-1 break-all">2kr3r/ppqb4/3p1b1p/2pPnpp1/NPP1p1nP/6PB/PB2PPN1/2RQ1RK1 w - - 0 1</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-luxury-amber/20">
              <h3 className="font-display text-2xl font-bold text-luxury-gold mb-4">
                Future Goals
              </h3>
              <ul className="space-y-3 text-luxury-cream/90 font-body text-lg">
                <li className="flex items-start">
                  <span className="text-luxury-amber mr-3">1.</span>
                  <span>Make the complexity model much better (incorporate a larger training dataset, a better NN structure, e.g. HalfKA)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-luxury-amber mr-3">2.</span>
                  <span>Find a mechanism to turn the complexity score into game evaluations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-luxury-amber mr-3">3.</span>
                  <span>Find a mechanism to turn a series of games into a tournament score</span>
                </li>
                <li className="flex items-start">
                  <span className="text-luxury-amber mr-3">4.</span>
                  <span>Find a mechanism to identify outliers beyond some percentile (e.g., to identify cheating)</span>
                </li>
              </ul>
              <p className="text-luxury-cream/90 font-body text-lg leading-relaxed mt-6">
                Longer term, I view this as an opportunity for the chess community to develop open source cheating detection, among other things.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-luxury-amber/20">
              <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
                You can learn more about the model and the dataset by visiting the{' '}
                <Link 
                  href="https://github.com/cmwetherell/elocator" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-luxury-gold hover:text-luxury-amber transition-colors duration-300 underline decoration-luxury-amber/50 hover:decoration-luxury-amber underline-offset-4"
                >
                  Elocator GitHub repository
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
