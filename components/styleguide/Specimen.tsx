import type { ReactNode } from 'react';

import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

interface SpecimenProps {
  name: string;
  /** Import path under components/. */
  from?: string;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** One library component on the styleguide: its name, where it lives, every variant. */
export function Specimen({ name, from, note, className, children }: SpecimenProps) {
  return (
    <div className="border-t border-line py-8 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Heading level={3} style="h3">{name}</Heading>
        {from && <span className="type-mono text-ink-3">{from}</span>}
      </div>
      {note && <p className="mt-1 max-w-reading type-small text-ink-2">{note}</p>}
      <div className={cn('mt-6', className)}>{children}</div>
    </div>
  );
}

/** Variants side by side, with a word under or beside each. */
export function Variants({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-4', className)}>{children}</div>;
}

export function Variant({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <span className="type-label text-ink-3">{label}</span>
      {children}
    </div>
  );
}
