import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SplitProps {
  main: ReactNode;
  aside: ReactNode;
  asideWidth?: 'narrow' | 'wide';
  stickyAside?: boolean;
  className?: string;
}

/** Main column and aside; stacks under 1024, main first. */
export function Split({ main, aside, asideWidth = 'narrow', stickyAside = false, className }: SplitProps) {
  const wide = asideWidth === 'wide';
  return (
    <div className={cn('grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-12', className)}>
      <div className={cn('min-w-0', wide ? 'lg:col-span-7' : 'lg:col-span-8')}>{main}</div>
      <div className={cn('min-w-0', wide ? 'lg:col-span-5' : 'lg:col-span-4')}>
        {stickyAside ? <div className="lg:sticky lg:top-20">{aside}</div> : aside}
      </div>
    </div>
  );
}
