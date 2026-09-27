'use client';

import { useEffect, useRef } from 'react';

import type { RatingOffsets } from '@/lib/wcc/model';
import { OFFSET_LIMIT, THETA_RANGE } from '@/lib/wcc/scenario';
import { DeltaChip, Section, formatPct, type Players } from './ui';

interface Props {
  players: Players;
  offsets: RatingOffsets;
  theta: number;
  runTheta: number;
  onChange: (offsets: RatingOffsets, theta: number) => void;
  gridState: 'idle' | 'loading' | 'ready' | 'missing' | 'error';
  requestGrid: () => void;
  pWin1: number;
  basePWin1: number;
  drawRate: number;
  /** Sindarov's rating handicap (points) that makes the match a coin flip; null if outside the grid. */
  breakEven: { points: number; beyond: boolean } | null;
}

function Slider({
  id, label, value, min, max, step, onChange, format, marker, color, disabled,
}: {
  id: string; label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string; marker?: number; color?: string; disabled?: boolean;
}) {
  const pos = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
          {color && <span aria-hidden className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />}
          {label}
        </label>
        <output htmlFor={id} className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">{format(value)}</output>
      </div>
      <div className="relative mt-1">
        {marker !== undefined && (
          <span aria-hidden className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded bg-chess-gold/70" style={{ left: `calc(${pos(marker)}% )` }} />
        )}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          className="relative w-full h-11 disabled:opacity-40 disabled:cursor-not-allowed accent-[rgb(var(--gold-ink-rgb))] cursor-pointer bg-transparent"
        />
      </div>
    </div>
  );
}

export default function WhatIfLab({
  players, offsets, theta, runTheta, onChange, gridState, requestGrid, pWin1, basePWin1, drawRate, breakEven,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Load the model grid only when the lab scrolls near the viewport.
  useEffect(() => {
    if (gridState !== 'idle') return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { requestGrid(); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { requestGrid(); io.disconnect(); }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [gridState, requestGrid]);

  const ratingsDisabled = gridState !== 'ready';
  const changed = offsets.g !== 0 || offsets.s !== 0 || Math.abs(theta - runTheta) > 1e-9;
  const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '±0');

  return (
    <Section
      id="what-if"
      eyebrow="Exploratory · not a forecast"
      title="What-if lab"
      description="Nudge the ratings or the draw rate and the whole page recomputes exactly. Useful for asking how much the headline depends on the inputs."
      action={
        changed ? (
          <button type="button" onClick={() => onChange({ g: 0, s: 0 }, runTheta)} className="h-10 px-3 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-chess-gold/40">
            Reset lab
          </button>
        ) : null
      }
    >
      <div ref={ref} className="grid md:grid-cols-[minmax(0,1fr)_260px] gap-6">
        <div className="space-y-4">
          <Slider
            id="wcc-g-offset" label={`${players[1].shortName} rating`} color="var(--wcc-p1)"
            value={offsets.g} min={-OFFSET_LIMIT} max={OFFSET_LIMIT} step={5}
            onChange={v => onChange({ ...offsets, g: v }, theta)}
            format={v => `${players[1].ratings.classical + v} (${signed(v)})`}
            marker={0}
            disabled={ratingsDisabled}
          />
          <Slider
            id="wcc-s-offset" label={`${players[2].shortName} rating`} color="var(--wcc-p2)"
            value={offsets.s} min={-OFFSET_LIMIT} max={OFFSET_LIMIT} step={5}
            onChange={v => onChange({ ...offsets, s: v }, theta)}
            format={v => `${players[2].ratings.classical + v} (${signed(v)})`}
            marker={0}
            disabled={ratingsDisabled}
          />
          <Slider
            id="wcc-theta" label="Draw propensity θ (classical)"
            value={theta} min={THETA_RANGE.min} max={THETA_RANGE.max} step={0.05}
            onChange={v => onChange(offsets, v)}
            format={v => `θ ${v.toFixed(2)} · ${formatPct(drawRate, 0)} draws`}
            marker={runTheta}
          />
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Rating changes apply to classical, rapid and blitz alike (shown: classical). The gold tick marks the fitted θ = {runTheta.toFixed(2)}; θ = 1 is the raw game model.
            {gridState === 'loading' && ' Loading the rating grid…'}
            {gridState === 'missing' && ' The rating grid for this model version is not available yet, so only θ can be changed.'}
            {gridState === 'error' && ' The rating grid could not be loaded; only θ can be changed.'}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--bg-surface-2)] p-4 flex flex-col gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{players[1].shortName} wins the match</p>
            <p className="font-heading text-4xl text-[var(--text-primary)]">{formatPct(pWin1)}</p>
            <DeltaChip value={pWin1} base={basePWin1} />
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Break-even</p>
            <p className="text-sm text-[var(--text-secondary)] leading-snug mt-0.5">
              {breakEven === null
                ? (gridState === 'ready' ? 'Not reachable within the model’s rating range.' : 'Needs the rating grid.')
                : breakEven.points > 0
                  ? <>{players[2].shortName} would need to be <strong className="text-[var(--text-primary)] tabular-nums">{breakEven.beyond ? 'more than ' : ''}{Math.round(breakEven.points)} points</strong> weaker for a coin flip.</>
                  : <>{players[1].shortName} would need to be <strong className="text-[var(--text-primary)] tabular-nums">{breakEven.beyond ? 'more than ' : ''}{Math.round(-breakEven.points)} points</strong> weaker for a coin flip.</>}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
