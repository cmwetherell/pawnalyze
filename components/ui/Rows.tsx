import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { goldLine, hoverGround, isExternal, selectedGround } from './styles';

/** A ruled list. */
export function Rows({ label, className, children }: { label?: string; className?: string; children: ReactNode }) {
  return <ul aria-label={label} className={cn('border-t border-line', className)}>{children}</ul>;
}

export interface RowProps {
  href?: string;
  onClick?: () => void;
  /** Pointer or focus arrives: a chance to load what the row opens. */
  onPrefetch?: () => void;
  /** Flag, avatar, rank: left of the words. */
  lead?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  /** Figure at the right end. */
  value?: ReactNode;
  /** Meter or chart beside the value, from 768. */
  figure?: ReactNode;
  selected?: boolean;
  /** md: serif title, for a list that is the section. sm: text face, for a list beside something else. */
  size?: 'md' | 'sm';
  /** With `onClick`: the row opens what is in `children`, and the chevron turns. */
  expanded?: boolean;
  /** Under the row, inside the same rule. */
  children?: ReactNode;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

export function Row({ href, onClick, onPrefetch, lead, title, meta, value, figure, selected, size = 'md', expanded, children, id, className, 'aria-label': ariaLabel }: RowProps) {
  const interactive = href !== undefined || onClick !== undefined;
  const md = size === 'md';
  const inner = (
    <>
      {lead && <span className={cn('flex shrink-0 items-center', md ? 'min-w-11' : 'min-w-6')}>{lead}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn('text-ink', md ? 'type-h3' : 'type-data font-medium', interactive && cn(goldLine, 'group-hover/row:underline'))}>{title}</span>
        {meta && <span className={cn(md ? 'type-small' : 'type-label', 'text-ink-2')}>{meta}</span>}
      </span>
      {value !== undefined && value !== null && (
        <span className={cn('shrink-0 text-right text-ink tnum', md ? 'type-stat-sm' : 'type-data font-medium', figure && 'md:w-24')}>{value}</span>
      )}
      {figure && <span className="hidden w-48 shrink-0 md:block xl:w-64">{figure}</span>}
      {interactive && (
        <Icon
          name={expanded !== undefined ? 'chevron-down' : href !== undefined && isExternal(href) ? 'external' : 'chevron-right'}
          size={16}
          className={cn('text-ink-3 transition-[color,transform] duration-slide group-hover/row:text-ink', expanded && 'rotate-180')}
        />
      )}
    </>
  );
  // The hover ground runs 12px past the rules on both sides, so words never touch its edge.
  const cls = cn(
    // Above the next row, so its ground does not cover the bottom of the focus ring.
    'group/row relative -mx-3 flex w-[calc(100%+24px)] items-center gap-4 px-3 text-left focus-visible:z-10',
    md ? 'min-h-16 py-4' : 'min-h-12 py-2',
    interactive && cn('transition-colors duration-in', hoverGround),
    selected && selectedGround,
    className,
  );
  const shared = { className: cls, 'data-selected': selected || undefined, 'aria-label': ariaLabel, ...(onPrefetch ? { onPointerEnter: onPrefetch, onFocus: onPrefetch } : {}) };
  return (
    <li id={id} className="relative scroll-mt-bar border-b border-line">
      {href !== undefined ? (
        isExternal(href)
          ? <a href={href} target="_blank" rel="noopener noreferrer" {...shared}>{inner}</a>
          : <Link href={href} aria-current={selected ? 'true' : undefined} {...shared}>{inner}</Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} aria-pressed={expanded === undefined ? selected : undefined} aria-expanded={expanded} {...shared}>{inner}</button>
      ) : (
        <div aria-current={selected ? 'true' : undefined} {...shared}>{inner}</div>
      )}
      {children}
    </li>
  );
}
