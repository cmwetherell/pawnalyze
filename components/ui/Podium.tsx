import type { ReactNode } from 'react';

import { fillClass, medalTone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';
import { Flag } from './Flag';
import { fitTitle, Heading } from './Heading';
import { Medal } from './Medal';
import { Stat, type StatProps } from './Stat';

export interface PodiumPlace {
  rank: 1 | 2 | 3;
  name: string;
  /** Federation code. */
  flag: string;
  stats: StatProps[];
  note?: ReactNode;
  /** "18.0% before round 1" */
  pre?: ReactNode;
}

interface PodiumProps {
  places: PodiumPlace[];
  /** stack: first place across, second and third under it side by side. row: three columns. */
  layout?: 'stack' | 'row';
  /** Names the list for assistive tech. */
  label?: string;
  className?: string;
}

/** A 3px medal-colored rule over each place; first place is larger. */
export function Podium({ places, layout = 'stack', label, className }: PodiumProps) {
  const stack = layout === 'stack';
  return (
    <ol aria-label={label} className={cn('grid grid-cols-1 gap-x-6 gap-y-8', stack ? 'sm:grid-cols-2' : 'md:grid-cols-3', className)}>
      {places.map(p => {
        const first = p.rank === 1 && stack;
        return (
          <li key={`${p.rank}-${p.name}`} className={cn('min-w-0', first && 'sm:col-span-2')}>
            <span aria-hidden className={cn('block h-[3px]', fillClass[medalTone(p.rank)])} />
            {/* Phones set second and third on one line: flag, name, medal. */}
            <div className={cn('mt-4 grid items-center gap-x-3', first || !stack ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_1fr]')}>
              <Flag code={p.flag} title={p.name} size={first ? 'hero' : 'xl'} decorative className="col-start-1 row-start-1" />
              <Medal rank={p.rank} size={28} className={cn('row-start-1 justify-self-end', first || !stack ? 'col-start-2 self-start' : 'col-start-3 sm:col-start-2 sm:self-start')} />
              <Heading level={3} style={fitTitle(p.name, first ? 'h1' : 'h3')} className={first ? 'col-span-2 mt-4' : stack ? 'col-start-2 row-start-1 sm:col-span-2 sm:col-start-1 sm:row-start-2 sm:mt-3' : 'col-span-2 mt-3'}>{p.name}</Heading>
            </div>
            {p.stats.length > 0 && (
              <div className={cn('flex flex-wrap gap-y-3', first ? 'mt-4 gap-x-8 border-t border-line pt-4' : 'mt-2 gap-x-4')}>
                {p.stats.map((s, i) => <Stat key={i} size="sm" {...s} />)}
              </div>
            )}
            {p.pre && <p className="mt-3 type-small text-ink-2">{p.pre}</p>}
            {p.note && <p className="mt-2 type-small text-ink-3">{p.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
