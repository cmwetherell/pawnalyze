'use client';

import Link from 'next/link';
import { useRef, type KeyboardEvent } from 'react';

import { cn } from '@/lib/utils';
import { LiveDot } from './LiveDot';

export interface LinkItem { label: string; href: string; active: boolean }
export interface TabItem { key: string; label: string; live?: boolean }

interface TabsProps {
  items: LinkItem[] | TabItem[];
  value?: string;
  onChange?: (key: string) => void;
  ariaLabel: string;
  /** Panel ids are `${panelPrefix}-${key}`. */
  panelPrefix?: string;
  className?: string;
}

const isLinks = (items: LinkItem[] | TabItem[]): items is LinkItem[] => items.length > 0 && 'href' in items[0];

const tabClass = (on: boolean) => cn(
  'relative inline-flex min-h-12 items-center gap-2 whitespace-nowrap type-ui transition-colors duration-in',
  'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:transition-colors after:duration-in',
  on ? 'text-ink after:bg-ink' : 'text-ink-2 hover:text-ink hover:after:bg-control',
);

/** Link tabs (a nav) or ARIA tabs with arrow keys. */
export function Tabs({ items, value, onChange, ariaLabel, panelPrefix, className }: TabsProps) {
  const list = useRef<HTMLDivElement>(null);
  const base = cn('flex flex-wrap gap-x-6 border-b border-line', className);

  if (isLinks(items)) {
    return (
      <nav aria-label={ariaLabel} className={base}>
        {items.map(t => <Link key={t.href} href={t.href} aria-current={t.active ? 'page' : undefined} className={tabClass(t.active)}>{t.label}</Link>)}
      </nav>
    );
  }

  const at = items.findIndex(t => t.key === value);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const to = (next + items.length) % items.length;
    onChange?.(items[to].key);
    list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus();
  };

  return (
    <div ref={list} role="tablist" aria-label={ariaLabel} onKeyDown={onKey} className={base}>
      {items.map((t, i) => {
        const on = i === at;
        return (
          <button
            key={t.key} type="button" role="tab" id={panelPrefix ? `${panelPrefix}-tab-${t.key}` : undefined}
            aria-selected={on} aria-controls={panelPrefix ? `${panelPrefix}-${t.key}` : undefined} tabIndex={on || (at < 0 && i === 0) ? 0 : -1}
            onClick={() => onChange?.(t.key)} className={tabClass(on)}
          >
            {t.live && <LiveDot />}
            {t.label}
            {t.live && <span className="sr-only"> (live)</span>}
          </button>
        );
      })}
    </div>
  );
}
