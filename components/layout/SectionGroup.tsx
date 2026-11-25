import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionGroupProps {
  label: string;
  ground?: 'canvas' | 'surface';
  className?: string;
  children: ReactNode;
}

/**
 * One movement of a page. A surface group bleeds full width; its last section supplies the bottom padding.
 * Ground shows under the band wherever something follows it; only the last band of the page meets the footer.
 */
export function SectionGroup({ label, ground = 'canvas', className, children }: SectionGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      data-ground={ground}
      className={cn('group/ground', ground === 'surface' && 'mb-section bg-surface pt-section [main>&:last-child]:!mb-0 has-[[data-pace=landing]]:mb-section-landing has-[[data-pace=landing]]:pt-section-landing', className)}
    >
      {children}
    </div>
  );
}
