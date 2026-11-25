import { cn } from '@/lib/utils';

/** Always next to the words ("White: Gukesh"), so it is hidden from assistive tech. */
export function PieceDot({ side, className }: { side: 'white' | 'black'; className?: string }) {
  return <span aria-hidden className={cn('inline-block h-3 w-3 shrink-0 rounded-full border border-control', side === 'white' ? 'bg-piece-white' : 'bg-piece-black', className)} />;
}
