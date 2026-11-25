'use client';

import Link from 'next/link';
import { useRef, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';
import { LiveDot } from './LiveDot';

export interface SegmentedItem<V extends string = string> {
  value: V;
  label: ReactNode;
  /** Under 640, where the whole label does not fit: "B1". Give `ariaLabel` too. */
  short?: string;
  hint?: string;
  /** A name, or an element (a flag); an element shows from 640. */
  icon?: IconName | ReactElement;
  /** Live dot before the label. */
  dot?: boolean;
  href?: string;
  disabled?: boolean;
  /** Full words for assistive tech, when the label is short ("1"). */
  ariaLabel?: string;
  /** After the label, quieter: a result. */
  note?: ReactNode;
  /** There is nothing behind it yet. */
  muted?: boolean;
}

interface SegmentedProps<V extends string> {
  items: SegmentedItem<V>[];
  value: V;
  /** With role nav: handles a plain click on the page itself; the links still open in a new tab. */
  onChange?: (v: V) => void;
  role?: 'tablist' | 'radiogroup' | 'nav';
  ariaLabel: string;
  /** md 48px, sm 44px. */
  size?: 'md' | 'sm';
  full?: boolean;
  className?: string;
}

/** The one segmented control. No sliding pill: the state changes. */
export function Segmented<V extends string>({ items, value, onChange, role = 'radiogroup', ariaLabel, size = 'md', full = false, className }: SegmentedProps<V>) {
  const root = useRef<HTMLDivElement>(null);
  const cell = (on: boolean, muted = false) => cn(
    'relative -ml-px -mt-px inline-flex max-w-full grow items-center justify-center gap-2 whitespace-nowrap border type-ui transition-colors duration-in first:rounded-l-sm last:rounded-r-sm focus-visible:z-10',
    'disabled:cursor-not-allowed disabled:opacity-50',
    size === 'md' ? 'min-h-12 px-4' : 'min-h-tap min-w-tap px-3',
    full && 'basis-0 px-2 sm:px-3',
    on ? 'z-[1] border-action bg-action text-on-action' : cn('border-control bg-raised hover:bg-sunken hover:text-ink disabled:hover:bg-raised disabled:hover:text-ink-2', muted ? 'text-ink-3' : 'text-ink-2'),
  );
  const inner = (i: SegmentedItem<V>, on: boolean) => (
    <>
      {i.dot && <LiveDot inherit={on} />}
      {i.icon && (typeof i.icon === 'string' ? <Icon name={i.icon} size={16} className="max-[359px]:hidden" /> : <span className="hidden shrink-0 sm:flex">{i.icon}</span>)}
      {i.short !== undefined && <span className="min-w-0 leading-tight sm:hidden">{i.short}</span>}
      <span className={cn('min-w-0 leading-tight', i.short !== undefined && 'hidden sm:inline')}>{i.label}</span>
      {i.note && <span className="type-label">{i.note}</span>}
      {i.dot && !i.ariaLabel && <span className="sr-only"> (live)</span>}
    </>
  );
  // Words stay whole: cells that do not fit on the line go to the next one and fill it. The padding takes back the shared borders.
  const wrap = cn('max-w-full flex-wrap pl-px pt-px', full ? 'flex w-full' : 'inline-flex', className);

  if (role === 'nav') {
    return (
      <nav aria-label={ariaLabel} className={wrap}>
        {items.map(i => {
          const on = i.value === value;
          return (
            <Link
              key={i.value} href={i.href ?? '#'} title={i.hint} aria-label={i.ariaLabel} aria-current={on ? 'page' : undefined} scroll={false} className={cell(on, i.muted)}
              {...(onChange ? { prefetch: false, onClick: (e: MouseEvent) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); onChange(i.value); } } } : {})}
            >
              {inner(i, on)}
            </Link>
          );
        })}
      </nav>
    );
  }

  const itemRole = role === 'tablist' ? 'tab' : 'radio';
  const at = items.findIndex(i => i.value === value);
  const firstEnabled = items.findIndex(i => !i.disabled);
  const onKey = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const edge = e.key === 'Home' || e.key === 'End';
    if (!step && !edge) return;
    e.preventDefault();
    const enabled = items.map((it, ix) => ({ it, ix })).filter(x => !x.it.disabled);
    const from = enabled.findIndex(x => x.it.value === value);
    const to = e.key === 'Home' ? enabled[0] : e.key === 'End' ? enabled[enabled.length - 1] : enabled[(Math.max(from, step > 0 ? -1 : 0) + step + enabled.length) % enabled.length];
    if (!to) return;
    onChange?.(to.it.value);
    root.current?.querySelectorAll<HTMLElement>(`[role="${itemRole}"]`)[to.ix]?.focus();
  };
  return (
    <div ref={root} role={role} aria-label={ariaLabel} onKeyDown={onKey} className={wrap}>
      {items.map((i, ix) => {
        const on = ix === at;
        return (
          <button
            key={i.value} type="button" role={itemRole} title={i.hint} aria-label={i.ariaLabel} disabled={i.disabled} tabIndex={on || (at < 0 && ix === firstEnabled) ? 0 : -1}
            {...(itemRole === 'tab' ? { 'aria-selected': on } : { 'aria-checked': on })}
            onClick={() => onChange?.(i.value)} className={cell(on, i.muted)}
          >
            {inner(i, on)}
          </button>
        );
      })}
    </div>
  );
}
