import Link from 'next/link';

import { cn } from '@/lib/utils';

export interface Crumb { label: string; href?: string }

interface BreadcrumbProps {
  items: Crumb[];
  /** Phones show only the parent of the current page: the title right below says it, and a switcher shares the line. */
  compact?: boolean;
  className?: string;
}

export function Breadcrumb({ items, compact = false, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center type-small text-ink-3">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className={cn('items-center', compact && items.length > 1 && i !== items.length - 2 ? 'hidden sm:flex' : 'flex')}>
            {i > 0 && <span aria-hidden className={cn('mx-2', compact && i === items.length - 2 && 'max-sm:hidden')}>/</span>}
            {c.href ? (
              <Link href={c.href} className="inline-flex min-h-tap items-center transition-colors duration-in hover:text-ink">{c.label}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} className={cn('inline-flex min-h-tap items-center', i === items.length - 1 && 'text-ink-2')}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
