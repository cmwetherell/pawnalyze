import { formatPct } from '@/lib/format';
import { fillClass, onClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';
import { trackGround } from './styles';

export interface SplitSegment {
  key: string;
  /** 0..1, share of the whole bar. */
  value: number;
  tone: Tone;
  label: string;
}

interface SplitBarProps {
  segments: SplitSegment[];
  height?: 8 | 12 | 20 | 32;
  /** inside: needs height 32. ends: the first and last segment, under the bar. */
  labels?: 'none' | 'inside' | 'ends';
  ariaLabel: string;
  /** 0..1: marker on the bar (a pre-scenario value). An inside label it would cross stands to the right of it. */
  tick?: number;
  className?: string;
}

/**
 * A label that does not fit its segment is not drawn (the segment is a container, so this needs no measuring: the maximum
 * width is either negative or enormous). `tickAt` is the tick's place in the segment, 0..1; `push` is how far past it the label starts.
 */
function insideStyle(text: string, tickAt: number | null) {
  // Two 6px sides, tabular digits of 8px, the percent sign.
  const need = 16 + 8 * text.length;
  const at = `100cqw * ${(tickAt ?? 0).toFixed(4)}`;
  const push = tickAt === null ? '0px' : `max(0px, min(${at} + 2px, (${need}px - ${at}) * 99))`;
  return { marginLeft: push, maxWidth: `calc((100cqw - ${need}px - ${push}) * 99)` };
}

const H = { 8: 'h-2', 12: 'h-3', 20: 'h-5', 32: 'h-8' } as const;

/** Parts of a whole: 2px gaps, the remainder on a sunken track. */
export function SplitBar({ segments, height = 12, labels = 'none', ariaLabel, tick, className }: SplitBarProps) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const rest = Math.max(0, 1 - total);
  const shown = segments.filter(s => s.value > 0);
  const first = segments[0];
  const last = segments[segments.length - 1];
  return (
    <div className={cn('min-w-0', className)}>
      <div role="img" aria-label={ariaLabel} className="relative">
        <div className={cn('flex w-full gap-0.5 overflow-hidden rounded-sm', H[height])}>
          {shown.map((s, i) => {
            const start = shown.slice(0, i).reduce((sum, x) => sum + x.value, 0);
            const tickAt = tick !== undefined && tick >= start && tick < start + s.value ? (tick - start) / s.value : null;
            const text = formatPct(s.value, 0);
            return (
              <div
                key={s.key}
                style={{ flexGrow: s.value, flexBasis: 0 }}
                className={cn('flex min-w-px items-center overflow-hidden transition-[flex-grow] duration-data', fillClass[s.tone], s.tone === 'level' && 'px-1', labels === 'inside' && '[container-type:inline-size]')}
              >
                {labels === 'inside' && height === 32 && s.value >= 0.08 && (
                  <span aria-hidden style={insideStyle(text, tickAt)} className="shrink-0 overflow-hidden">
                    <span className={cn('block whitespace-nowrap px-1.5 type-small font-semibold leading-none tnum', s.tone === 'level' ? 'bg-canvas py-1 text-ink group-data-[ground=surface]/ground:bg-surface' : onClass[s.tone])}>{text}</span>
                  </span>
                )}
              </div>
            );
          })}
          {rest > 0.0005 && <div style={{ flexGrow: rest, flexBasis: 0 }} className={cn('transition-[flex-grow] duration-data', trackGround)} />}
        </div>
        {tick !== undefined && <span aria-hidden className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-ink ring-1 ring-canvas transition-[left] duration-data" style={{ left: `${tick * 100}%` }} />}
      </div>
      {labels === 'ends' && first && (
        <div aria-hidden className="mt-1 flex justify-between gap-4 type-label text-ink-2 tnum">
          <span>{first.label} {formatPct(first.value)}</span>
          {segments.length > 1 && <span className="text-right">{last.label} {formatPct(last.value)}</span>}
        </div>
      )}
    </div>
  );
}
