'use client'

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import ChessBoardManager from "@/components/elocator/ChessBoardManager";
import AnalyzeGame from "@/components/elocator/AnalyzeGame";
import ChessButton from '@/components/Button';


export default function Home() {
  // State to manage which component to show, default is ChessBoardManager
  const [analysisType, setAnalysisType] = useState('singlePosition');

  return (
    <main className="flex min-h-screen flex-col items-center px-6 lg:px-12 py-12">
      <title>Elocator: Chess Complexity Calculator</title>
      
      {/* Hero Section */}
      <section className="w-full max-w-6xl mb-12 text-center animate-fade-in-up">
        <div className="inline-block mb-4">
          <div className="h-px w-24 bg-gold mx-auto mb-4"></div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ivory mb-4">
            Elocator
            <span className="block text-gold mt-2">Chess Complexity Calculator</span>
          </h1>
          <div className="h-px w-24 bg-gold mx-auto mt-4"></div>
        </div>
        <p className="font-body text-lg text-ivory/70 max-w-2xl mx-auto mb-8">
          Analyze the complexity of chess positions using advanced neural network predictions
        </p>
      </section>

      {/* Mode Selection */}
      <section className="w-full max-w-6xl mb-12 animate-fade-in-up animate-delay-200">
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ChessButton
            text="Single Position"
            onClick={() => setAnalysisType('singlePosition')}
            variant={analysisType === 'singlePosition' ? 'primary' : 'secondary'}
            width="w-full sm:w-auto"
          />
          <ChessButton
            text="Full Game"
            onClick={() => setAnalysisType('fullGame')}
            variant={analysisType === 'fullGame' ? 'primary' : 'secondary'}
            width="w-full sm:w-auto"
          />
        </div>
      </section>

      {/* Analysis Component */}
      <section className="w-full max-w-6xl mb-16 animate-fade-in-up animate-delay-300">
        <div className="bg-charcoal/50 backdrop-blur-sm border border-gold/20 rounded-lg p-6 md:p-8 shadow-elegant">
          {analysisType === 'singlePosition' ? <ChessBoardManager /> : <AnalyzeGame />}
        </div>
      </section>

      {/* Information Section */}
      <section className="w-full max-w-4xl animate-fade-in-up animate-delay-400">
        <div className="bg-charcoal/30 backdrop-blur-sm border border-gold/20 rounded-lg p-8 md:p-12 shadow-soft">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gold mb-6">
            What is this? How does it work?
          </h2>
          
          <div className="prose prose-invert max-w-none font-body text-ivory/80 leading-relaxed space-y-4">
            <p>
              Elocator is a tool that calculates the complexity of a given chess position. It does this by
              analyzing the position and assigning a score from 1 to 10, with 1 being the least complex and
              10 being the most complex.
            </p>
            
            <p>
              How can we define the complexity of a chess position? There are many ways to do this, but I have chosen to define complexity as the <span className="text-gold font-semibold">expected change in Win % after a move is made</span>.
              Imagine a position where white has a +1 advantage from Stockfish. That implies a 59% win rate for white. Assuming Stockfish is perfect, a human can only play a move that is as good or worse than Stockfish (i.e., a move that does not increase the win rate for white).
              We know that after the next move is played, white will have a 59% or lower chance of winning.
            </p>
            
            <p>
              Depending on the position a grandmaster may find the best move, or maybe it is a really difficult position to find the best move.
              Over a large enough dataset, we can make correlations between the state of the board, and how much we expect the win % to go down after a move is made. As an example, over 20,000 moves, my data shows that a GM is expected to lose 1.4% win rate after a move is made in a position with
              a queen on the board, compared to 1.3% if there is no queen. So positions are about 7% more complex when there is a queen (1.4/1.3).
            </p>
            
            <div className="my-8 border-l-4 border-gold/50 pl-6">
              <p>
                I created a dataset of FENs mapped to the loss in <Link href="https://lichess.org/page/accuracy" className="text-gold hover:text-gold-light transition-elegant font-semibold underline decoration-gold/30 hover:decoration-gold">Win %</Link> from a GM that made a move in that position (classical OTB games only).
                Underlying this tool is a neural network (AI, deep learning, yada yada) that has been trained on 100,000 chess moves made by grandmasters.
                The model has learned to predict the complexity of a position by learning the expected change in Win % after a move is made, as measured by Stockfish 16 at depth 20.
              </p>
            </div>
            
            <p>
              The model is then used to predict the complexity of a given position. The model is not perfect, but it is a good starting point for understanding the complexity of a position.
              I look forward to making it better over time. Soon, I will publish some analytics around model performance.
            </p>
            
            <div className="my-8 bg-charcoal/50 rounded-lg p-6 border border-gold/20">
              <h3 className="font-display text-xl font-bold text-gold mb-4">Example FENs:</h3>
              <div className="space-y-3 font-mono text-sm">
                <div>
                  <span className="text-gold font-semibold">Low Complexity:</span>
                  <p className="text-ivory/70 mt-1 break-all">r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3</p>
                </div>
                <div>
                  <span className="text-gold font-semibold">Medium Complexity:</span>
                  <p className="text-ivory/70 mt-1 break-all">4rk2/ppp1qppp/3p2R1/8/4P3/2Q1R2P/PPP2PP1/6K1 b - - 0 1</p>
                </div>
                <div>
                  <span className="text-gold font-semibold">High Complexity:</span>
                  <p className="text-ivory/70 mt-1 break-all">2kr3r/ppqb4/3p1b1p/2pPnpp1/NPP1p1nP/6PB/PB2PPN1/2RQ1RK1 w - - 0 1</p>
                </div>
              </div>
            </div>
            
            <div className="my-8">
              <h3 className="font-display text-xl font-bold text-gold mb-4">Future Goals:</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Make the complexity model much better (incorporate a larger training dataset, a better NN structure, e.g. HalfKA)</li>
                <li>Find a mechanism to turn the complexity score into game evaluations</li>
                <li>Find a mechanism to turn a series of games into a tournament score</li>
                <li>Find a mechanism to identify outliers beyond some percentile (e.g., to identify cheating)</li>
              </ol>
            </div>
            
            <p>
              Longer term, I view this as an opportunity for the chess community to develop open source cheating detection, among other things.
            </p>
            
            <p className="mt-8">
              You can learn more about the model and the dataset by visiting the{' '}
              <Link 
                href="https://github.com/cmwetherell/elocator" 
                className="text-gold hover:text-gold-light transition-elegant font-semibold underline decoration-gold/30 hover:decoration-gold"
              >
                Elocator GitHub repository
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
