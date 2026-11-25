'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useHeroGone } from '@/hooks/useHeroGone';
import { cn } from '@/lib/utils';
import { Container } from './Container';
import { Logo } from './Logo';
import { SiteMenu } from './SiteMenu';

export interface SectionBarItem { id: string; label: string; /** other section ids that mark it current */ also?: string[] }
export interface SectionBarProps {
  groups: { label: string; items: SectionBarItem[] }[];
  heroId: string;
  live?: ReactNode;
  eventLabel: string;
  actions?: ReactNode;
}

/** At most this many links on the bar, and only as many as fit on its one line; every section is in the panel. */
const MAX_LINKS = 8;

/** How many of the strip's children are still on its first line (the rest wrap out of sight). */
function useFit(count: number) {
  const ref = useRef<HTMLUListElement>(null);
  const [fit, setFit] = useState(count);
  useEffect(() => {
    const strip = ref.current;
    if (!strip) return;
    const ro = new ResizeObserver(() => {
      const kids = Array.from(strip.children) as HTMLElement[];
      const wrapped = kids.findIndex(k => k.offsetTop > (kids[0]?.offsetTop ?? 0));
      setFit(wrapped < 0 ? kids.length : wrapped);
    });
    ro.observe(strip);
    for (const kid of Array.from(strip.children)) ro.observe(kid);
    return () => ro.disconnect();
  }, [count]);
  return { ref, fit };
}

