'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState, type ReactNode } from 'react';

import { Icon } from '@/components/ui/Icon';
import { Sheet } from '@/components/ui/Sheet';
import { cn } from '@/lib/utils';
import { isCurrent, MAIN_LINKS, TOURNAMENT_LINKS, type NavLink } from './nav';
import { ThemeToggle } from './ThemeProvider';

export interface SiteMenuTrigger { open: boolean; onClick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'dialog' }

const HOME: NavLink = { href: '/', label: 'Home' };

/** The full-screen site menu. SiteHeader (phones) and SectionBar (every width) supply their own trigger. */
export function SiteMenu({ trigger }: { trigger: (t: SiteMenuTrigger) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const pathname = usePathname();

  const row = (l: NavLink, main: boolean) => {
    const current = l.href === '/' ? pathname === '/' : isCurrent(pathname, l.href);
    return (
      <li key={l.href} className="border-b border-line">
        <Link
          href={l.href}
          onClick={close}
          aria-current={current ? 'page' : undefined}
          {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={cn('group/row flex items-center justify-between gap-4 transition-colors duration-in hover:text-ink', main ? 'h-14 type-h3 lg:h-16' : 'min-h-12 py-2 type-body', current ? 'text-ink' : 'text-ink-2')}
        >
          <span className={cn('min-w-0 underline-offset-4 group-hover/row:underline group-hover/row:decoration-brand-mark group-hover/row:decoration-1', current && 'border-b-2 border-brand-mark group-hover/row:no-underline')}>{l.label}</span>
          <Icon name={l.external ? 'external' : 'arrow-right'} size={16} className="text-ink-3" />
        </Link>
      </li>
    );
  };

  return (
    <>
      {trigger({ open, onClick: () => setOpen(o => !o), 'aria-expanded': open, 'aria-haspopup': 'dialog' })}
      <Sheet open={open} onClose={close} title="Menu" side="full" tools={<ThemeToggle />}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 pb-8 lg:grid-cols-12 lg:pt-8">
          <nav aria-label="Main" className="lg:col-span-7">
            <ul className="lg:border-t lg:border-line">{[HOME, ...MAIN_LINKS].map(l => row(l, true))}</ul>
          </nav>
          <nav aria-label="Tournaments" className="lg:col-span-4 lg:col-start-9">
            <p className="type-label text-ink-3 lg:mb-2">Tournaments</p>
            <ul className="lg:border-t lg:border-line">{TOURNAMENT_LINKS.map(l => row(l, false))}</ul>
          </nav>
        </div>
      </Sheet>
    </>
  );
}
