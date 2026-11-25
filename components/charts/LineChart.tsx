'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

import { formatter, type Formatter } from '@/lib/format';
import { token } from '@/lib/theme/css';
import { strokeVar, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';
import { XAxis, YAxis } from './Axis';
import { ChartFrame, type ChartSize, type ChartTable } from './ChartFrame';
import { useChartGroup } from './ChartGroup';
import { ChartTooltip, type TooltipRow } from './ChartTooltip';
import { Crosshair } from './Crosshair';
import { EndLabels, type EndLabel } from './EndLabels';
import { groundStroke, type Ground } from './ground';
import { placeInline, solveLabels, type Box, type InlineLabel, type Segment } from './labelSolver';
import { Marker, type MarkerShape } from './Marker';
import { useOutsidePress } from './useOutsidePress';
import { autoEvery, clamp, domain, fitText, linear, textWidth, tickLabels, xTicks } from './scales';

export interface LineSeries {
  id: string;
  label: string;
  /** Federation code or short name, under 560px. */
  short?: string;
  /** One per x label; null where there is no value. A line joins its points across nulls. */
  values: (number | null)[];
  tone: Tone;
  emphasis?: 'strong' | 'normal' | 'context';
  dash?: boolean;
  /** `end` (default): right of the line. A number: above that point. `none`: in the tooltip and table only. */
  labelAt?: 'end' | 'start' | 'none' | number;
  /** With `points="all"`: a second line under each printed value ("3rd"). */
  notes?: (string | null)[];
  /** What to print for each value, where the plotted number is not it: a capped evaluation, a mate. */
  texts?: (string | null)[];
  /** After the end label instead of the last value: "avg 46". */
  endValue?: string;
}

export interface LineMarker {
  x: number;
  y: number;
  shape: MarkerShape;
  /** Direct label of the last marker in its group ("Kalshi"); the value is added. */
  label: string;
  /** Markers of one source: joined by a dashed line when there are two or more. */
  group: string;
}

export interface LineChartProps {
  series: LineSeries[];
  /** `titles`: longer words for the tooltip ("After round 3"). */
  x: { labels: string[]; titles?: string[]; every?: { desktop: number; phone: number } };
  /** `format` may be a name from lib/format, so a server component can pass it. */
  y: { min?: number; max?: number; ticks?: number[]; format: Formatter };
  /** default 420 / 300 */
  height?: { desktop: number; phone: number };
  markers?: LineMarker[];
  refs?: { y: number; label: string }[];
  /** Dashed line: last known x. */
  now?: number;
  /** 15% fill. */
  area?: { series: string; mode: 'below' | 'zero' };
  /** `all`: every point drawn, values printed. */
  points?: 'none' | 'all';
  /** Print the last value after each end label; default true. */
  values?: boolean;
  selected?: number;
  onSelect?(i: number): void;
  onSeries?(id: string): void;
  /** What a series button does, after its name: "open details". */
  seriesAction?: string;
  /** Rows added to the tooltip at an index (a complement, a tiebreak chance). */
  extraRows?(i: number): { label: string; value: string; tone?: Tone }[];
  caption?: string;
  /** A control that changes the figure (a metric switch), at the right end of the caption line. */
  tools?: ReactNode;
  ariaLabel: string;
  /** Every chart has one; in a ChartGroup the last chart may carry the table of all of them. */
  table?: ChartTable;
  /** What the chart sits on. It finds a Panel or a surface group by itself; a Sheet has to say `raised`. */
  ground?: Ground;
  className?: string;
}

const T = 12;
const B = 32;
const REACH = 14;
/** Most a phone gives up to end labels: an eight-letter name. Longer ones use `short`, and the value goes under the name. */
const PHONE_GUTTER = 80;
/** From a name to the value under it. */
const SECOND_LINE = 17;
/** Inside a ChartGroup the plots share their edges. */
const GROUP_EDGE = { desktop: { L: 44, R: 140 }, phone: { L: 36, R: 92 } };

export function LineChart(props: LineChartProps) {
  const { series, x, height = { desktop: 420, phone: 300 }, caption, tools, ariaLabel, table, className } = props;
  return (
    <ChartFrame caption={caption} tools={tools} ariaLabel={ariaLabel} height={height} table={table} className={className}>
      {size => (series.length > 0 && x.labels.length > 0 ? <Plot {...props} size={size} /> : null)}
    </ChartFrame>
  );
}

interface Point { i: number; v: number }
const pointsOf = (s: LineSeries): Point[] => s.values.flatMap((v, i) => (v === null || v === undefined ? [] : [{ i, v }]));
const rank = (s: LineSeries, promoted: string | null) => (s.id === promoted ? 3 : s.emphasis === 'strong' ? 2 : s.emphasis === 'context' ? 0 : 1);

function Plot({
  series, x, y, markers = [], refs = [], now, area, points = 'none', values = true, selected, onSelect, onSeries, seriesAction, extraRows, ariaLabel, ground = 'auto', size,
}: LineChartProps & { size: ChartSize }) {
  const group = useChartGroup();
  const [ownHover, setOwnHover] = useState<number | null>(null);
  const [promoted, setPromoted] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [said, setSaid] = useState('');
  const box = useRef<HTMLDivElement>(null);

  const { width: W, height: H, phone } = size;
  const n = x.labels.length;
  const fmt = formatter(y.format);
  const shared = group ? group.hover : ownHover;
  const hover = shared !== null && shared < n ? shared : null;
  const setHover = group ? group.setHover : setOwnHover;

  const all = series.map(s => ({ s, pts: pointsOf(s) }));
  const dom = domain(y, [...all.flatMap(a => a.pts.map(p => p.v)), ...markers.map(m => m.y), ...refs.map(r => r.y)]);
  const ticks = tickLabels(dom.ticks, fmt);
  const name = (s: LineSeries) => (phone ? s.short ?? s.label : s.label);
  // With every point printed, the last one already says it.
  const printed = (s: LineSeries, i: number, v: number) => s.texts?.[i] ?? fmt(v);
  const valueText = (s: LineSeries, v: number) => s.endValue ?? s.texts?.[s.values.lastIndexOf(v)] ?? (values && points === 'none' && !s.label.includes(fmt(v)) ? fmt(v) : undefined);
  const nameWidth = (s: LineSeries) => textWidth(name(s), isStrong(s) ? 15 : 14, isStrong(s));
  const fullWidth = (s: LineSeries, v?: string) => nameWidth(s) + (v === undefined ? 0 : 6 + textWidth(v, 14, isStrong(s)));
  const isStrong = (s: LineSeries) => s.emphasis === 'strong';
  const isContext = (s: LineSeries) => s.emphasis === 'context' && s.id !== promoted;
  const color = (s: LineSeries) => (isContext(s) ? token('context') : strokeVar(s.tone));

  const labelInset = phone ? 12 : 14;

  // Margins. Lines that stop before the last x (a match in progress) are labeled inside the plot.
  const labeled = all.filter(a => a.pts.length > 0 && a.s.labelAt !== 'none');
  const ended = labeled.filter(a => (a.s.labelAt ?? 'end') === 'end');
  const lastX = ended.length ? Math.max(...ended.map(a => a.pts[a.pts.length - 1].i)) : n - 1;
  // White and Black alternate, so one line may stop a half-move before the other.
  const near = Math.max(1, Math.floor(n / 40));
  const inColumn = ended.filter(a => lastX - a.pts[a.pts.length - 1].i < (n > 20 ? near + 1 : 1));
  const lastMarkers = [...new Map(markers.map(m => [m.group, m])).values()].map(m => ({ ...m, ...markers.filter(k => k.group === m.group).reduce((a, b) => (b.x > a.x ? b : a)) }));
  const columnMarkers = lastMarkers.filter(m => m.x === lastX);
  const wide = Math.max(
    0,
    ...inColumn.map(a => { const w = fullWidth(a.s, valueText(a.s, a.pts[a.pts.length - 1].v)); return phone && w + labelInset + 4 > PHONE_GUTTER ? nameWidth(a.s) : w; }),
    ...columnMarkers.map(m => textWidth(`${m.label} ${fmt(m.y)}`, 14)),
    ...(lastX === n - 1 && !phone ? refs.map(r => textWidth(r.label, 14)) : []),
  );
  // On phones a reference is named on its line, inside the plot.
  const refWide = lastX === n - 1 || phone ? 0 : Math.max(0, ...refs.map(r => textWidth(r.label, 14)));
  const L = group ? GROUP_EDGE[phone ? 'phone' : 'desktop'].L : Math.ceil(Math.max(...ticks.map(t => textWidth(t, 12)), 8)) + 11;
  const share = n > 1 ? lastX / (n - 1) : 1;
  const need = share > 0 ? (L + (W - L) * share + labelInset + 4 + wide - W) / share : 0;
  const most = phone ? PHONE_GUTTER : W * 0.34;
  const R = group ? GROUP_EDGE[phone ? 'phone' : 'desktop'].R : Math.ceil(clamp(Math.max(need, refWide ? refWide + 18 : 0), wide || refWide ? 24 : 12, most));
  const plotW = W - L - R;
  // Printed values need room at both ends.
  const inset = points === 'all' ? 16 : 0;
  const X = n > 1 ? linear(0, n - 1, L + inset, W - R - inset) : () => L + plotW / 2;
  const Y = linear(dom.min, dom.max, H - B, T);
  const every = (phone ? x.every?.phone : x.every?.desktop) ?? Math.max(autoEvery(x.labels, plotW), phone && n > 8 ? 2 : 1);
  const line = (pts: Point[]) => pts.map((p, k) => `${k ? 'L' : 'M'}${X(p.i).toFixed(1)} ${Y(p.v).toFixed(1)}`).join('');

  // What can be pointed at: every x that has a value or a marker.
  const live = [...new Set([...all.flatMap(a => a.pts.map(p => p.i)), ...markers.map(m => m.x)])].sort((a, b) => a - b);
  const nearestX = (px: number) => live.reduce((best, i) => (Math.abs(X(i) - px) < Math.abs(X(best) - px) ? i : best), live[0] ?? 0);
  const canPromote = onSeries !== undefined || series.some(s => s.emphasis === 'context');
  const nearestSeries = (px: number, py: number): string | null => {
    if (!canPromote) return null;
    let best: string | null = null;
    let gap = REACH;
    for (const { s, pts } of all) {
      const k = pts.findIndex(p => X(p.i) >= px);
      if (pts.length === 0 || px < X(pts[0].i) - REACH || px > X(pts[pts.length - 1].i) + REACH) continue;
      const b = pts[k < 0 ? pts.length - 1 : k];
      const a = pts[Math.max(0, (k < 0 ? pts.length : k) - 1)];
      const t = a.i === b.i ? 0 : (px - X(a.i)) / (X(b.i) - X(a.i));
      const d = Math.abs(Y(a.v) + (Y(b.v) - Y(a.v)) * clamp(t, 0, 1) - py);
      if (d < gap) { gap = d; best = s.id; }
    }
    return best;
  };
  const local = (e: { clientX: number; clientY: number; currentTarget: Element }) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { px: e.clientX - r.left, py: e.clientY - r.top };
  };

  const rowsAt = (i: number, word = name): TooltipRow[] => [
    ...all
      .flatMap(({ s }) => { const v = s.values[i]; return v === null || v === undefined ? [] : [{ s, v }]; })
      .sort((a, b) => b.v - a.v)
      .map(({ s, v }): TooltipRow => ({ key: s.id, label: word(s), value: printed(s, i, v), tone: isContext(s) ? 'context' : s.tone, strong: isStrong(s) || s.id === promoted })),
    ...(extraRows?.(i) ?? []).map((r): TooltipRow => ({ key: `x-${r.label}`, ...r })),
    ...markers.filter(m => m.x === i).map((m): TooltipRow => ({ key: `m-${m.group}`, label: m.group, value: fmt(m.y), marker: m.shape })),
  ];
  const titleAt = (i: number) => x.titles?.[i] ?? x.labels[i];

  const clear = () => { setHover(null); setPromoted(null); setTouched(false); };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const { px, py } = local(e);
    setHover(nearestX(px));
    setPromoted(nearestSeries(px, py));
    setTouched(e.pointerType !== 'mouse');
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { clear(); setSaid(''); return; }
    if (e.key === 'Enter' || e.key === ' ') {
      if (promoted !== null && onSeries) { e.preventDefault(); onSeries(promoted); } else if (hover !== null && onSelect) { e.preventDefault(); onSelect(hover); }
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (!canPromote) return;
      e.preventDefault();
      const order = [...all].filter(a => a.pts.length).sort((a, b) => b.pts[b.pts.length - 1].v - a.pts[a.pts.length - 1].v).map(a => a.s);
      const k = order.findIndex(s => s.id === promoted);
      const next = order[clamp(k < 0 ? (e.key === 'ArrowDown' ? 0 : order.length - 1) : k + (e.key === 'ArrowDown' ? 1 : -1), 0, order.length - 1)];
      setPromoted(next.id);
      setSaid(next.label);
      return;
    }
    const from = hover ?? selected ?? null;
    const k = from === null ? -1 : live.indexOf(from);
    const to = e.key === 'ArrowRight' ? (k < 0 ? 0 : k + 1) : e.key === 'ArrowLeft' ? (k < 0 ? live.length - 1 : k - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? live.length - 1 : null;
    if (to === null || live.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    const i = live[clamp(to, 0, live.length - 1)];
    setHover(i);
    setSaid(`${titleAt(i)}: ${rowsAt(i, s => s.label).slice(0, 6).map(r => `${r.label} ${r.value}`).join(', ')}`);
  };

  // A touch leaves the tooltip up; the next touch anywhere else takes it down.
  useOutsidePress(box, touched, clear);

  // Labels.
  const labelX = lastX === n - 1 ? W - R : X(lastX);
  const labelRoom = W - (labelX + labelInset) - 2;
  const gap = phone ? 22 : 20;
  // On phones values go under the names when one of them does not fit beside its name and there is height for all of them.
  const valued = inColumn.flatMap(({ s, pts }) => { const v = s.emphasis === 'context' ? undefined : valueText(s, pts[pts.length - 1].v); return v === undefined ? [] : [{ s, v }]; });
  const stack = phone && valued.some(({ s, v }) => fullWidth(s, v) > labelRoom + 2) && inColumn.length * gap + valued.length * SECOND_LINE < (H - B - T) * 0.8;
  const column: EndLabel[] = [
    ...inColumn.map(({ s, pts }): EndLabel => {
      const v = pts[pts.length - 1].v;
      const strong = isStrong(s);
      const size = strong ? 15 : 14;
      // A long name keeps its letters and gives up its number, which the tooltip and the table still have.
      const own = valueText(s, v);
      const under = stack && s.emphasis !== 'context' && own !== undefined;
      const value = under || fullWidth(s, own) <= labelRoom + 2 ? own : undefined;
      const text = fitText(name(s), labelRoom, size, strong);
      return {
        id: s.id, text, value, extra: under ? SECOND_LINE : undefined, y: Y(v), strong, plain: s.emphasis !== 'context', color: color(s),
        ariaLabel: `${s.label} ${fmt(v)}${seriesAction ? `, ${seriesAction}` : ''}`,
        onSelect: onSeries && (() => onSeries(s.id)),
      };
    }),
    ...columnMarkers.map((m): EndLabel => ({ id: `m-${m.group}`, text: m.label, value: m.label.includes(fmt(m.y)) ? undefined : fmt(m.y), y: Y(m.y), strong: false, color: token('ink-3') })),
    ...(lastX === n - 1 && !phone ? refs.map((r): EndLabel => ({ id: `r-${r.label}`, text: r.label, y: Y(r.y), strong: false, color: token('ink-3') })) : []),
  ];
  const solved = solveLabels(column, T, H - B - 4, gap);
  const inlineSeries = labeled.filter(a => !inColumn.includes(a));
  const anchor = (a: { s: LineSeries; pts: Point[] }): Point => {
    const want = a.s.labelAt === 'start' ? a.pts[0].i : typeof a.s.labelAt === 'number' ? a.s.labelAt : a.pts[a.pts.length - 1].i;
    return a.pts.find(p => p.i === want) ?? a.pts.reduce((b, p) => (Math.abs(p.i - want) < Math.abs(b.i - want) ? p : b));
  };
  const lines = all.map(({ s, pts }) => ({ s, parts: pts.slice(1).map((p, k): Segment => ({ x1: X(pts[k].i), y1: Y(pts[k].v), x2: X(p.i), y2: Y(p.v) })) }));
  const inline: InlineLabel[] = [
    ...inlineSeries.map((a): InlineLabel => {
      const p = anchor(a);
      const onLine = typeof a.s.labelAt === 'number' || a.s.labelAt === 'start';
      const near = a.pts.filter(q => q !== p).sort((q, r) => Math.abs(q.i - p.i) - Math.abs(r.i - p.i)).slice(0, 8);
      return {
        id: a.s.id, x: X(p.i), y: Y(p.v), width: nameWidth(a.s) + 2, prefer: onLine ? 'above' : 'right',
        alts: onLine ? near.map(q => ({ x: X(q.i), y: Y(q.v) })) : undefined,
        // A context line that has no clear spot of its own goes unnamed rather than naming another.
        own: a.s.emphasis === 'context' ? lines.find(l => l.s === a.s)?.parts : undefined,
      };
    }),
    ...(phone ? refs : []).map((r): InlineLabel => {
      const width = textWidth(r.label, 14) + 2;
      const [from, to] = [L + width / 2, W - R - width / 2];
      return { id: `r-${r.label}`, x: from, y: Y(r.y) + 3, width, prefer: 'above', alts: [to, (from + to) / 2].map(at => ({ x: at, y: Y(r.y) + 3 })) };
    }),
    ...lastMarkers.filter(m => m.x !== lastX).map((m): InlineLabel => ({ id: `m-${m.group}`, x: X(m.x), y: Y(m.y), width: textWidth(`${m.label} ${fmt(m.y)}`, 14) + 2, prefer: 'right' })),
  ];
  const labelBox = (l: EndLabel): Box => ({ x: labelX + labelInset - 6, y: (solved.get(l.id) ?? l.y) - gap / 2, w: textWidth(l.extra ? l.text : `${l.text}  ${l.value ?? ''}`, 15, l.strong) + 12, h: gap + (l.extra ?? 0) });
  const taken: Box[] = [
    ...markers.map(m => ({ x: X(m.x) - 8, y: Y(m.y) - 8, w: 16, h: 16 })),
    ...(points === 'all' ? all.flatMap(({ s, pts }) => pts.map(p => ({ x: X(p.i) - 14, y: Y(p.v) - 26, w: 28, h: s.notes ? 52 : 32 }))) : []),
    ...column.map(labelBox),
  ];
  const spots = placeInline(inline, lines.flatMap(l => l.parts), taken, { x: L, y: 0, w: W - L - 2, h: H - B });

  const strongLabel = column.find(l => l.strong);
  const ordered = [...all].sort((a, b) => rank(a.s, promoted) - rank(b.s, promoted));
  const areaOf = area ? all.find(a => a.s.id === area.series) : undefined;
  const at = hover ?? (selected !== undefined && selected < n ? selected : null);
  const halo = groundStroke[ground];
  const inlineText = (id: string, text: string, strong: boolean, context: boolean) => {
    const p = spots.get(id);
    return p && (
      <text
        key={id} x={p.x} y={p.y} textAnchor={p.anchor} paintOrder="stroke" strokeWidth={5} strokeLinejoin="round"
        className={cn(strong ? 'type-data font-semibold' : 'type-small tnum', strong || promoted === id ? 'fill-ink' : context ? 'fill-ink-3' : 'fill-ink-2', halo)}
      >
        {text}
      </text>
    );
  };

  return (
    <div ref={box} className="absolute inset-0">
      <svg
        width={W} height={H} role="img" aria-label={ariaLabel} tabIndex={0}
        className={cn('block select-none touch-pan-y overflow-visible', promoted !== null && onSeries ? 'cursor-pointer' : onSelect ? 'cursor-crosshair' : '')}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={e => { if (e.pointerType === 'mouse') clear(); }}
        onMouseDown={e => e.preventDefault()}
        onPointerCancel={clear}
        onBlur={() => { clear(); setSaid(''); }}
        onKeyDown={onKey}
        onClick={e => {
          const { px, py } = local(e);
          const near = onSeries ? nearestSeries(px, py) : null;
          if (near !== null && onSeries) onSeries(near);
          else if (live.length) onSelect?.(nearestX(px));
        }}
      >
        <YAxis ticks={dom.ticks} labels={ticks} y={Y} left={L} right={W - R} baseline={dom.min < 0 ? 0 : dom.min} />
        <XAxis labels={x.labels} ticks={xTicks(x.labels, every, X)} x={X} y={H - 8} active={hover} max={W} ground={ground} />
        {now !== undefined && now < n - 1 && <line x1={X(now)} x2={X(now)} y1={T} y2={H - B} strokeWidth={1} strokeDasharray="3 4" className="stroke-line" />}
        {refs.map(r => <line key={r.label} x1={L} x2={W - R} y1={Y(r.y)} y2={Y(r.y)} strokeWidth={1} strokeDasharray="4 4" className="stroke-ink-3" />)}
        {areaOf && areaOf.pts.length > 1 && (
          <path
            d={`${line(areaOf.pts)}L${X(areaOf.pts[areaOf.pts.length - 1].i)} ${Y(area?.mode === 'zero' ? 0 : dom.min)}L${X(areaOf.pts[0].i)} ${Y(area?.mode === 'zero' ? 0 : dom.min)}Z`}
            fill={strokeVar(areaOf.s.tone)} fillOpacity={0.15}
          />
        )}
        {at !== null && <Crosshair x={X(at)} top={T} bottom={H - B} quiet={hover === null} />}
        {ordered.map(({ s, pts }) => {
          const up = isStrong(s) || s.id === promoted;
          const d = line(pts);
          const last = pts[pts.length - 1];
          if (!last) return null;
          return (
            <g key={s.id}>
              {up && <path d={d} fill="none" strokeWidth={7} strokeLinejoin="round" className={halo} />}
              <path d={d} fill="none" stroke={color(s)} strokeWidth={up ? 3 : s.emphasis === 'context' ? 1.5 : 1.75} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dash ? '5 4' : undefined} />
              {points === 'all'
                ? pts.map(p => <circle key={p.i} cx={X(p.i)} cy={Y(p.v)} r={up ? 5 : 4} fill={color(s)} strokeWidth={2} className={halo} />)
                : (up || pts.length === 1) && <circle cx={X(last.i)} cy={Y(last.v)} r={6} fill={color(s)} strokeWidth={3} className={halo} />}
            </g>
          );
        })}
        {[...new Set(markers.map(m => m.group))].map(g => {
          const of = markers.filter(m => m.group === g).sort((a, b) => a.x - b.x);
          return of.length > 1 && <path key={g} d={of.map((m, k) => `${k ? 'L' : 'M'}${X(m.x)} ${Y(m.y)}`).join('')} fill="none" strokeWidth={1.25} strokeDasharray="4 4" className="stroke-ink-3" />;
        })}
        {markers.map((m, i) => <Marker key={i} shape={m.shape} x={X(m.x)} y={Y(m.y)} ground={ground} />)}
        {points === 'all' && all.map(({ s, pts }) => <PointValues key={s.id} series={s} pts={pts} X={X} Y={Y} fmt={fmt} halo={halo} bottom={H - B} right={W} />)}
        {inlineSeries.map(({ s }) => inlineText(s.id, name(s), isStrong(s), isContext(s)))}
        {lastMarkers.filter(m => m.x !== lastX).map(m => inlineText(`m-${m.group}`, m.label.includes(fmt(m.y)) ? m.label : `${m.label} ${fmt(m.y)}`, false, true))}
        {phone ? refs.map(r => inlineText(`r-${r.label}`, r.label, false, true)) : lastX !== n - 1 && refs.map(r => <text key={r.label} x={W - R + 8} y={Y(r.y) + 5} className="fill-ink-3 type-small">{r.label}</text>)}
        {at !== null && all.map(({ s }) => {
          const v = s.values[at];
          if (v === null || v === undefined || (isContext(s) && all.length > 6)) return null;
          return <circle key={s.id} cx={X(at)} cy={Y(v)} r={5} fill={color(s)} strokeWidth={2} pointerEvents="none" className={halo} />;
        })}
      </svg>
      {/* Labels sit in their own layer: some are buttons, which a role="img" may not contain. */}
      <svg width={W} height={H} className="pointer-events-none absolute inset-0 overflow-visible">
        <EndLabels
          labels={column} x={labelX} inset={labelInset} right={W} top={T} bottom={H - B - 4} gap={gap} ground={ground} promoted={promoted}
          onPromote={canPromote ? setPromoted : undefined}
        />
      </svg>
      <p aria-live="polite" className="sr-only">{said}</p>
      {hover !== null && rowsAt(hover).length > 0 && <ChartTooltip x={X(hover)} width={W} title={titleAt(hover)} rows={rowsAt(hover)} within={H - B} avoid={strongLabel && labelBox(strongLabel)} />}
    </div>
  );
}

