import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { proseLinks } from './styles';

/** Running text at reading measure. `columns` for the two-column explanations. */
export function Prose({ columns = 1, className, children }: { columns?: 1 | 2; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'type-body text-ink-2 [&>*+*]:mt-4',
        proseLinks,
        '[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-ink [&_li::marker]:text-ink-3',
        '[&_h3]:type-h3 [&_h3]:text-ink [&>*+h3]:mt-8 [&_h4]:type-ui [&_h4]:text-ink',
        columns === 2 ? 'gap-x-12 lg:columns-2 [&>*]:break-inside-avoid' : 'max-w-reading',
        className,
      )}
    >
      {children}
    </div>
  );
}
