import { fillClass, medalTone, onClass } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

const WORD = { 1: 'Gold', 2: 'Silver', 3: 'Bronze' } as const;
const SIZE = { 20: 'h-5 w-5 type-micro', 28: 'h-7 w-7 type-small' } as const;

export function Medal({ rank, size = 20, decorative = false, className }: { rank: 1 | 2 | 3; size?: 20 | 28; /** The place is written next to it. */ decorative?: boolean; className?: string }) {
  const tone = medalTone(rank);
  return (
    <span
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `${WORD[rank]} medal` })}
      className={cn('inline-grid shrink-0 place-items-center rounded-full leading-none tnum', SIZE[size], 'font-semibold', fillClass[tone], onClass[tone], className)}
    >
      <span aria-hidden>{rank}</span>
    </span>
  );
}
