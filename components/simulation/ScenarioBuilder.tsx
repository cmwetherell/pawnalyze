'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import GamePickerCard from './GamePickerCard';
import { Game } from '@/types';
import candResByRound from '@/public/candResByRound.json';
import womensCandByRound from '@/public/womensCandByRound.json';
import candResByRound2026 from '@/public/candResByRound2026.json';
import womensCandByRound2026 from '@/public/womensCandByRound2026.json';

interface ScenarioBuilderProps {
  eventTable: string;
  onGameFilterChange: (games: Game[]) => void;
  onSubmit: () => void;
  loading: boolean;
}

function getInitialGames(eventTable: string): { round: number; games: Game[] }[] {
  if (eventTable === 'candidates_2026') return candResByRound2026;
  if (eventTable === 'womens_candidates_2026') return womensCandByRound2026;
  if (eventTable === 'candidates_2024') return candResByRound;
  return womensCandByRound;
}

export default function ScenarioBuilder({
  eventTable,
  onGameFilterChange,
  onSubmit,
  loading,
}: ScenarioBuilderProps) {
  const initialGames = useMemo(() => getInitialGames(eventTable), [eventTable]);

  const [gamesWithOutcomes, setGamesWithOutcomes] = useState<Game[]>([]);
  const [activeRound, setActiveRound] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const isRoundCompleted = (games: Game[]) =>
    games.every(g => g.hasOwnProperty('outcome') && g.outcome !== null);

  const incompleteRounds = useMemo(
    () => initialGames.filter(r => !isRoundCompleted(r.games)),
    [initialGames],
  );

  useEffect(() => {
    if (activeRound === null && incompleteRounds.length > 0) {
      setActiveRound(incompleteRounds[0].round);
    }
  }, [incompleteRounds, activeRound]);

  useEffect(() => {
    onGameFilterChange(gamesWithOutcomes);
  }, [gamesWithOutcomes, onGameFilterChange]);

  const handleOutcomeChange = (gameId: string, outcome: 'white' | 'draw' | 'black' | null) => {
    setGamesWithOutcomes(prev => {
      const idx = prev.findIndex(g => g.id === gameId);
      if (idx > -1 && outcome === null) {
        return prev.filter((_, i) => i !== idx);
      } else if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], outcome };
        return updated;
      } else if (outcome !== null) {
        const game = initialGames.flatMap(r => r.games).find(g => g.id === gameId);
        if (game) return [...prev, { ...game, outcome }];
      }
      return prev;
    });
  };

  const totalSelections = gamesWithOutcomes.length;
  const roundsWithSelections = new Set(gamesWithOutcomes.map(g => g.round)).size;

  const roundHasSelection = (round: number) =>
    gamesWithOutcomes.some(g => g.round === round);

  const getOutcome = (gameId: string) =>
    gamesWithOutcomes.find(g => g.id === gameId)?.outcome as
      | 'white'
      | 'draw'
      | 'black'
      | null ?? null;

  const activeRoundData = incompleteRounds.find(r => r.round === activeRound);

  const handleReset = () => {
    setGamesWithOutcomes([]);
  };

  // Round tab scrolling + drag
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const updateScrollArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollArrows, { passive: true });
    const ro = new ResizeObserver(updateScrollArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollArrows);
      ro.disconnect();
    };
  }, [updateScrollArrows, incompleteRounds]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      dragging.current = true;
      didDrag.current = false;
      dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      if (Math.abs(dx) > 4) didDrag.current = true;
      el.scrollLeft = dragStart.current.scrollLeft - dx;
    };
    const onMouseUp = () => { dragging.current = false; };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile collapse toggle */}
      <button
        className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-[var(--bg-surface-2)] border-b border-[var(--border)]"
        onClick={() => setCollapsed(c => !c)}
      >
        <span className="font-semibold text-[var(--text-secondary)] text-sm">
          Scenario Builder
          {totalSelections > 0 && (
            <span className="ml-2 text-xs text-[var(--text-muted)]">
              {totalSelections} selected
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`flex flex-col flex-1 ${collapsed ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-lg font-heading text-[var(--text-primary)]">Scenario Builder</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Select game outcomes to simulate custom scenarios
          </p>
        </div>

        {/* Round tabs */}
        <div className="flex items-center gap-1 px-2 pb-2">
          <button
            onClick={() => scrollBy(-1)}
            className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
              canScrollLeft
                ? 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
                : 'text-[var(--border)] cursor-default'
            }`}
            disabled={!canScrollLeft}
            aria-label="Scroll rounds left"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-1 overflow-x-auto scrollbar-none py-1 flex-1 select-none cursor-grab active:cursor-grabbing"
          >
            {incompleteRounds.map(r => {
              const isActive = r.round === activeRound;
              const hasSel = roundHasSelection(r.round);
              return (
                <button
                  key={r.round}
                  onClick={() => { if (!didDrag.current) setActiveRound(r.round); }}
                  className={`relative shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors select-none ${
                    isActive
                      ? 'bg-chess-gold text-chess-dark'
                      : hasSel
                        ? 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-chess-gold/30'
                        : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  R{r.round}
                  {hasSel && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-chess-gold" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollBy(1)}
            className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
              canScrollRight
                ? 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
                : 'text-[var(--border)] cursor-default'
            }`}
            disabled={!canScrollRight}
            aria-label="Scroll rounds right"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Game cards */}
        <div className="flex-1 overflow-y-auto px-4 pt-1 space-y-1.5 pb-2">
          {activeRoundData?.games.map(game => (
            <GamePickerCard
              key={game.id}
              whitePlayer={game.whitePlayer}
              blackPlayer={game.blackPlayer}
              selectedOutcome={getOutcome(game.id)}
              onOutcomeChange={(outcome) => handleOutcomeChange(game.id, outcome)}
            />
          ))}
        </div>

        {/* Selection summary */}
        {totalSelections > 0 && (
          <div className="px-4 py-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">
              {totalSelections} game{totalSelections !== 1 ? 's' : ''} selected
              {roundsWithSelections > 1 && ` across ${roundsWithSelections} rounds`}
            </p>
          </div>
        )}

        {/* Action bar */}
        <div className="px-4 py-3 border-t border-[var(--border)] flex gap-2 mt-auto">
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              loading
                ? 'bg-[var(--bg-surface-3)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-chess-gold text-chess-dark hover:bg-chess-gold-light hover:shadow-gold active:bg-chess-gold-dark'
            }`}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {loading ? 'Simulating...' : 'Simulate'}
          </button>
          {totalSelections > 0 && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
