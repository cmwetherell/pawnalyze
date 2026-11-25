import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Heading } from './Heading';
import { Prose } from './Prose';
import { proseLinks } from './styles';

interface ExplainerProps {
  items: { title: string; body: ReactNode }[];
  columns?: 2 | 3 | 4;
  note?: ReactNode;
  className?: string;
}

const COLS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' } as const;

/** Columns of words: how a model or a rule works. No boxes. */
export function Explainer({ items, columns = 3, note, className }: ExplainerProps) {
  return (
    <div className={className}>
      <div className={cn('grid grid-cols-1 gap-x-6 gap-y-8', COLS[columns])}>
        {items.map(i => (
          <div key={i.title} className="min-w-0">
            <Heading level={3} style="h3">{i.title}</Heading>
            <Prose className="mt-2">{i.body}</Prose>
          </div>
        ))}
      </div>
      {note && <div className="mt-8 border-t border-line pt-4 type-small text-ink-2"><div className={cn('max-w-reading', proseLinks)}>{note}</div></div>}
    </div>
  );
}
