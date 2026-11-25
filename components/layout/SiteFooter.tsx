import Link from 'next/link';
import type { ReactNode } from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { Container } from './Container';
import { Logo } from './Logo';
import { FOOTER_GROUPS, SOCIAL_LINKS, type NavLink } from './nav';

const linkClass = 'inline-flex min-h-tap items-center gap-2 py-2.5 underline-offset-4 transition-colors duration-in hover:text-ink hover:underline hover:decoration-brand-mark hover:decoration-1';

function Group({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <nav aria-label={title} className={cn('min-w-0', className)}>
      <h2 className="mb-1 type-ui text-ink">{title}</h2>
      <ul>{children}</ul>
    </nav>
  );
}

function Item({ href, label, external }: NavLink) {
  return (
    <li>
      {/* Not prefetched: the tournament pages are large and few readers go on from here. */}
      <Link href={href} prefetch={false} className={cn(linkClass, 'type-data text-ink-2')} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {label}
      </Link>
    </li>
  );
}

/** Last thing on the page, so it is what makes room for the phone bottom bar. */
export function SiteFooter() {
  return (
    <footer className="border-t-2 border-rule bg-canvas pb-bottom-bar lg:pb-0 lg:group-has-[[data-bottom-bar=xl]]/body:pb-bottom-bar xl:!pb-0">
      <Container className="pb-6 pt-12">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-6 gap-y-8 md:grid-cols-12">
          <div className="col-span-2 md:col-span-12 lg:col-span-4">
            <Link href="/" aria-label="Pawnalyze home" className="inline-flex min-h-tap items-center"><Logo className="h-11" /></Link>
            <p className="mt-4 max-w-xs type-small text-ink-2">Data-driven chess analytics powered by Monte Carlo simulations.</p>
            {/* Icons alone: the glyph of X is its name. The negative margin puts the glyphs, not their touch areas, on the edge. */}
            <div className="-ml-3 mt-3 flex">
              {SOCIAL_LINKS.map(s => <IconButton key={s.href} href={s.href} icon={s.icon} label={s.label} />)}
            </div>
          </div>
          {FOOTER_GROUPS.map((g, i) => (
            <Group key={g.title} title={g.title} className={i === 0 ? 'md:col-span-6 lg:col-span-3 lg:col-start-7' : 'md:col-span-6 lg:col-span-3'}>
              {g.links.map(l => <Item key={l.href} {...l} />)}
            </Group>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 border-t border-line pt-4 type-small text-ink-3 lg:mt-12">
          <p className="flex min-h-tap items-center">&copy; 2026 Pawnalyze. Built by Caleb Wetherell.</p>
          <Link href="/world-chess-championship-2026#photo-credits" prefetch={false} className={cn(linkClass, 'text-ink-2')}>Photo credits</Link>
        </div>
      </Container>
    </footer>
  );
}
