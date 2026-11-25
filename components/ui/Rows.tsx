import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { goldLine, hoverGround, isExternal, selectedGround } from './styles';
import { buttonClass } from './Button';

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
  /** Meter or chart beside the value; on phones the two go under the words. */
  figure?: ReactNode;
  /** A control at the right end of a row that is not itself one. */
  action?: ReactNode;
  /** A fact of its own (a winner, a place): at the right of the words from 768, under them on phones. */
  aside?: ReactNode;
  selected?: boolean;
  /** md: serif title, for a list that is the section. sm: text face, for a list beside something else. */
  size?: 'md' | 'sm';
  /** With `onClick`: the row opens what is in `children`, and the chevron turns. */
  expanded?: boolean;
  /**
   * For a row that opens something and has links of its own in `title` or `meta`: a labeled button at the right end, with
   * the rest of the row as a pointer shortcut to it. Use with `expanded`, instead of `onClick`.
   */
  toggle?: { text: string; label: string; onToggle: () => void; disabled?: boolean };
  /** Under the row, inside the same rule. */
  children?: ReactNode;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

export function Row({ href, onClick, onPrefetch, lead, title, meta, value, figure, aside, action, selected, size = 'md', expanded, toggle, children, id, className, 'aria-label': ariaLabel }: RowProps) {
  const interactive = href !== undefined || onClick !== undefined;
  const opens = toggle !== undefined && !toggle.disabled;
  const md = size === 'md';
  const inner = (
    <>
      {lead && <span className={cn('flex shrink-0 items-center', md ? 'min-w-11' : 'min-w-6', (figure || aside) && 'max-md:mt-0.5 max-md:self-start')}>{lead}</span>}
      <span className={cn('flex min-w-0 flex-1 flex-col gap-1', aside && 'md:flex-row md:items-center md:gap-6')}>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={cn('text-ink', md ? 'type-h3' : 'type-data font-medium', interactive && cn(goldLine, 'group-hover/row:underline'))}>{title}</span>
          {meta && <span className={cn(md ? 'type-small' : 'type-label', 'text-ink-2')}>{meta}</span>}
        </span>
        {aside && <span className="mt-1 flex min-w-0 shrink-0 flex-col items-start gap-2 type-data text-ink md:mt-0 md:w-48 xl:w-56">{aside}</span>}
      </span>
      {/* On phones the value and its figure take the line below the words. */}
      {figure && <span aria-hidden className="order-last h-0 basis-full md:hidden" />}
      {value !== undefined && value !== null && (
        <span className={cn('shrink-0 text-right text-ink tnum', md ? 'type-stat-sm' : 'type-data font-medium', figure && 'w-20 max-md:order-last max-md:text-left md:w-24')}>{value}</span>
      )}
      {figure && <span className="min-w-0 max-md:order-last max-md:flex-1 md:w-48 md:shrink-0 xl:w-64">{figure}</span>}
      {action && !interactive && <span className="shrink-0">{action}</span>}
      {interactive && (
        <Icon
          name={expanded !== undefined ? 'chevron-down' : href !== undefined && isExternal(href) ? 'external' : 'chevron-right'}
          size={16}
          className={cn('text-ink-3 transition-[color,transform] duration-slide group-hover/row:text-ink', expanded && 'rotate-180')}
        />
      )}
      {toggle && (
        <button
          type="button" onClick={toggle.onToggle} disabled={toggle.disabled} aria-expanded={toggle.disabled ? undefined : expanded ?? false} aria-label={toggle.label}
          className={cn(buttonClass({ variant: 'quiet', size: 'sm' }), 'px-3 text-ink-2 hover:bg-transparent group-hover/row:text-ink sm:min-w-28 sm:justify-end', '-mr-3')}
        >
          <span className={cn('whitespace-nowrap', !toggle.disabled && 'max-sm:sr-only')}>{toggle.text}</span>
          {!toggle.disabled && <Icon name="chevron-down" size={16} className={cn('transition-transform duration-slide', expanded && 'rotate-180')} />}
        </button>
      )}
    </>
  );
  // The hover ground runs 12px past the rules on both sides, so words never touch its edge.
  const cls = cn(
    // Above the next row, so its ground does not cover the bottom of the focus ring.
    'group/row relative -mx-3 flex w-[calc(100%+24px)] items-center gap-4 px-3 text-left focus-visible:z-10',
    md ? 'min-h-16 py-4' : 'min-h-12 py-2',
    figure && 'max-md:flex-wrap max-md:gap-y-2',
    (interactive || opens) && cn('transition-colors duration-in', hoverGround),
    opens && 'cursor-pointer',
    selected && selectedGround,
    className,
  );
  const shared = { className: cls, 'data-selected': selected || undefined, 'aria-label': ariaLabel, ...(onPrefetch ? { onPointerEnter: onPrefetch, onFocus: onPrefetch } : {}) };
  const shortcut = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button') || window.getSelection()?.toString()) return;
    toggle?.onToggle();
  };
  return (
    <li id={id} className="relative scroll-mt-bar border-b border-line">
      {href !== undefined ? (
        isExternal(href)
          ? <a href={href} target="_blank" rel="noopener noreferrer" {...shared}>{inner}</a>
          : <Link href={href} aria-current={selected ? 'true' : undefined} {...shared}>{inner}</Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} aria-pressed={expanded === undefined ? selected : undefined} aria-expanded={expanded} {...shared}>{inner}</button>
      ) : (
        <div aria-current={selected ? 'true' : undefined} onClick={opens ? shortcut : undefined} {...shared}>{inner}</div>
      )}
      {children}
    </li>
  );
}
