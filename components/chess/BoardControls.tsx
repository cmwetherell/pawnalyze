'use client';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';

interface BoardControlsProps {
  ply: number;
  last: number;
  onGo: (ply: number) => void;
  onFlip?: () => void;
  live?: { behind: boolean; onLive: () => void };
  className?: string;
}

/** Under every board. The arrow keys of the box around it do the same. */
export function BoardControls({ ply, last, onGo, onFlip, live, className }: BoardControlsProps) {
  return (
    <div role="group" aria-label="Moves through the game" className={cn('flex flex-wrap items-center gap-x-1 gap-y-2', className)}>
      <div className="-ml-3 flex items-center">
        <IconButton icon="first" label="First move" disabled={ply <= 0} onClick={() => onGo(0)} />
        <IconButton icon="prev" label="Previous move" disabled={ply <= 0} onClick={() => onGo(ply - 1)} />
        <IconButton icon="next" label="Next move" disabled={ply >= last} onClick={() => onGo(ply + 1)} />
        <IconButton icon="last" label="Last move" disabled={ply >= last} onClick={() => onGo(last)} />
        {onFlip && <IconButton icon="flip" label="Flip board" title="Flip board (f)" onClick={onFlip} />}
      </div>
      <div className="ml-auto flex items-center gap-3">
        {last > 0 && <span className={cn('type-data text-ink-3', live?.behind && 'max-sm:hidden')}><span className="sr-only">Position </span>{ply}/{last}</span>}
        {live?.behind && <Button size="sm" live aria-label="Back to live" onClick={live.onLive}><span className="max-sm:hidden">Back to live</span><span className="sm:hidden">Live</span></Button>}
      </div>
    </div>
  );
}
