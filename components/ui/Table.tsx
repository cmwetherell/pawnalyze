import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { cellLink } from './styles';

export { Tr, type TrProps } from './TableRow';

export type Align = 'left' | 'right' | 'center';
/** 1 always, 2 from 640, 3 from 768, 4 from 1280. */
export type Priority = 1 | 2 | 3 | 4;
export type SortDir = 'asc' | 'desc';

const ALIGN: Record<Align, string> = { left: 'text-left', right: 'text-right', center: 'text-center' };
const PRIORITY: Record<Priority, string> = { 1: '', 2: 'hidden sm:table-cell', 3: 'hidden md:table-cell', 4: 'hidden xl:table-cell' };
/** Space between columns is on the right of each cell. `pl-0` removes the browser's own 1px, so words start on the rule's edge. */
const CELL = 'pl-0 pr-3 md:pr-4';
/** The last visible cell ends flush with the page edge; `data-p` is the priority of a cell that may be hidden. */
const LAST_FLUSH = [
  '[&_:is(td,th):last-child]:!pr-0',
  'max-sm:[&_:is(td,th):nth-last-child(1_of_:not([data-p]))]:!pr-0',
  'sm:max-md:[&_:is(td,th):nth-last-child(1_of_:not([data-p="3"],[data-p="4"]))]:!pr-0',
  'md:max-xl:[&_:is(td,th):nth-last-child(1_of_:not([data-p="4"]))]:!pr-0',
].join(' ');

