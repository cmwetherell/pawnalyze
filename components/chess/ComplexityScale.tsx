import { complexityWord, fillClass } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

interface ComplexityScaleProps { /** 1 to 100. */ score: number; size?: 'lg' | 'sm'; /** The word and the number under the scale; off where a figure beside it already says them. */ words?: boolean; className?: string }

const STEPS = ['cx-1', 'cx-2', 'cx-3', 'cx-4'] as const;

/** Four teal segments, a marker, the word and "94 / 100". */
export function ComplexityScale({ score, size = 'sm', words = true, className }: ComplexityScaleProps) {
  const lg = size === 'lg';
  const at = Math.min(100, Math.max(0, score));
  const word = complexityWord(score);
  const shown = Math.round(score * 10) / 10;
  return (
    <div className={className}>
      <div role="img" aria-label={`${word}: ${shown} out of 100`} className={cn('relative', lg ? 'pt-3' : 'pt-2')}>
        <div className="grid grid-cols-4 gap-0.5">
          {STEPS.map(s => <span key={s} className={cn('block first:rounded-l-sm last:rounded-r-sm', lg ? 'h-3' : 'h-2', fillClass[s])} />)}
        </div>
        {/* A caret over the bar and a line through it, so the place reads in both themes. */}
        <span aria-hidden className="absolute inset-y-0 flex w-3 -translate-x-1/2 flex-col items-center transition-[left] duration-data" style={{ left: `clamp(2px, ${at}%, 100% - 2px)` }}>
          <svg viewBox="0 0 12 8" width={lg ? 12 : 8} height={lg ? 8 : 6} className="shrink-0 fill-ink"><path d="M0 0h12L6 8z" /></svg>
          <span className={cn('w-0.5 flex-1 bg-ink outline outline-1 outline-canvas', lg ? '-mt-0.5' : '-mt-px')} />
        </span>
      </div>
      {words && (
        <div aria-hidden className={cn('mt-2 flex justify-between gap-3 text-ink-2', lg ? 'type-data' : 'type-label')}>
          <span className="font-medium text-ink">{word}</span>
          <span className="tnum">{shown} / 100</span>
        </div>
      )}
    </div>
  );
}
