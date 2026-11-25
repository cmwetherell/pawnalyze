'use client';

import { useId } from 'react';

import { fillClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  tone?: Tone;
  /** A value to mark on the track (for example the fitted one). */
  marker?: number;
  /** Under the track: what the marker is, what the range means. */
  hint?: string;
  disabled?: boolean;
  className?: string;
}

/** Native range over a drawn track: 24px thumb, 44px hit area, all the native keys. */
export function Slider({ label, value, min, max, step, onChange, format, tone = 'ink', marker, hint, disabled = false, className }: SliderProps) {
  const id = useId();
  const share = (v: number) => Math.min(1, Math.max(0, (v - min) / (max - min)));
  // The centre of a 24px thumb travels between 12px from either end.
  const at = (v: number) => `calc(12px + (100% - 24px) * ${share(v)})`;
  return (
    <div className={cn(disabled && 'opacity-50', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="type-ui text-ink">{label}</label>
        <output htmlFor={id} className="type-data font-medium text-ink">{format(value)}</output>
      </div>
      <div className="relative flex h-tap items-center">
        <input
          id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
          aria-valuetext={format(value)} aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={e => onChange(Number(e.target.value))}
          className="peer absolute inset-0 m-0 h-full w-full cursor-pointer touch-pan-y appearance-none opacity-0 disabled:cursor-not-allowed [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none"
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 h-1.5 overflow-hidden rounded-sm bg-sunken ring-1 ring-inset ring-control">
          <span className={cn('absolute inset-y-0 left-0', fillClass[tone])} style={{ width: at(value) }} />
        </span>
        {marker !== undefined && <span aria-hidden className="pointer-events-none absolute h-4 w-0.5 -translate-x-1/2 bg-ink-3" style={{ left: at(marker) }} />}
        <span
          aria-hidden
          className="pointer-events-none absolute grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border border-control bg-raised transition-colors duration-in peer-hover:border-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-active:border-ink peer-active:bg-sunken"
          style={{ left: at(value) }}
        >
          <span className={cn('h-3 w-3 rounded-full', fillClass[tone])} />
        </span>
      </div>
      {hint && <p id={`${id}-hint`} className="type-label text-ink-3">{hint}</p>}
    </div>
  );
}
