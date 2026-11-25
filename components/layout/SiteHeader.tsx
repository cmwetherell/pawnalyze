'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { Container } from './Container';
import { Logo } from './Logo';
import { isCurrent, MAIN_LINKS } from './nav';
import { SiteMenu } from './SiteMenu';
import { ThemeToggle } from './ThemeProvider';

/** Sticky on landing pages; scrolls away on any page that renders a SectionBar (which then holds the menu). */
export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-header h-header border-b border-line bg-canvas group-has-[[data-section-bar]]/body:static">
      <Container className="h-full">
        <div className="flex h-full items-center justify-between gap-6">
          <Link href="/" aria-label="Pawnalyze home" className="flex min-h-tap items-center">
            <Logo className="h-7 md:h-8" />
          </Link>
          <div className="-mr-3 flex h-full items-center gap-1">
            <nav aria-label="Main" className="mr-2 hidden h-full md:block">
              <ul className="flex h-full items-center gap-2 xl:gap-4">
                {MAIN_LINKS.map(l => {
                  const current = isCurrent(pathname, l.href);
                  return (
                    <li key={l.href} className="h-full">
                      <Link
                        href={l.href}
                        aria-current={current ? 'page' : undefined}
                        {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className={cn(
                          'relative flex h-full items-center gap-1 px-2 type-ui transition-colors duration-in hover:text-ink focus-visible:-outline-offset-2',
                          'after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:origin-left after:bg-brand-mark after:transition-transform after:duration-in',
                          current ? 'text-ink after:scale-x-100' : 'text-ink-2 after:scale-x-0 hover:after:scale-x-100',
                        )}
                      >
                        {l.label}
                        {l.external && <Icon name="external" size={14} />}
                        {l.external && <span className="sr-only">(opens in a new tab)</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <ThemeToggle />
            <div className="md:hidden">
              <SiteMenu trigger={({ open, ...t }) => <IconButton icon={open ? 'close' : 'menu'} label="Menu" {...t} />} />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
