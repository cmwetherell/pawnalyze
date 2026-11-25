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
  /** stacked: only when the columns stack, and not over the first. always: where the columns are sections of their own. */
  rule?: 'stacked' | 'always';
  className?: string;
  children: ReactNode;
}

/** A column of a Section: its own anchor, heading, finding and figure, with the words over the figure. Stacked, every one gets a rule. */
export function Part({ id, title, finding, actions, legend, level = 2, rule = 'stacked', className, children }: PartProps) {
  const auto = useId();
  const titleId = `${id ?? auto}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        'min-w-0 scroll-mt-bar',
        rule === 'always' ? 'border-t-2 border-rule pt-6' : 'max-lg:[&:not(:first-child)]:mt-6 max-lg:[&:not(:first-child)]:border-t-2 max-lg:[&:not(:first-child)]:border-rule max-lg:[&:not(:first-child)]:pt-6',
        className,
      )}
    >
      <Heading id={titleId} level={level} style={level === 2 ? 'h2' : 'h3'}>{title}</Heading>
      {finding && <div className="mt-3 max-w-reading type-body text-ink-2">{finding}</div>}
      {actions && <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div>}
      {legend && <div className="mt-4">{legend}</div>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
