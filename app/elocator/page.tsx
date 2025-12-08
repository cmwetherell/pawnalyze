'use client'

import { useState } from 'react';
import ChessBoardManager from "@/components/elocator/ChessBoardManager";
import AnalyzeGame from "@/components/elocator/AnalyzeGame";
import ChessButton from '@/components/Button';

const copyBlocks = [
  {
    title: 'Why complexity matters',
    text:
      'Define chaos as the expected drop in win percentage after a human move. Elocator measures it using 100K+ grandmaster decisions checked against Stockfish 16 depth 20.',
  },
  {
    title: 'What you get',
    text:
      'Single-position probes, full game sweeps, and broadcast overlays that turn nebulous positions into digestible stories.',
  },
  {
    title: 'Use the data',
    text:
      'Prep seconds, commentators, and integrity analysts leverage Elocator to spot volatility spikes and story-worthy errors.',
  },
];

export default function Home() {
  const [analysisType, setAnalysisType] = useState<'singlePosition' | 'fullGame'>('singlePosition');

  return (
    <main className="container space-y-12 py-16">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Elocator</p>
          <h1 className="font-display text-5xl text-sand">Chess complexity calculator</h1>
          <p className="text-lg text-sand-muted">
            Toggle between single-position probes and full-game sweeps. The Elocator neural net estimates how costly a move
            is likely to be for real humans, not engines.
          </p>
          <div className="flex flex-wrap gap-4">
            <ChessButton text="View GitHub" link="https://github.com/cmwetherell/elocator" variant="secondary" />
            <ChessButton text="Broadcast overlay" link="/elocator/broadcast" variant="ghost" />
          </div>
        </div>
        <div className="rounded-4xl border border-white/10 bg-black/30 p-6">
          <div className="grid gap-4 text-sm text-sand-muted">
            {copyBlocks.map((block) => (
              <div key={block.title}>
                <p className="text-xs uppercase tracking-[0.4em] text-amber">{block.title}</p>
                <p className="mt-2">{block.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-white/10 bg-black/30 p-6 shadow-subtle">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className={`rounded-2xl border px-4 py-2 text-xs uppercase tracking-[0.4em] transition ${
              analysisType === 'singlePosition'
                ? 'border-mint text-mint'
                : 'border-white/10 text-sand-muted'
            }`}
            onClick={() => setAnalysisType('singlePosition')}
          >
            Single Position
          </button>
          <button
            type="button"
            className={`rounded-2xl border px-4 py-2 text-xs uppercase tracking-[0.4em] transition ${
              analysisType === 'fullGame'
                ? 'border-mint text-mint'
                : 'border-white/10 text-sand-muted'
            }`}
            onClick={() => setAnalysisType('fullGame')}
          >
            Full Game
          </button>
        </div>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          {analysisType === 'singlePosition' ? <ChessBoardManager /> : <AnalyzeGame />}
        </div>
      </section>

      <section className="space-y-4 text-base text-sand-muted">
        <h2 className="font-display text-3xl text-sand">How it works</h2>
        <p>
          Complexity is the expected swing in win percentage immediately after a move, benchmarked by Stockfish 16 at depth
          20. Queens on board usually increase chaos by 7% because grandmasters shed more win probability when options
          explode.
        </p>
        <p>
          Training data is classical OTB only, keeping signal-to-noise clean. Future releases will surface per-player
          baselines, anomaly detectors, and integrations with tournament broadcasts.
        </p>
      </section>
    </main>
  );
}
