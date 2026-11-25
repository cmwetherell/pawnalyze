import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Logo, type LogoItem } from './LogoRow';

interface QuoteProps { text: string; logo?: LogoItem; cite: ReactNode; className?: string }

export function Quote({ text, logo, cite, className }: QuoteProps) {
  return (
    <figure className={className}>
      <blockquote className="type-quote text-ink">{text}</blockquote>
      <figcaption className={cn('mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 type-small text-ink-2')}>
        {logo && <Logo logo={logo} />}
        <span className="min-w-0">{cite}</span>
      </figcaption>
    </figure>
  );
}