interface TableProps {
  /** Names the table for assistive tech. */
  label?: string;
  /** row: 52px. compact: 40px (44 on phones). */
  density?: 'row' | 'compact';
  /** The head stays under the section bar while the table scrolls. */
  stickyHead?: boolean;
  /** Only TableFallback may scroll sideways. */
  scroll?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Never wider than its column. On phones the `priority` of each column decides what is shown, and the name column
 * (`Td header`) takes the space that is left and truncates.
 */
export function Table({ label, density = 'row', stickyHead = false, scroll = false, className, children }: TableProps) {
  return (
    <div className={cn('relative z-0 min-w-0', scroll && 'overflow-x-auto overscroll-x-contain', className)} {...(scroll ? { 'data-scroll-row': '', tabIndex: 0, role: 'region', 'aria-label': label } : {})}>
      <table
        aria-label={label}
        data-density={density}
        data-sticky={stickyHead || undefined}
        data-scroll={scroll || undefined}
        className={cn('group/table w-full border-separate border-spacing-0 type-data text-ink', LAST_FLUSH)}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <thead
      className={cn(
        'group-data-[sticky]/table:sticky group-data-[sticky]/table:top-bar group-data-[sticky]/table:z-10 group-data-[sticky]/table:bg-canvas',
        // Its own layer, so it covers the bleed of the rows that pass under it.
        "[&>tr]:bg-inherit group-data-[sticky]/table:[&_th]:relative group-data-[sticky]/table:[&_th]:bg-inherit group-data-[sticky]/table:[&_th]:before:absolute group-data-[sticky]/table:[&_th]:before:-inset-x-3 group-data-[sticky]/table:[&_th]:before:inset-y-0 group-data-[sticky]/table:[&_th]:before:-z-10 group-data-[sticky]/table:[&_th]:before:bg-inherit group-data-[sticky]/table:[&_th]:before:content-['']",
        'group-data-[ground=surface]/ground:group-data-[sticky]/table:bg-surface group-data-[panel]/panel:group-data-[sticky]/table:bg-surface',
        className,
      )}
    >
      {children}
    </thead>
  );
}

interface ThProps extends Omit<ComponentPropsWithoutRef<'th'>, 'align'> {
  /** Current direction, `null` when sortable but not sorted. */
  sort?: SortDir | null;
  onSort?: () => void;
  align?: Align;
  priority?: Priority;
  width?: number | string;
}

const FLEX: Record<Align, string> = { left: '', right: 'flex-row-reverse', center: 'justify-center' };

export function Th({ sort, onSort, align = 'left', priority = 1, width, className, children, scope = 'col', style, ...rest }: ThProps) {
  return (
    <th
      scope={scope}
      data-p={priority > 1 ? priority : undefined}
      aria-sort={sort ? (sort === 'asc' ? 'ascending' : 'descending') : undefined}
      style={width !== undefined ? { width, ...style } : style}
      className={cn('whitespace-nowrap border-b border-control align-bottom type-ui text-ink-2', CELL, onSort ? 'py-0' : 'py-3', ALIGN[align], PRIORITY[priority], className)}
      {...rest}
    >
      {onSort ? (
        // Right-aligned columns put the arrow first, so the words still end where the numbers end.
        <button type="button" onClick={onSort} className={cn('group/sort inline-flex min-h-tap items-center gap-1 transition-colors duration-in hover:text-ink', FLEX[align], sort && 'text-ink')}>
          {children}
          <Icon name={sort === 'asc' ? 'up' : sort === 'desc' ? 'down' : 'sort'} size={14} className={cn('transition-colors duration-in', sort ? 'h-2.5 w-2.5 text-ink' : 'text-ink-3 group-hover/sort:text-ink')} />
        </button>
      ) : children}
    </th>
  );
}

export function TBody({ className, children }: { className?: string; children: ReactNode }) {
  return <tbody className={className}>{children}</tbody>;
}

interface TdProps extends Omit<ComponentPropsWithoutRef<'td'>, 'align'> {
  align?: Align;
  priority?: Priority;
  muted?: boolean;
  /** Row header: use on the name column. It takes the space that is left and truncates; a link in it is as tall as the row. */
  header?: boolean;
  /** With `header`: all the space the other columns leave, at every width (a narrow table). */
  grow?: boolean;
  /** With `header`: flag, avatar or medal before the name. */
  lead?: ReactNode;
  /** With `header`: seed or code after the name, never truncated. */
  meta?: ReactNode;
  /** With `header`: a quiet second line under the name. */
  sub?: ReactNode;
}

const ROW_H = 'h-[52px] group-data-[density=compact]/table:h-11 md:group-data-[density=compact]/table:h-10';

export function Td({ align = 'left', priority = 1, muted = false, header = false, grow = false, lead, meta, sub, className, children, ...rest }: TdProps) {
  const cls = cn('border-b border-line py-1 align-middle font-normal', ROW_H, CELL, ALIGN[align], PRIORITY[priority], align === 'right' && 'whitespace-nowrap', muted && 'text-ink-3');
  const data = priority > 1 ? priority : undefined;
  if (!header) return <td data-p={data} className={cn(cls, className)} {...rest}>{children}</td>;
  return (
    <th
      scope="row"
      data-p={data}
      className={cn(cls, 'py-0', 'w-full max-w-0', !grow && 'md:w-1/3 md:group-data-[density=compact]/table:w-1/2', 'group-data-[scroll]/table:!w-auto group-data-[scroll]/table:max-w-none', className)}
      {...rest}
    >
      <div className="flex min-w-0 items-center gap-3">
        {lead && <span className="flex shrink-0 items-center">{lead}</span>}
        <div
          className={cn(
            'min-w-0 truncate [&_:focus-visible]:-outline-offset-2',
            '[&>a]:block [&>a]:truncate [&>a]:py-3',
            sub && '[&>a]:pb-0 [&>a]:pt-2',
            cellLink,
            'md:group-data-[density=compact]/table:[&>a]:py-2 [&>button]:block [&>button]:w-full [&>button]:truncate [&>button]:py-3 [&>button]:text-left md:group-data-[density=compact]/table:[&>button]:py-2',
          )}
        >
          {children}
          {sub && <span className="block truncate pb-2 type-label text-ink-3">{sub}</span>}
        </div>
        {meta && <span className="shrink-0 type-label text-ink-3">{meta}</span>}
      </div>
    </th>
  );
}
