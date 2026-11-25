import { cn } from '@/lib/utils';
import { Stat, type StatProps } from './Stat';

interface StatStripProps {
  items: (StatProps & { key?: string })[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const COLS = {
  2: 'lg:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'md:grid-cols-3 lg:grid-cols-5',
  6: 'md:grid-cols-3 lg:grid-cols-6',
} as const;

/** Hairline cells, no box; two columns on phones. The grid clips the outer hairlines so both edges stay flush. */
export function StatStrip({ items, columns = 4, className }: StatStripProps) {
  return (
    <div className={cn('overflow-hidden border-y border-line', className)}>
      <div className={cn('-mb-px -ml-[17px] grid grid-cols-2 max-sm:[&>:last-child:nth-child(odd)]:col-span-2', COLS[columns])}>
        {items.map(({ key, ...stat }, i) => (
          <div key={key ?? i} className="min-w-0 border-b border-l border-line px-4 py-4">
            <Stat size="sm" {...stat} />
          </div>
        ))}
      </div>
    </div>
  );
}