interface PointValuesProps { series: LineSeries; pts: Point[]; X: (i: number) => number; Y: (v: number) => number; fmt: (v: number) => string; halo: string; bottom: number; right: number }

/** Every value beside its point. The newest, highest and lowest are placed first; one that would touch a neighbor is left to the tooltip. */
function PointValues({ series, pts, X, Y, fmt, halo, bottom, right }: PointValuesProps) {
  const placed: Box[] = [];
  const latest = pts.length - 1;
  const best = pts.reduce((a, p) => (p.v > a.v ? p : a), pts[0]);
  const worst = pts.reduce((a, p) => (p.v < a.v ? p : a), pts[0]);
  const turn = (p: Point) => (p === pts[latest] ? 0 : p === best ? 1 : p === worst ? 2 : 3 + latest - pts.indexOf(p));
  const shown = [...pts].sort((a, b) => turn(a) - turn(b)).flatMap(p => {
    const text = fmt(p.v);
    const note = series.notes?.[p.i] ?? null;
    const w = Math.max(textWidth(text, 12, true), note ? textWidth(note, 12) : 0) + 4;
    const k = pts.indexOf(p);
    const valley = (pts[k - 1]?.v ?? p.v) > p.v && (pts[k + 1]?.v ?? p.v) >= p.v;
    const cx = clamp(X(p.i), w / 2, right - w / 2);
    const below = valley && Y(p.v) + (note ? 38 : 24) < bottom;
    const y = below ? Y(p.v) + 20 : Y(p.v) - 11;
    const noteY = below ? Y(p.v) + 34 : Y(p.v) + 20;
    const boxes: Box[] = [{ x: cx - w / 2, y: y - 12, w, h: 14 }, ...(note ? [{ x: cx - w / 2, y: noteY - 12, w, h: 14 }] : [])];
    if (boxes.some(q => placed.some(b => b.x < q.x + q.w && q.x < b.x + b.w && b.y < q.y + q.h && q.y < b.y + b.h))) return [];
    placed.push(...boxes);
    return [{ p, text, note, cx, y, noteY }];
  });
  return (
    <g aria-hidden>
      {shown.map(({ p, text, note, cx, y, noteY }) => (
        <g key={p.i}>
          <text x={cx} y={y} textAnchor="middle" paintOrder="stroke" strokeWidth={4} strokeLinejoin="round" className={cn('fill-ink type-micro font-semibold tnum', halo)}>{text}</text>
          {note && <text x={cx} y={noteY} textAnchor="middle" paintOrder="stroke" strokeWidth={4} strokeLinejoin="round" className={cn('fill-ink-3 type-micro', halo)}>{note}</text>}
        </g>
      ))}
    </g>
  );
}
