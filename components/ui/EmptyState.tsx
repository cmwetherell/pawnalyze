import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Heading } from './Heading';
import { Spinner } from './Spinner';

interface EmptyStateProps {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  busy?: boolean;
  /** 2 when it stands for a section, 3 inside one. */
  level?: 2 | 3;
  className?: string;
}

/** Between two hairlines: what is missing, why, and what to do about it. */
export function EmptyState({ title, body, action, busy = false, level = 2, className }: EmptyStateProps) {
  return (
    <div role="status" aria-busy={busy || undefined} className={cn('flex flex-col items-start gap-3 border-y border-line py-12', className)}>
      <div className="flex items-center gap-3 text-ink-2">
        {busy && <Spinner size={20} />}
        <Heading level={level} style="h3">{title}</Heading>
      </div>
      {body && <div className="max-w-reading type-body text-ink-2">{body}</div>}
      {action && <div className="mt-2 flex flex-wrap gap-3">{action}</div>}
    </div>
  );
}
