import type { ReactNode } from 'react';

import { Disclosure } from '@/components/ui/Disclosure';
import { Heading } from '@/components/ui/Heading';
import { Segmented } from '@/components/ui/Segmented';
import { Tabs, type LinkItem } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import { Breadcrumb, type Crumb } from './Breadcrumb';
import { Container } from './Container';
import { HeroEnter } from './HeroEnter';

interface PageHeadProps {
  title: string;
  size?: 'mega' | 'h1';
  crumbs?: Crumb[];
  lead?: ReactNode;
  /** First fact is the heaviest; on phones the rest fold into "Details". */
  facts?: ReactNode[];
  status?: ReactNode;
  actions?: ReactNode;
  /** Small buttons at the right end of the breadcrumb line, for a page whose figure should start high. */
  crumbActions?: ReactNode;
  switcher?: LinkItem[];
  tabs?: LinkItem[];
  media?: ReactNode;
  enter?: boolean;
  className?: string;
}

const up = 'group-data-[enter]/enter:animate-up';

export function PageHead({ title, size = 'h1', crumbs, lead, facts, status, actions, crumbActions, switcher, tabs, media, enter = false, className }: PageHeadProps) {
  const aside = Boolean(lead || actions || (facts && facts.length > 0));
  const body = (
    <Container className={cn('pb-2 md:pb-8 md:pt-4', crumbs || switcher ? 'pt-1' : 'pt-6 md:pt-12', className)}>
      {(crumbs || switcher || crumbActions) && (
        <div className={cn('flex flex-wrap items-center justify-between gap-x-3 gap-y-2 md:mb-4', switcher || crumbActions ? 'mb-3' : 'mb-1')}>
          {crumbs ? <Breadcrumb items={crumbs} compact={Boolean(switcher || crumbActions)} /> : <span />}
          {crumbActions && <div className="flex flex-wrap items-center gap-3">{crumbActions}</div>}
          {switcher && <Segmented role="nav" ariaLabel="Section" size="sm" value={switcher.find(s => s.active)?.href ?? ''} items={switcher.map(s => ({ value: s.href, label: s.label, href: s.href }))} />}
        </div>
      )}
      <div className={cn('grid grid-cols-1 gap-x-6 md:gap-y-4 lg:grid-cols-12 lg:items-end', lead || actions ? 'gap-y-4' : 'gap-y-1')}>
        <div className={cn('min-w-0', aside ? (facts && !lead ? 'lg:col-span-9' : 'lg:col-span-8') : 'lg:col-span-12')}>
          {(status || media) && (
            <div className="mb-3 flex flex-wrap items-center gap-3">
              {media}
              {status}
            </div>
          )}
          <Heading level={1} style={size}>
            {/* The clip box is taller than the line, so accents and descenders survive it. */}
            <span className="-my-[.15em] block overflow-hidden py-[.15em]">
              <span className="block group-data-[enter]/enter:animate-rise">{title}</span>
            </span>
          </Heading>
        </div>
        {aside && (
          <div className={cn('flex min-w-0 flex-col gap-4', facts && !lead ? 'lg:col-span-3' : 'lg:col-span-4')}>
            {lead && <div className={cn('max-w-reading type-lead text-ink-2', up)} style={{ animationDelay: '400ms' }}>{lead}</div>}
            {facts && facts.length > 0 && <Facts facts={facts} />}
            {actions && <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', up)} style={{ animationDelay: '460ms' }}>{actions}</div>}
          </div>
        )}
      </div>
      {tabs && <Tabs className="mt-6" ariaLabel="Views" items={tabs} />}
    </Container>
  );
  return enter ? <HeroEnter>{body}</HeroEnter> : body;
}

function Facts({ facts }: { facts: ReactNode[] }) {
  const [first, ...rest] = facts;
  return (
    <div className="type-small text-ink-2">
      <div className={cn('font-medium text-ink', rest.length > 0 && 'hidden md:block')}>{first}</div>
      {rest.length > 0 && (
        <>
          <ul className="hidden md:block">{rest.map((f, i) => <li key={i}>{f}</li>)}</ul>
          {/* Phones: one line, the rest behind it. */}
          <Disclosure summary={<span className="font-medium text-ink">{first}</span>} meta="Details" className="md:hidden">
            <ul className="pb-2">{rest.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </Disclosure>
        </>
      )}
    </div>
  );
}
