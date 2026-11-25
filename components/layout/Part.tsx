import { useId, type ReactNode } from 'react';

import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

interface PartProps {
  id?: string;
  title: ReactNode;
  /** The finding, in words, computed from the data. */
  finding?: ReactNode;
  actions?: ReactNode;
  legend?: ReactNode;
  level?: 2 | 3;
  className?: string;
  children: ReactNode;
}

/** One figure of a split section: its own anchor, heading, finding and figure, under the section's rule. Stacked, every one gets a rule. */
export function Part({ id, title, finding, actions, legend, level = 2, className, children }: PartProps) {
  const auto = useId();
  const titleId = `${id ?? auto}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={cn('min-w-0 scroll-mt-bar max-lg:[&:not(:first-child)]:mt-6 max-lg:[&:not(:first-child)]:border-t-2 max-lg:[&:not(:first-child)]:border-rule max-lg:[&:not(:first-child)]:pt-6', className)}>
      <Heading id={titleId} level={level} style={level === 2 ? 'h2' : 'h3'}>{title}</Heading>
      {finding && <div className="mt-3 max-w-reading type-body text-ink-2">{finding}</div>}
      {actions && <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div>}
      {legend && <div className="mt-4">{legend}</div>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
