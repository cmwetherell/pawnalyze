'use client';

import { memo, useEffect, useRef } from 'react';

import { Section } from '@/components/layout/Section';
import { Split } from '@/components/layout/Split';
import { Button } from '@/components/ui/Button';
import { Delta } from '@/components/ui/Delta';
import { Panel } from '@/components/ui/Panel';
import { Slider } from '@/components/ui/Slider';
import { Stat } from '@/components/ui/Stat';
import { formatPct } from '@/lib/format';
import type { Players } from '@/lib/wcc/display';
import type { RatingOffsets } from '@/lib/wcc/model';
import { OFFSET_LIMIT, THETA_RANGE } from '@/lib/wcc/scenario';

export type GridState = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

interface Props {
  players: Players;
  offsets: RatingOffsets;
  theta: number;
  runTheta: number;
  onChange: (offsets: RatingOffsets, theta: number) => void;
  gridState: GridState;
  requestGrid: () => void;
  pWin1: number;
  basePWin1: number;
  drawRate: number;
  /** Sindarov's rating handicap (points) that makes the match a coin flip; null if outside the grid. */
  breakEven: { points: number; beyond: boolean } | null;
}

const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '±0');

/** Ratings and draw rate as sliders; the whole page recomputes. */
export const WhatIfLab = memo(function WhatIfLab({
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
    }, { rootMargin: '1200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [gridState, requestGrid]);

  const locked = gridState !== 'ready';
  const changed = offsets.g !== 0 || offsets.s !== 0 || Math.abs(theta - runTheta) > 1e-9;
  const rating = (id: 1 | 2, v: number) => `${players[id].ratings.classical + v} (${signed(v)})`;

  return (
    <Section
      id="what-if"
      title="What-if lab"
      finding="Exploratory, not a forecast. Nudge the ratings or the draw rate and the whole page recomputes exactly. Useful for asking how much the headline depends on the inputs."
      actions={changed ? <Button icon="reset" onClick={() => onChange({ g: 0, s: 0 }, runTheta)}>Reset lab</Button> : undefined}
    >
      <div ref={ref}>
        <Panel padding="md">
          <Split
            main={
              <div className="flex flex-col gap-y-4">
                <Slider
                  label={`${players[1].shortName} rating`} tone="p1" value={offsets.g} min={-OFFSET_LIMIT} max={OFFSET_LIMIT} step={5} marker={0} disabled={locked}
                  onChange={v => onChange({ ...offsets, g: v }, theta)} format={v => rating(1, v)}
                />
                <Slider
                  label={`${players[2].shortName} rating`} tone="p2" value={offsets.s} min={-OFFSET_LIMIT} max={OFFSET_LIMIT} step={5} marker={0} disabled={locked}
                  onChange={v => onChange({ ...offsets, s: v }, theta)} format={v => rating(2, v)}
                />
                <Slider
                  label="Draw propensity θ (classical)" value={theta} min={THETA_RANGE.min} max={THETA_RANGE.max} step={0.05} marker={runTheta}
                  onChange={v => onChange(offsets, v)} format={v => `θ ${v.toFixed(2)}, ${formatPct(drawRate, 0)} draws`}
                  hint={`The tick marks the fitted θ = ${runTheta.toFixed(2)}; θ = 1 is the raw game model.`}
                />
                <p className="type-small text-ink-2" aria-live="polite">
                  Rating changes apply to classical, rapid and blitz alike (shown: classical).
                  {gridState === 'loading' && ' Loading the rating grid…'}
                  {gridState === 'missing' && ' The rating grid for this model version is not available yet, so only θ can be changed.'}
                  {gridState === 'error' && ' The rating grid could not be loaded; only θ can be changed.'}
                </p>
              </div>
            }
            aside={
              <div className="flex flex-col gap-y-6 border-t border-line pt-6 lg:h-full lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <Stat size="lg" label={`${players[1].shortName} wins the match`} value={formatPct(pWin1)} delta={<Delta value={pWin1} base={basePWin1} />} />
                <div className="type-body text-ink-2">
                  <p className="type-label">Break-even</p>
                  <p className="mt-1">
                    {breakEven === null
                      ? (gridState === 'ready' ? 'Not reachable within the model’s rating range.' : 'Needs the rating grid.')
                      : <>{players[breakEven.points > 0 ? 2 : 1].shortName} would need to be <strong className="font-medium text-ink">{breakEven.beyond ? 'more than ' : ''}{Math.round(Math.abs(breakEven.points))} points</strong> weaker for a coin flip.</>}
                  </p>
                </div>
              </div>
            }
          />
        </Panel>
      </div>
    </Section>
  );
});
