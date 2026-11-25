import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Flag } from './Flag';
import { Medal } from './Medal';
import { ScrollRow } from './ScrollRow';
import { hoverGround, selectedGround } from './styles';

export interface PodiumStripPlace { name: string; /** Federation code. */ flag: string; value: ReactNode; delta?: ReactNode; title?: string }
export interface PodiumStripColumn {
  key: string;
  label: string;
  /** "118 ranked", or a Tag. */
  meta?: ReactNode;
  /** First, second, third; null where nobody holds the place yet. */
  places: (PodiumStripPlace | null)[];
}

interface PodiumStripProps { label: string; columns: PodiumStripColumn[]; selected?: string; onSelect: (key: string) => void; className?: string }

/** Several podiums side by side, each a button, parted by hairlines. Phones: a snapping row that runs to the page edge. */
export function PodiumStrip({ label, columns, selected, onSelect, className }: PodiumStripProps) {
  return (
    <ScrollRow label={label} bleed snap stretch className={className}>
      {columns.map(c => {
        const on = c.key === selected;
        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(c.key)}
            className={cn(
              'group/strip relative flex w-72 shrink-0 flex-col justify-start border-b border-t-2 border-line px-4 py-4 text-left transition-colors duration-in focus-visible:-outline-offset-2 lg:px-3 xl:px-4',
              'border-l first:border-l-0',
              on ? cn('border-t-rule', selectedGround) : cn('border-t-line', hoverGround),
            )}
          >
            <span className="flex min-h-6 items-center justify-between gap-2">
              <span className="type-h3 text-ink">{c.label}</span>
              {c.meta && <span className="shrink-0 type-label text-ink-3 tnum">{c.meta}</span>}
            </span>
            <span className="mt-3 block space-y-2">
              {([1, 2, 3] as const).map(rank => {
                const p = c.places[rank - 1];
                return (
                  // The flag goes with the figure, so a narrow column still has room for the name: two lines of it under 1280, where every place keeps that room.
                  <span key={rank} title={p?.title} className={cn('grid min-h-11 min-w-0 grid-cols-[auto_minmax(0,1fr)] content-start gap-x-2 lg:max-xl:min-h-16 type-data', rank === 1 ? 'font-medium text-ink' : 'text-ink-2')}>
                    <Medal rank={rank} className="row-span-2" />
                    {p ? (
                      <>
                        <span className="line-clamp-2 min-w-0 break-words xl:line-clamp-1">{p.name}</span>
                        <span className="col-start-2 flex min-w-0 items-center gap-2"><Flag code={p.flag} size="xs" decorative />{p.value}{p.delta}</span>
                      </>
                    ) : <span className="text-ink-3">Open</span>}
                  </span>
                );
              })}
            </span>
          </button>
        );
      })}
    </ScrollRow>
  );
}
