'use client';

import type { ReactNode } from 'react';

import { PickToggle, type PickOption } from '@/components/ui/PickToggle';
import { SplitBar, type SplitSegment } from '@/components/ui/SplitBar';
import { goldLine, hoverGround } from '@/components/ui/styles';
import { formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface MatchSide {
  /** Flag or Avatar. */
  lead?: ReactNode;
  name: string;
  meta?: ReactNode;
  onSelect?: () => void;
  /** The winner. */
  emphasis?: boolean;
  /** The loser: quieter. */
  muted?: boolean;
}

interface MatchRowProps<V extends string> {
  home: MatchSide;
  away: MatchSide;
  /** "2.5 – 1.5", "½–½" */
  result?: ReactNode;
  pick?: V | null;
  /** Options for the pick cells. */
  options?: PickOption<V>[];
  probs?: SplitSegment[];
  status?: ReactNode;
  onPick?: (v: V | null) => void;
  onSelect?: () => void;
  disabled?: boolean;
  legend?: string;
  className?: string;
}

/** Equal sides, so scores line up down a list. */
const GRID = 'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2';
/** In a narrow box the flag goes over the name; a score takes more room than the "v". */
const STACK = {
  score: { home: '[@container_(max-width:20rem)]:flex-col [@container_(max-width:20rem)]:items-start', away: '[@container_(max-width:20rem)]:flex-col [@container_(max-width:20rem)]:items-end' },
  v: { home: '[@container_(max-width:17rem)]:flex-col [@container_(max-width:17rem)]:items-start', away: '[@container_(max-width:17rem)]:flex-col [@container_(max-width:17rem)]:items-end' },
};

/** Two sides and what happened, or what you think will. The pick cells stand between the sides when the row's own box is wide enough. */
export function MatchRow<V extends string>({ home, away, result, pick = null, options, probs, status, onPick, onSelect, disabled, legend, className }: MatchRowProps<V>) {
  const picks = options && onPick;
  const side = (s: MatchSide, right: boolean) => {
    const inner = (
      <>
        {s.lead && <span className="flex shrink-0 items-center">{s.lead}</span>}
        <span className="min-w-0">
          <span className={cn('line-clamp-3 break-words type-ui', s.emphasis ? 'font-semibold text-ink' : s.muted ? 'font-normal text-ink-3' : 'text-ink', s.onSelect && cn(goldLine, 'group-hover/side:underline'))}>{s.name}</span>
          {s.meta && <span className="block truncate type-label text-ink-3">{s.meta}</span>}
        </span>
      </>
    );
    // Home name ends at the score, away name starts there; with picks below, the two sit at the edges.
    const stack = STACK[result === undefined ? 'v' : 'score'];
    const cls = cn('flex min-w-0', right ? 'justify-end text-right' : 'text-left');
    const order = <span className={cn('flex min-w-0 items-center gap-2', right ? cn('flex-row-reverse', stack.away) : stack.home)}>{inner}</span>;
    return s.onSelect && !onSelect
      ? <button type="button" onClick={s.onSelect} className={cn(cls, 'group/side min-h-tap rounded-sm')}>{order}</button>
      : <span className={cls}>{order}</span>;
  };
  const centre = result !== undefined || !picks
    ? <span className={cn('shrink-0 whitespace-nowrap text-center type-data font-medium text-ink', result === undefined ? 'min-w-6' : 'min-w-14')}>{result ?? <span className="font-normal text-ink-3">v</span>}</span>
    : null;

  return (
    <div className={cn('border-b border-line py-2 [container-type:inline-size]', className)}>
      {onSelect ? (
        <button type="button" onClick={onSelect} className={cn(GRID, 'group/row -mx-3 min-h-tap w-[calc(100%+24px)] rounded-sm px-3 text-left transition-colors duration-in', hoverGround)}>
          {side(home, false)}{centre}{side(away, true)}
        </button>
      ) : (
        <div className={GRID}>
          {side(home, false)}
          {picks ? (
            <div className="order-last col-span-3 min-w-0 [@container_(min-width:26rem)]:order-none [@container_(min-width:26rem)]:col-span-1 [@container_(min-width:26rem)]:w-36">
              <PickToggle size="sm" legend={legend ?? `${home.name} against ${away.name}`} options={options} value={pick} onChange={onPick} disabled={disabled} />
              {result !== undefined && <p className="mt-1 hidden text-center type-label text-ink-2 [@container_(min-width:26rem)]:block">{result}</p>}
            </div>
          ) : centre}
          {picks && <span aria-hidden className="type-data text-ink-3 [@container_(min-width:26rem)]:hidden">{result ?? 'v'}</span>}
          {side(away, true)}
        </div>
      )}
      {probs && (
        <div className="mt-2">
          <SplitBar height={8} segments={probs} ariaLabel={probs.map(p => `${p.label} ${formatPct(p.value, 0)}`).join(', ')} />
          <p aria-hidden className="mt-1 flex justify-between gap-2 type-label text-ink-3 tnum">
            {probs.map((p, i) => <span key={p.key}>{i > 0 && i < probs.length - 1 ? `${p.label.toLowerCase()} ` : ''}{formatPct(p.value, 0)}</span>)}
          </p>
        </div>
      )}
      {status && <div className="mt-1.5 type-label text-ink-3">{status}</div>}
    </div>
  );
}
