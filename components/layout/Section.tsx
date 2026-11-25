import { useId, type ReactNode } from 'react';

import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import { Container } from './Container';

export interface SectionProps {
  id?: string;
  /** Leave out only where the page title already names the section; then pass `label`. */
  title?: ReactNode;
  label?: string;
  /** The finding, in words, computed from the data. */
  finding?: ReactNode;
  /** `lg`: under 1024 the page sets the finding itself, below a figure that has to start high. */
  findingFrom?: 'lg';
  actions?: ReactNode;
  legend?: ReactNode;
  credit?: ReactNode;
  /** A sentence under the figure: the rule behind it, where the numbers come from. */
  note?: ReactNode;
  layout?: 'rail' | 'wide' | 'split' | 'plain';
  ratio?: '1/1' | '5/7' | '7/5';
  pace?: 'dashboard' | 'landing';
  rule?: boolean;
  level?: 2 | 3;
  className?: string;
  children: ReactNode;
}

/** Spans of the 12 columns, so a split lines up with every other section. */
const RATIO = {
  '1/1': 'lg:[&>*]:col-span-6',
  '5/7': 'lg:[&>*:nth-child(odd)]:col-span-5 lg:[&>*:nth-child(even)]:col-span-7',
  '7/5': 'lg:[&>*:nth-child(odd)]:col-span-7 lg:[&>*:nth-child(even)]:col-span-5',
} as const;

/** A 2px rule, the words, the figure. Every section of every page is one of these four layouts; a column of one with its own heading is a Part. */
export function Section({
  id, title, label, finding, findingFrom, actions, legend, credit, note, layout = 'rail', ratio = '1/1', pace = 'dashboard', rule = true, level = 2, className, children,
}: SectionProps) {
  const auto = useId();
  const titleId = `${id ?? auto}-title`;
  const heading = title ? <Heading id={titleId} level={level} style={level === 2 ? 'h2' : 'h3'}>{title}</Heading> : null;
  const words = finding ? <div className="type-body text-ink-2">{finding}</div> : null;
  const notes = (legend || credit || note) ? (
    <div className="flex flex-col gap-3">
      {legend}
      {note && <p className="max-w-reading type-small text-ink-3">{note}</p>}
      {credit && <div className="type-micro text-ink-3">{credit}</div>}
    </div>
  ) : null;

  return (
    <section
      id={id}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      data-pace={pace}
      className={cn('scroll-mt-bar', pace === 'landing' ? 'pb-section-landing lg:min-h-screen' : 'pb-section', className)}
    >
      <Container>
        <div className={cn(rule && 'border-t-2 border-rule pt-6')}>
          {layout === 'rail' ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-3">
                <div className={cn('flex flex-col gap-3 lg:sticky', pace === 'landing' ? 'lg:top-24' : 'lg:top-20')}>
                  {heading}
                  {words && findingFrom ? <div className="max-lg:hidden">{words}</div> : words}
                  {actions && <div className="mt-1 flex flex-wrap items-center gap-3">{actions}</div>}
                  {notes && <div className="mt-1">{notes}</div>}
                </div>
              </div>
              <div className="min-w-0 lg:col-span-9">{children}</div>
            </div>
          ) : (
            <>
              {(heading || words || actions) && (
                <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-3 lg:mb-8 lg:grid-cols-12 lg:items-baseline">
                  <div className={cn('min-w-0', words ? 'lg:col-span-4' : actions ? 'lg:col-span-9' : 'lg:col-span-12')}>{heading}</div>
                  {words && <div className={cn('min-w-0 lg:col-span-5', findingFrom && 'max-lg:hidden')}>{words}</div>}
                  {actions && <div className="mt-1 flex flex-wrap items-center gap-3 lg:col-span-3 lg:col-start-10 lg:mt-0 lg:justify-end">{actions}</div>}
                </div>
              )}
              {layout === 'split' ? (
                <div className={cn('grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-12 [&>*]:min-w-0', RATIO[ratio])}>{children}</div>
              ) : (
                <div className="min-w-0">{children}</div>
              )}
              {notes && <div className="mt-6">{notes}</div>}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
