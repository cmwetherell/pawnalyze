'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

import { formatter, type Formatter } from '@/lib/format';
import { fillClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';
import { ChartFrame, type ChartSize, type ChartTable } from './ChartFrame';
import { ChartTooltip, type TooltipRow } from './ChartTooltip';
import { clamp, textWidth } from './scales';
import { useOutsidePress } from './useOutsidePress';

export interface Column {
  key: string;
  /** Under the column; empty for an unlabeled one. Labels that would touch are thinned out. */
  label: string;
  /** Second line, where the columns are wide enough for it. */
  sub?: string;
  /** Tooltip heading when `label` is short or empty. */
  title?: string;
  /** From the baseline up. */
  parts: { tone: Tone; value: number; label: string }[];
}

interface ColumnChartProps {
  columns: Column[];
  format: Formatter;
  /** Set the largest value in the display face. */
  peak?: boolean;
  /** Plot height in px, default 320; at most 260 under 560px. */
  height?: number;
  /** Print a value over every column; off for dense charts. A number prints only the values from there up. Columns narrower than their numbers keep only the peak and the selected one. */
  values?: boolean | number;
  onHover?: (key: string | null) => void;
  onSelect?: (key: string) => void;
  selected?: string;
  caption?: string;
  ariaLabel: string;
  table?: ChartTable;
  className?: string;
}

/** Over the columns: room for the peak, for a plain value, for none. */
const HEAD = { peak: 40, value: 28, none: 8 };
/** Under them: the mark, and each line of words. */
const MARK = 2;
const LABEL = 24;
const SUB = 18;

/** Columns from zero, stacked parts 2px apart. Arrow keys walk the columns, Enter selects. */
export function ColumnChart(props: ColumnChartProps) {
  const { columns, height = 320, caption, ariaLabel, table, className } = props;
  if (columns.length === 0) return null;
  const label = columns.some(c => c.label) ? LABEL : 0;
  const sub = columns.some(c => c.sub) ? SUB : 0;
  return (
    <ChartFrame
      caption={caption} ariaLabel={ariaLabel} table={table} className={className}
      height={{ desktop: height + MARK + label + sub, phone: Math.min(height, 260) + MARK + label }}
    >
      {size => <Plot {...props} size={size} plot={size.phone ? Math.min(height, 260) : height} />}
    </ChartFrame>
  );
}

function Plot({ columns, format, peak = true, values = true, onHover, onSelect, selected, ariaLabel, size, plot }: ColumnChartProps & { size: ChartSize; plot: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [said, setSaid] = useState('');
  const fmt = formatter(format);
  const n = columns.length;
  const W = size.width;

  // Whole pixels, so that thin columns and their gaps stay even.
  const pitch = W / n;
  const gap = pitch < 6 ? 1 : pitch < 16 ? 2 : Math.round(clamp(pitch * 0.14, 2, 16));
  const step = (W + gap) / n;
  const left = (i: number) => Math.round(i * step);
  const wide = (i: number) => Math.max(1, Math.round((i + 1) * step) - gap - left(i));
  const mid = (i: number) => left(i) + wide(i) / 2;
  /** Center of a text that has to stay inside the box. */
  const inside = (i: number, w: number) => (w >= W ? W / 2 : clamp(mid(i), w / 2, W - w / 2));

  const totals = columns.map(c => c.parts.reduce((s, p) => s + p.value, 0));
  const max = Math.max(...totals, 1e-9);
  const top = totals.indexOf(Math.max(...totals));
  const peaks = peak && values !== false && totals[top] > 0;
  const marked = (i: number) => columns[i].key === selected || (peak && i === top && totals[i] > 0);

  // Numbers that do not fit their columns in the 14px size are set in 12px.
  const size14 = columns.every((_, i) => (peaks && i === top) || textWidth(fmt(totals[i]), 14) + 4 <= step);
  const numberSize = size14 ? 14 : 12;
  const plainWidth = (i: number) => textWidth(fmt(totals[i]), numberSize, i === top || columns[i].key === selected) + 4;
  /** The display face is for a peak that stands clear of the numbers beside it. */
  const beside = [top - 1, top + 1].filter(i => columns[i] && totals[i] > 0 && (typeof values !== 'number' || totals[i] >= values));
  const grand = peaks && beside.every(i => totals[top] > 0 && (plainWidth(i) > step || (textWidth(fmt(totals[top]), 26) + plainWidth(i)) / 2 + 8 <= step || (totals[top] - totals[i]) / max * (plot - HEAD.peak) > 24));
  const big = (i: number) => grand && i === top;
  const valueWidth = (i: number) => (big(i) ? textWidth(fmt(totals[i]), 26) + 4 : plainWidth(i));
  const wanted = (i: number) => (columns[i].key === selected && (n <= 20 || i === top) ? true : typeof values === 'number' ? totals[i] >= values : values);
  const printed = columns.flatMap((_, i) => (wanted(i) && (valueWidth(i) <= step || marked(i)) ? [i] : []));
  const head = printed.length === 0 ? HEAD.none : printed.some(big) ? HEAD.peak : HEAD.value;
  const tall = (v: number) => (plot - head) * (v / max);
  /** Top of a column: its parts and the gaps between them. */
  const crown = (i: number) => {
    const shown = columns[i].parts.filter(p => p.value > 0);
    return plot - shown.reduce((s, p) => s + Math.max(1, tall(p.value)), 0) - 2 * Math.max(0, shown.length - 1);
  };
  const valueBox = (i: number) => ({ x: inside(i, valueWidth(i)), w: valueWidth(i), bottom: crown(i), h: big(i) ? 30 : 22 });
  // The peak and the selected number come first; a neighbor they would touch is left to the tooltip.
  const numbers = [...printed].sort((a, b) => Number(big(b)) - Number(big(a)) || Number(marked(b)) - Number(marked(a))).reduce<number[]>((kept, i) => {
    const a = valueBox(i);
    const hit = kept.some(k => { const b = valueBox(k); return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && a.bottom - a.h < b.bottom && b.bottom - b.h < a.bottom; });
    // Nor may a number wider than its column stand on a taller neighbor.
    const covered = columns.some((_, k) => k !== i && crown(k) < a.bottom - 2 && left(k) < a.x + a.w / 2 - 2 && left(k) + wide(k) > a.x - a.w / 2 + 2);
    return (hit || covered) && !big(i) ? kept : [...kept, i];
  }, []);

  const labelWidth = (i: number) => textWidth(columns[i].label, 13, marked(i)) + 8;
  const named = columns.flatMap((c, i) => (c.label ? [i] : []));
  const stride = named.length < 2 ? W : step * (named[1] - named[0]);
  const every = [1, 2, 3, 4, 5, 10, 20].find(k => Math.max(0, ...named.map(labelWidth)) <= stride * k) ?? 50;
  const labels = [...named.filter(marked), ...named.filter((i, k) => k % every === 0 && !marked(i))].reduce<number[]>((kept, i) => {
    const hit = kept.some(k => Math.abs(inside(i, labelWidth(i)) - inside(k, labelWidth(k))) < Math.max((labelWidth(i) + labelWidth(k)) / 2, every > 1 ? stride * every * 0.75 : 0));
    return hit ? kept : [...kept, i];
  }, []);
  const subs = !size.phone && columns.every(c => !c.sub || textWidth(c.sub, 13) + 4 <= step);

  const go = (i: number | null) => { setAt(i); onHover?.(i === null ? null : columns[i].key); };
  const clear = () => { go(null); setTouched(false); };
  useOutsidePress(box, touched, clear);
  const onPoint = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    go(clamp(Math.floor(((e.clientX - r.left) / r.width) * n), 0, n - 1));
    setTouched(e.pointerType !== 'mouse');
  };
  const rows = (c: Column, total: number): TooltipRow[] => [
    ...[...c.parts].reverse().map((p, k): TooltipRow => ({ key: `${k}`, label: p.label, value: fmt(p.value), tone: p.tone, shape: 'square' })),
    ...(c.parts.length > 1 ? [{ key: 'total', label: 'Total', value: fmt(total), strong: true }] : []),
  ];
  const title = (c: Column) => c.title ?? ([c.label, c.sub].filter(Boolean).join(', ') || c.key);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { go(null); setSaid(''); return; }
    if ((e.key === 'Enter' || e.key === ' ') && at !== null && onSelect) { e.preventDefault(); onSelect(columns[at].key); return; }
    const from = at ?? columns.findIndex(c => c.key === selected);
    const to = e.key === 'ArrowRight' ? from + 1 : e.key === 'ArrowLeft' ? (from < 0 ? n - 1 : from - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (to === null) return;
    e.preventDefault();
    e.stopPropagation();
    const i = clamp(to, 0, n - 1);
    go(i);
    setSaid(`${title(columns[i])}: ${rows(columns[i], totals[i]).map(r => `${r.label} ${r.value}`).join(', ')}`);
  };
  const place = (i: number, w: number) => ({ left: inside(i, w) - w / 2, width: w });

  return (
    <div
      ref={box}
      role="img"
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn('absolute inset-0 touch-pan-y select-none', onSelect && 'cursor-pointer')}
      onPointerMove={onPoint}
      onPointerDown={onPoint}
      onPointerLeave={e => { if (e.pointerType === 'mouse') clear(); }}
      onMouseDown={e => e.preventDefault()}
      onPointerCancel={clear}
      onBlur={() => { clear(); setSaid(''); }}
      onKeyDown={onKey}
      onClick={onSelect ? () => { if (at !== null) onSelect(columns[at].key); } : undefined}
    >
      <div className="absolute inset-x-0 top-0 border-b border-axis" style={{ height: plot }}>
        {columns.map((c, i) => (
          <div key={c.key} className="absolute inset-y-0 flex flex-col justify-end gap-0.5" style={{ left: left(i), width: wide(i) }}>
            {[...c.parts].reverse().filter(p => p.value > 0).map((p, k) => (
              <span key={k} className={cn('block min-h-px w-full shrink-0 transition-[height] duration-data', k === 0 && 'rounded-t-sm', fillClass[p.tone])} style={{ height: `calc((100% - ${head}px) * ${(p.value / max).toFixed(5)})` }} />
            ))}
          </div>
        ))}
        {numbers.map(i => (
          <span
            key={columns[i].key}
            className={cn('absolute flex justify-center whitespace-nowrap transition-[bottom] duration-data', big(i) ? 'type-stat-sm text-ink' : cn('pb-0.5 tnum', size14 ? 'type-small' : 'type-micro', i === top && peaks && 'font-semibold', marked(i) || i === at ? 'font-medium text-ink' : totals[i] > 0 ? 'text-ink-2' : 'text-ink-3'))}
            style={{ ...place(i, valueWidth(i)), bottom: plot - crown(i) }}
          >
            {fmt(totals[i])}
          </span>
        ))}
      </div>
      {columns.map((c, i) => (marked(i) || i === at) && (
        <span key={c.key} aria-hidden className={cn('absolute h-0.5', marked(i) ? 'bg-ink' : 'bg-control')} style={{ left: left(i), width: wide(i), top: plot }} />
      ))}
      {labels.map(i => (
        <span key={columns[i].key} className={cn('absolute whitespace-nowrap text-center type-label', marked(i) || i === at ? 'font-medium text-ink' : 'text-ink-2')} style={{ ...place(i, labelWidth(i)), top: plot + MARK + 4 }}>
          {columns[i].label}
        </span>
      ))}
      {subs && columns.map((c, i) => c.sub && (
        <span key={c.key} className="absolute whitespace-nowrap text-center type-label text-ink-3" style={{ ...place(i, Math.min(W, step)), top: plot + MARK + LABEL - 2 }}>{c.sub}</span>
      ))}
      <p aria-live="polite" className="sr-only">{said}</p>
      {at !== null && <ChartTooltip x={mid(at)} width={W} gap={Math.min(80, wide(at) / 2 + 8)} title={title(columns[at])} rows={rows(columns[at], totals[at])} />}
    </div>
  );
}
