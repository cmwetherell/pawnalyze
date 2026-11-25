import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ContainerProps {
  /** `reading`: 680px measure, left edge shared with the page. */
  size?: 'page' | 'reading';
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/** The one content width: 1280px between gutters. */
export function Container({ size = 'page', as: As = 'div', className, children }: ContainerProps) {
  return (
    <As className={cn('mx-auto box-content max-w-page px-gutter', className)}>
      {size === 'reading' ? <div className="max-w-reading">{children}</div> : children}
    </As>
  );
}
