import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PanelProps {
  padding?: 'none' | 'sm' | 'md';
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const PAD = { none: '', sm: 'p-4', md: 'p-4 md:p-6' } as const;

/** The only box on the site, and only for instruments people operate. */
function PanelRoot({ padding = 'none', as: As = 'div', className, children, ...rest }: PanelProps) {
  return (
    <As data-panel="" className={cn('group/panel relative min-w-0 rounded-md border border-line bg-surface group-data-[ground=surface]/ground:bg-raised', PAD[padding], className)} {...rest}>
      {children}
    </As>
  );
}

interface SlotProps { className?: string; children: ReactNode }
const Head = ({ className, children }: SlotProps) => <div className={cn('border-b border-line px-4 py-4 md:px-6', className)}>{children}</div>;
const Body = ({ className, children }: SlotProps) => <div className={cn('p-4 md:p-6', className)}>{children}</div>;
const Foot = ({ className, children }: SlotProps) => <div className={cn('flex flex-wrap items-center gap-3 border-t border-line px-4 py-4 md:px-6', className)}>{children}</div>;

export const Panel = Object.assign(PanelRoot, { Head, Body, Foot });
