'use client';

import { ScrollArea } from '@/components/ui/ScrollArea';
import { cn } from '@/lib/utils';

export interface MoveItem { san: string; /** Clock, complexity or evaluation beside the move. */ meta?: string }

interface MoveListProps {
  moves: MoveItem[];
  /** 0 is the start position. */
  ply: number;
  onGo: (ply: number) => void;
  maxHeight: number | string;
  /** From 768: as tall as what is left beside the board. */
  fill?: boolean;
  className?: string;
}

/** Two columns of moves. Follows the current one by scrolling itself, never the page. */
export function MoveList({ moves, ply, onGo, maxHeight, fill, className }: MoveListProps) {
  const cell = (m: MoveItem | undefined, n: number) => {
    if (!m) return <span />;
    const on = ply === n;
    return (
      <button
        type="button"
        onClick={() => onGo(n)}
        aria-current={on ? 'step' : undefined}
        className={cn(
          'flex min-h-9 min-w-0 items-center justify-between gap-2 rounded-sm px-2 text-left type-mono transition-colors duration-in focus-visible:outline-offset-[-2px] [@media(pointer:coarse)]:min-h-tap',
          on ? 'bg-action text-on-action' : 'text-ink hover:bg-sunken',
        )}
      >
        {m.san}
        {m.meta && <span className={cn('type-label tnum', on ? 'text-on-action' : 'text-ink-3')}>{m.meta}</span>}
      </button>
    );
  };
  return (
    <ScrollArea label="Moves" maxHeight={maxHeight} fill={fill} follow='[aria-current="step"]' followKey={`${ply}-${moves.length}`} className={className}>
      <ol aria-label="Moves" className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-1">
        {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => (
          <li key={i} className="contents">
            <span className="flex items-center type-data text-ink-3">{i + 1}.</span>
            {cell(moves[i * 2], i * 2 + 1)}
            {cell(moves[i * 2 + 1], i * 2 + 2)}
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
