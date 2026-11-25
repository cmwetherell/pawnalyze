import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { proseLinks } from './styles';

/** Running text at reading measure. `columns` for the two-column explanations. */
export function Prose({ columns = 1, className, children }: { columns?: 1 | 2; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'type-body text-ink-2',
        proseLinks,
        '[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-ink [&_li::marker]:text-ink-3',
        '[&_h3]:type-h3 [&_h3]:text-ink [&_h4]:type-ui [&_h4]:text-ink',
        // Two columns: the space is under each block, and the blocks are inline, because Safari carries a margin over the column break.
        columns === 2 ? 'gap-x-12 lg:columns-2 lg:[orphans:1] lg:[widows:1] [&>*:not(:last-child)]:mb-4 [&>*:has(+h3)]:!mb-8 lg:[&>*]:inline-block lg:[&>*]:w-full lg:[&>*]:align-top' : 'max-w-reading [&>*+*]:mt-4 [&>*+h3]:mt-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
