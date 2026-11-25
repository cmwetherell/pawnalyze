import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { goldLine } from './styles';

interface DisclosureProps {
  summary: ReactNode;
  meta?: ReactNode;
  open?: boolean;
  /** plain: a line of text. row: a ruled row with the chevron at the right end. */
  variant?: 'plain' | 'row';
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Native details, so it works before hydration and in-page search can open it. */
export function Disclosure({ summary, meta, open, variant = 'plain', id, className, children }: DisclosureProps) {
  const row = variant === 'row';
  return (
    <details id={id} open={open} className={cn('group/details relative scroll-mt-bar', row && 'border-b border-line', className)}>
      <summary
        className={cn(
          'flex min-h-tap cursor-pointer select-none items-center gap-2 transition-colors duration-in',
          row ? 'min-h-12 justify-between gap-4 py-3 type-ui text-ink' : 'w-fit max-w-full type-small text-ink-2 hover:text-ink',
        )}
      >
        {!row && <Icon name="chevron-right" size={14} className="transition-transform duration-slide [[open]>summary>&]:rotate-90" />}
        <span className={cn('min-w-0', row && cn(goldLine, '[summary:hover>&]:underline'))}>{summary}</span>
        {meta && <span className={cn('type-small text-ink-3', row && 'ml-auto shrink-0')}>{meta}</span>}
        {row && <Icon name="chevron-down" size={16} className="text-ink-3 transition-transform duration-slide [[open]>summary>&]:rotate-180" />}
      </summary>
      {/* The row's own rule closes it, so the last row inside drops its line. */}
      <div className={row ? 'pb-6 [&>:last-child]:border-b-0' : 'pt-2'}>{children}</div>
    </details>
  );
}