export function SectionBar({ groups, heroId, live, eventLabel, actions }: SectionBarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const gone = useHeroGone(heroId);

  const items = useMemo(() => groups.flatMap((g, gi) => g.items.map((item, ii) => ({ ...item, opensGroup: gi > 0 && ii === 0 }))), [groups]);
  const owner = useMemo(() => new Map(items.flatMap(i => [i.id, ...(i.also ?? [])].map(id => [id, i.id] as const))), [items]);
  const ids = useMemo(() => [...owner.keys()].join(' '), [owner]);
  const activeId = useActiveSection(ids);
  const current = (activeId && owner.get(activeId)) || items[0]?.id;
  const currentLabel = items.find(i => i.id === current)?.label ?? eventLabel;

  const onBar = items.slice(0, MAX_LINKS);
  const { ref: strip, fit } = useFit(onBar.length);
  // One list, all of it on the bar: nothing more to show.
  const whole = groups.length === 1 && fit >= items.length;
  const currentOff = items.findIndex(i => i.id === current) >= fit;

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback((e: { currentTarget: HTMLElement }) => {
    opener.current = e.currentTarget;
    setOpen(o => !o);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setOpen(false);
      opener.current?.focus({ preventScroll: true });
    };
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onFocus = (e: FocusEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('focusin', onFocus);
    };
  }, [open]);

  const chevron = <Icon name="chevron-down" size={16} className={cn('transition-transform duration-slide', open && 'rotate-180')} />;

  return (
    <nav ref={root} data-section-bar="" aria-label={`${eventLabel} sections`} className="sticky -top-px z-bar mb-section border-y border-line bg-canvas">
      <Container>
        <div className="flex h-bar items-center gap-2 lg:gap-4">
          <Link href="/" aria-label="Pawnalyze home" title="Pawnalyze home" className="-ml-2 grid h-tap w-tap shrink-0 place-items-center rounded-sm transition-colors duration-in hover:bg-sunken">
            <Logo kind="pawn" />
          </Link>

          <div
            inert={!gone}
            className={cn('hidden min-w-0 shrink-0 items-center type-ui text-ink transition-opacity duration-in lg:flex', gone ? 'opacity-100' : 'opacity-0')}
          >
            {live ?? <span className="truncate">{eventLabel}</span>}
          </div>

          {/* Phone and tablet: one button that names the current section. */}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex h-full min-w-0 flex-1 items-center gap-2 type-ui text-ink focus-visible:-outline-offset-2 lg:hidden"
          >
            <span className="sr-only">All sections, now at </span>
            <span className="truncate">{currentLabel}</span>
            {chevron}
          </button>

          <div className="hidden h-full min-w-0 flex-1 items-center justify-center lg:flex">
            <ul ref={strip} className="flex h-full min-w-0 flex-wrap justify-end overflow-hidden">
              {onBar.map((item, n) => {
                const on = item.id === current;
                return (
                  <li key={item.id} className={cn('flex h-bar items-center', item.opensGroup && 'ml-2 xl:ml-3', n >= fit && 'invisible')}>
                    {item.opensGroup && <span aria-hidden className="mr-2 h-6 border-l border-line xl:mr-3" />}
                    <a
                      href={`#${item.id}`}
                      aria-current={on ? 'location' : undefined}
                      className={cn(
                        'relative flex h-full items-center whitespace-nowrap px-2 type-ui transition-colors duration-in hover:text-ink focus-visible:-outline-offset-2 xl:px-3',
                        'after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-ink xl:after:inset-x-3',
                        on ? 'text-ink' : 'text-ink-2 after:hidden',
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
            {/* As wide as the longest section name, so its changing words never change how many links fit. */}
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={panelId}
              className={cn(
                'grid h-full shrink-0 justify-items-start pl-2 type-ui transition-colors duration-in hover:text-ink focus-visible:-outline-offset-2 xl:pl-3',
                currentOff ? 'text-ink' : 'text-ink-2',
                whole && 'hidden',
              )}
            >
              {items.map(item => <span key={item.id} aria-hidden className="invisible col-start-1 row-start-1 h-0 whitespace-nowrap pr-5">{item.label}</span>)}
              <span className="col-start-1 row-start-1 flex h-full items-center gap-1 whitespace-nowrap">
                <span className={cn('relative flex h-full items-center', currentOff && 'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink')}>
                  {currentOff ? currentLabel : fit < items.length ? 'More' : 'All'}
                </span>
                <span className="sr-only">, all sections</span>
                {chevron}
              </span>
            </button>
          </div>

          {/* Below 1440 a button with an icon keeps its words for assistive tech only, which leaves the room to the links. */}
          {actions && (
            <div className="hidden shrink-0 items-center gap-2 max-[1439px]:[&_.lift:has(>svg)>span]:sr-only max-[1439px]:[&_.lift:has(>svg)]:w-tap max-[1439px]:[&_.lift:has(>svg)]:px-0 lg:flex">{actions}</div>
          )}
          <div className="-mr-3 shrink-0">
            <SiteMenu trigger={({ open: menuOpen, ...t }) => <IconButton icon={menuOpen ? 'close' : 'menu'} label="Menu" {...t} />} />
          </div>
        </div>
      </Container>

      <div id={panelId} hidden={!open} className="absolute inset-x-0 top-full animate-fade border-y border-line bg-raised shadow-pop">
        <ScrollArea label="All sections" maxHeight="calc(100svh - var(--bar))">
          <Container className="pb-4 pt-6">
            <div className="grid gap-x-6 gap-y-6 lg:grid-cols-3">
              {groups.map(g => (
                <div key={g.label}>
                  <p className="type-label text-ink-3">{g.label}</p>
                  <ul className={cn('grid grid-cols-2 gap-x-6', groups.length > 1 && 'lg:grid-cols-1')}>
                    {g.items.map(item => {
                      const on = item.id === current;
                      return (
                        <li key={item.id} className="border-b border-line">
                          <a
                            href={`#${item.id}`}
                            onClick={close}
                            aria-current={on ? 'location' : undefined}
                            className={cn('flex h-12 items-center gap-2 type-ui transition-colors duration-in hover:text-ink', on ? 'text-ink' : 'text-ink-2')}
                          >
                            <span className={cn('truncate', on && 'border-b-2 border-ink')}>{item.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </ScrollArea>
      </div>
    </nav>
  );
}
