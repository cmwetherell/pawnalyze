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
  /** On phones the lead goes into "Details" too, where the first figure would start too low. Needs `facts`. */
  foldLead?: boolean;
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

export function PageHead({ title, size = 'h1', crumbs, lead, foldLead = false, facts, status, actions, crumbActions, switcher, tabs, media, enter = false, className }: PageHeadProps) {
  const aside = Boolean(lead || actions || (facts && facts.length > 0));
  // Facts alone need less width than a lead, once there is width.
  const narrow = facts !== undefined && !lead && !actions;
  const mega = size === 'mega';
  const body = (
    <Container className={cn('md:pb-8 md:pt-4', tabs ? 'pb-2' : 'pb-6', switcher || crumbActions ? 'pt-3' : crumbs ? 'pt-1' : 'pt-6 md:pt-12', className)}>
      {(crumbs || switcher || crumbActions) && (
        <div className={cn('flex flex-wrap items-center justify-between gap-x-3 gap-y-2 md:mb-4', switcher || crumbActions ? 'mb-3' : 'mb-1')}>
          {crumbs ? <Breadcrumb items={crumbs} compact={Boolean(switcher || crumbActions)} /> : <span />}
          {crumbActions && <div className="flex flex-wrap items-center gap-3">{crumbActions}</div>}
          {switcher && <Segmented role="nav" ariaLabel="Section" size="sm" value={switcher.find(s => s.active)?.href ?? ''} items={switcher.map(s => ({ value: s.href, label: s.label, href: s.href }))} />}
        </div>
      )}
      {/* Both start on one line, so the title stands at the same height whatever is beside it. A mega title is taller than its aside: they end on one line. */}
      <div className={cn('grid grid-cols-1 gap-x-6 md:gap-y-4 lg:grid-cols-12 lg:items-start', mega && (narrow ? 'xl:[align-items:last_baseline]' : 'lg:[align-items:last_baseline]'), (lead && !foldLead) || actions ? 'gap-y-4' : 'gap-y-1')}>
        <div className={cn('min-w-0', aside ? cn('lg:col-span-8', narrow && 'xl:col-span-9') : 'lg:col-span-12')}>
          {(status || media) && (
            <div className="mb-3 flex flex-wrap items-center gap-3 lg:mb-4">
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
          <div className={cn('flex min-w-0 flex-col gap-4 lg:col-span-4', narrow && 'xl:col-span-3', !mega && !status && !media && 'lg:pt-2')}>
            {lead && <div className={cn('max-w-reading type-lead text-ink-2', foldLead && 'max-md:hidden', up)} style={{ animationDelay: '400ms' }}>{lead}</div>}
            {facts && facts.length > 0 && <Facts facts={facts} lead={foldLead ? lead : undefined} />}
            {actions && <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', up)} style={{ animationDelay: '460ms' }}>{actions}</div>}
          </div>
        )}
      </div>
      {tabs && <Tabs className={facts ? 'mt-1 md:mt-6' : 'mt-6'} ariaLabel="Views" items={tabs} />}
    </Container>
  );
  return enter ? <HeroEnter>{body}</HeroEnter> : body;
}

function Facts({ facts, lead }: { facts: ReactNode[]; lead?: ReactNode }) {
  const [first, ...rest] = facts;
  return (
    <div className="type-small text-ink-2">
      <div className={cn('font-medium text-ink', rest.length > 0 && 'hidden md:block')}>{first}</div>
      {rest.length > 0 && (
        <>
          <ul className="hidden md:block">{rest.map((f, i) => <li key={i}>{f}</li>)}</ul>
          {/* Phones: one line, the rest behind it. */}
          <Disclosure summary={<span className="font-medium text-ink">{first}</span>} meta="Details" className="md:hidden">
            {lead && <div className="max-w-reading pb-2 type-body">{lead}</div>}
            <ul className="pb-2">{rest.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </Disclosure>
        </>
      )}
    </div>
  );
}
