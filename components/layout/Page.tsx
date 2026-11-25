import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageProps {
  kind: 'landing' | 'dashboard';
  className?: string;
  children: ReactNode;
}

/** The page's <main>. Clips stray overflow; SiteFooter, the last thing on the page, makes room for the phone bottom bar. */
export function Page({ kind, className, children }: PageProps) {
  return (
    <main id="main" tabIndex={-1} data-page={kind} className={cn('flex-1 overflow-x-clip outline-none', className)}>
      {children}
    </main>
  );
}
