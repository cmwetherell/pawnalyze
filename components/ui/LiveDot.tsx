import { cn } from '@/lib/utils';

interface LiveDotProps {
  /** Words beside the dot; without them the surrounding control must say "live". */
  label?: string;
  /** Takes the text color: for the dot inside a filled button. */
  inherit?: boolean;
  className?: string;
}

/** The only looping animation on the site. */
export function LiveDot({ label, inherit = false, className }: LiveDotProps) {
  const dot = <span aria-hidden className={cn('inline-block h-2 w-2 shrink-0 animate-live-dot rounded-full', inherit ? 'bg-current' : 'bg-live', !label && className)} />;
  if (!label) return dot;
  return <span className={cn('inline-flex items-center gap-2 whitespace-nowrap type-label font-medium text-live', className)}>{dot}{label}</span>;
}
