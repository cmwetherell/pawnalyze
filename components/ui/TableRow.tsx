'use client';

import { useRouter } from 'next/navigation';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { hoverGround, rowBleed, selectedGround } from './styles';

export interface TrProps {
  /** Whole row goes to this link. Put a real link in the name cell too: the row itself is a pointer shortcut. */
  href?: string;
  onSelect?: () => void;
  /** With `onSelect`: makes the row itself reachable by keyboard, under this name. Leave it out when a cell holds the button. */
  label?: string;
  /** Pointer or focus arrives: a chance to load what the row opens. */
  onPrefetch?: () => void;
  selected?: boolean;
  tint?: 'p1' | 'p2' | 'brand' | 'surface';
  id?: string;
  className?: string;
  children: ReactNode;
}

const TINT = { p1: 'bg-p1-wash', p2: 'bg-p2-wash', brand: 'bg-brand-wash', surface: selectedGround } as const;

/** A table row. Hover, selection and tint all fill the whole row. */
export function Tr({ href, onSelect, label, onPrefetch, selected, tint, id, className, children }: TrProps) {
  const router = useRouter();
  const interactive = href !== undefined || onSelect !== undefined;
  const go = () => {
    if (onSelect) onSelect();
    else if (href) router.push(href);
  };
  const onClick = (e: MouseEvent<HTMLTableRowElement>) => {
    if ((e.target as HTMLElement).closest('a, button, input, select, label')) return;
    if (window.getSelection()?.toString()) return;
    go();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    go();
  };
  const focusable = onSelect !== undefined && label !== undefined;
  const filled = interactive || selected || tint !== undefined;
  return (
    <tr
      id={id}
      onClick={interactive ? onClick : undefined}
      onPointerEnter={onPrefetch}
      onFocus={onPrefetch}
      {...(focusable ? { tabIndex: 0, 'aria-label': label, onKeyDown } : {})}
      aria-current={selected ? 'true' : undefined}
      data-selected={selected || undefined}
      className={cn(
        'group/tr scroll-mt-bar transition-colors duration-in focus-visible:-outline-offset-2',
        filled && rowBleed,
        tint && TINT[tint],
        selected && selectedGround,
        interactive && cn('cursor-pointer', !tint && hoverGround),
        className,
      )}
    >
      {children}
    </tr>
  );
}
