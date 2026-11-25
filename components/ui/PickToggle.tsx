'use client';

import { formatPct } from '@/lib/format';
import { fillClass, onClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';
import { Avatar } from './Avatar';

export interface PickOption<V extends string> {
  value: V;
  /** Full words for assistive tech. */
  label: string;
  face?: { src: string; name: string };
  /** "½", "1", "0", "=" */
  glyph?: string;
  /** 0..1 */
  pct?: number;
  tone: Tone;
  preview?: string;
}

export interface PickToggleProps<V extends string> {
  legend: string;
  options: PickOption<V>[];
  value: V | null;
  onChange(v: V | null): void;
  onPreview?(v: V | null): void;
  size?: 'lg' | 'sm';
  disabled?: boolean;
  className?: string;
}

/** The outline and hatch fills would read as "not picked" here, so a picked loss takes a heavy ink edge instead. */
const picked = (tone: Tone) => (tone === 'loss' || tone === 'level' ? 'border-ink bg-sunken text-ink ring-1 ring-inset ring-ink' : cn('border-transparent', fillClass[tone], onClass[tone]));

/** Equal cells, one per outcome. Press the picked one again to clear it. */
export function PickToggle<V extends string>({ legend, options, value, onChange, onPreview, size = 'lg', disabled = false, className }: PickToggleProps<V>) {
  const lg = size === 'lg';
  return (
    <div
      role="group"
      aria-label={legend}
      className={cn('grid auto-cols-fr grid-flow-col gap-1', className)}
      onPointerLeave={onPreview ? () => onPreview(null) : undefined}
    >
      {options.map(o => {
        const on = o.value === value;
        const pct = o.pct === undefined ? null : formatPct(o.pct, 0);
        return (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            aria-label={`${legend}: ${o.label}${pct ? `, ${pct}` : ''}${o.preview ? `. ${o.preview}` : ''}`}
            title={o.face?.name ?? o.label}
            onClick={() => { onChange(on ? null : o.value); onPreview?.(null); }}
            onPointerEnter={onPreview ? e => { if (e.pointerType === 'mouse' && !disabled) onPreview(o.value); } : undefined}
            // Keyboard focus only: a tap focuses after the pointer has left, and nothing would clear the preview.
            onFocus={onPreview ? e => { if (e.currentTarget.matches(':focus-visible')) onPreview(o.value); } : undefined}
            onBlur={onPreview ? () => onPreview(null) : undefined}
            className={cn(
              'flex min-w-0 touch-manipulation flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm border px-0.5 transition-colors duration-in active:translate-y-px',
              'focus-visible:z-10 focus-visible:outline-offset-1 focus-visible:outline-ink disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50',
              lg ? 'h-[60px]' : 'h-tap',
              on ? picked(o.tone) : 'border-control bg-raised text-ink hover:bg-sunken disabled:hover:bg-raised',
            )}
          >
            {lg && o.face
              ? <Avatar name={o.face.name} src={o.face.src} size={24} mono decorative className="h-[26px] w-[26px]" />
              : <span className={cn('max-w-full truncate', lg && o.glyph ? 'flex h-[26px] items-center type-h3' : 'type-ui', on && !lg && 'font-semibold')}>{o.glyph ?? o.label}</span>}
            {lg && pct && <span className="type-label font-medium leading-tight tnum">{pct}</span>}
          </button>
        );
      })}
    </div>
  );
}
