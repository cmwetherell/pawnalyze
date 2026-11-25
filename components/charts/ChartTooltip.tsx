import type { Tone } from '@/lib/theme/tones';
import { Swatch } from '@/components/ui/Swatch';
import { cn } from '@/lib/utils';
import type { Box } from './labelSolver';
import { MarkerKey, type MarkerShape } from './Marker';
import { clamp, textWidth } from './scales';

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  /** Color of the key; leave out for a row that has no mark. */
  tone?: Tone;
  shape?: 'line' | 'square';
  /** An outlined marker instead of a color. */
  marker?: MarkerShape;
  /** The promoted or strong series. */
  strong?: boolean;
}

interface ChartTooltipProps {
  /** Pixel of the pointed-at index, and the width of the plot box. */
  x: number;
  width: number;
  title: string;
  rows: TooltipRow[];
  top?: number;
  /** Clear of the mark on either side. */
  gap?: number;
  /** A label the tooltip may not cover, in pixels of the plot box, and how far down the plot goes. */
  avoid?: Box;
  within?: number;
}

const MAX_W = 220;
const MIN_W = 128;
const LINE = 21;
const PAD = 18;
const MAX_ROWS = 6;
const MIN_ROWS = 3;

/** The one tooltip: six rows at most, flips side past the middle, never takes the pointer. */
export function ChartTooltip({ x, width, title, rows, top = 8, gap = 14, avoid, within = Infinity }: ChartTooltipProps) {
  const keyed = rows.some(r => r.tone || r.marker);
  const wide = clamp(Math.max(textWidth(title, 14, true), ...rows.map(r => textWidth(r.label, 14, r.strong) + textWidth(r.value, 14) + (keyed ? 32 : 8))) + 26, MIN_W, MAX_W);
  const past = x > width / 2;
  // The same place along the whole side it could cover the label from, so it does not jump as the pointer moves.
  const reaches = avoid !== undefined && !past && width / 2 + gap + wide > avoid.x;
  // Over the label, or under it: where there is more height, with fewer rows if it has to be.
  const above = reaches ? avoid.y - 4 : 0;
  const below = reaches ? within - avoid.y - avoid.h - 4 : 0;
  const tall = (n: number) => PAD + LINE * (1 + n);
  const most = reaches ? Math.max(Math.min(rows.length, MIN_ROWS), Math.min(MAX_ROWS, Math.floor((Math.max(above - (top - 8), below) - PAD) / LINE) - 1)) : MAX_ROWS;
  // A strong or promoted row outside the first ones takes the last place.
  const extra = rows.slice(most).filter(r => r.strong).slice(0, 2);
  const shown = [...rows.slice(0, most - extra.length), ...extra];
  const height = tall(shown.length);
  const places = !reaches || top + height < avoid.y ? [top] : [above - height, within - below].filter((t, i) => height <= (i === 0 ? above : below));
  // No height for it at all: stop short of the label, on the side with more room.
  const at = places.length ? places[places.length - 1] : undefined;
  const end = at === undefined && avoid ? avoid.x : width;
  const flip = at === undefined ? x > end - x : past;
  const maxWidth = Math.max(MIN_W, Math.min(MAX_W, (flip ? x : end - x) - gap));
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-tooltip min-w-32 rounded-md border border-line bg-raised px-3 py-2 type-small text-ink shadow-pop"
      style={{ top: at ?? top, maxWidth, ...(flip ? { right: width - x + gap } : { left: x + gap }) }}
    >
      <div className="font-medium">{title}</div>
      {shown.map(r => (
        <div key={r.key} className="flex items-center gap-2 whitespace-nowrap">
          {keyed && <span className="inline-flex w-4 shrink-0 items-center">{r.marker ? <MarkerKey shape={r.marker} /> : r.tone ? <Swatch tone={r.tone} shape={r.shape ?? 'line'} /> : null}</span>}
          <span className={cn('min-w-0 flex-1 truncate', r.strong ? 'font-medium text-ink' : 'text-ink-2')}>{r.label}</span>
          <span className="tnum">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
