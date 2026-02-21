'use client'

import { useState } from "react";
import UnifiedAnalyzer from "@/components/elocator/UnifiedAnalyzer";

const GAME_OF_THE_CENTURY = `[Event "Third Rosenwald Trophy"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[EventDate "1956.10.07"]
[Round "8"]
[Result "0-1"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[ECO "D92"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "82"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5
6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4
11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3
16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+
21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1
26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5
31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+
36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+
41. Kc1 Rc2# 0-1`;

const GAME_OF_THE_CENTURY_MOVES = `1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 px-2.5 py-1 rounded text-xs font-medium transition-all bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:text-chess-gold hover:bg-chess-gold/10 border border-[var(--border)]"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function ElocatorPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8 w-full">
        <div className="h-px w-16 bg-chess-gold mb-6" />
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-chess-gold/10 text-chess-gold border border-chess-gold/20 mb-4">
          AI-Powered
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)] mb-3">
          Elocator: Chess Complexity Calculator
        </h1>
        <p className="text-[var(--text-muted)] max-w-2xl">
          Analyze the complexity of any chess position or game. Paste a FEN for single-position analysis
          or a PGN for full game analysis with move-by-move complexity charts.
        </p>
      </section>

      {/* Analyzer */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 w-full">
        <div className="surface-card p-6">
          <UnifiedAnalyzer />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 w-full">
        <h2 className="font-heading text-xl text-[var(--text-primary)] mb-6">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card p-4">
            <div className="w-8 h-8 rounded-full bg-chess-gold/10 flex items-center justify-center text-chess-gold font-heading text-sm mb-3">1</div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Position Analysis</h3>
            <p className="text-xs text-[var(--text-muted)]">The neural network analyzes board state features to predict position difficulty.</p>
          </div>
          <div className="surface-card p-4">
            <div className="w-8 h-8 rounded-full bg-chess-gold/10 flex items-center justify-center text-chess-gold font-heading text-sm mb-3">2</div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Expected Error</h3>
            <p className="text-xs text-[var(--text-muted)]">Complexity = expected change in win% after a GM plays. Harder positions = more error.</p>
          </div>
          <div className="surface-card p-4">
            <div className="w-8 h-8 rounded-full bg-chess-gold/10 flex items-center justify-center text-chess-gold font-heading text-sm mb-3">3</div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">1&ndash;10 Scale</h3>
            <p className="text-xs text-[var(--text-muted)]">Positions scored from 1 (simple) to 10 (extreme). Color-coded for quick reading.</p>
          </div>
          <div className="surface-card p-4">
            <div className="w-8 h-8 rounded-full bg-chess-gold/10 flex items-center justify-center text-chess-gold font-heading text-sm mb-3">4</div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Game Analysis</h3>
            <p className="text-xs text-[var(--text-muted)]">Paste a PGN for move-by-move complexity charts and evaluation graphs.</p>
          </div>
        </div>
      </section>

      {/* Example FENs */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 w-full">
        <h2 className="font-heading text-xl text-[var(--text-primary)] mb-4">Example positions</h2>
        <div className="space-y-2">
          {[
            { label: "Low", badgeClass: "bg-emerald-500/10 text-emerald-400", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3" },
            { label: "Med", badgeClass: "bg-amber-500/10 text-amber-400", fen: "4rk2/ppp1qppp/3p2R1/8/4P3/2Q1R2P/PPP2PP1/6K1 b - - 0 1" },
            { label: "High", badgeClass: "bg-red-500/10 text-red-400", fen: "2kr3r/ppqb4/3p1b1p/2pPnpp1/NPP1p1nP/6PB/PB2PPN1/2RQ1RK1 w - - 0 1" },
          ].map(({ label, badgeClass, fen }) => (
            <div key={label} className="surface-card p-3 flex items-center gap-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeClass}`}>{label}</span>
              <code className="text-xs text-[var(--text-muted)] font-mono truncate flex-1 min-w-0">{fen}</code>
              <CopyButton text={fen} />
            </div>
          ))}
        </div>
      </section>

      {/* Example PGN - Game of the Century */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 w-full">
        <h2 className="font-heading text-xl text-[var(--text-primary)] mb-4">Example game</h2>
        <div className="surface-card p-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                &ldquo;The Game of the Century&rdquo;
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Donald Byrne vs. Robert James Fischer &middot; Third Rosenwald Trophy, 1956
              </p>
            </div>
            <CopyButton text={GAME_OF_THE_CENTURY} />
          </div>
          <pre className="text-xs text-[var(--text-muted)] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">{GAME_OF_THE_CENTURY_MOVES}</pre>
        </div>
      </section>
    </main>
  );
}
