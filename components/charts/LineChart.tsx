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
import { EndLabels, SWATCH, type EndLabel } from './EndLabels';
import { groundStroke, type Ground } from './ground';
import { cutPath, dodge, placeInline, placeOnLine, placePoints, solveLabels, type Box, type InlineLabel, type PointLabel, type Segment } from './labelSolver';
import { Marker, type MarkerShape } from './Marker';
import { useOutsidePress } from './useOutsidePress';
import { autoEvery, clamp, domain, fitText, linear, textWidth, tickLabels, xTicks } from './scales';

export interface LineSeries {
  id: string;
  label: string;
  /** Federation code or short name, under 560px. */
  short?: string;
  /** One per x label; null where there is no value. A line joins its points across nulls, but not over a hole much longer than its usual step. */
  values: (number | null)[];
  tone: Tone;
  emphasis?: 'strong' | 'normal' | 'context';
  dash?: boolean;
  /** `end` (default): right of the line. A number: above that point. `none`: in the tooltip and table only. */
  labelAt?: 'end' | 'start' | 'none' | number;
  /** With `points="all"`: a second line under each printed value ("3rd"), where the points stand far enough apart; always in the tooltip. */
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
  /** Beside a taller column: from 1024 the plot grows to the height of its grid cell. `height` is the least. */
  fill?: boolean;
  className?: string;
}

const T = 12;
const B = 32;
const REACH = 14;
/** Most a phone gives up to end labels (and as much again as a swatch takes): an eight-letter name. Longer ones use `short`, and the value goes under the name. */
const PHONE_GUTTER = 104;
/** From a name to the value under it. */
const SECOND_LINE = 17;
/** Inside a ChartGroup the plots share their edges. */
const GROUP_EDGE = { desktop: { L: 44, R: 156 }, phone: { L: 36, R: 96 } };
/** Points closer together than this print no second line. */
const NOTE_PITCH = 40;
/** Room a marker on the first x needs beside the axis numbers, and markers pushed aside on the last one beside their labels. */
const MARK_EDGE = 20;
const MARK_PUSH = 8;

export function LineChart(props: LineChartProps) {
  const { series, x, height = { desktop: 420, phone: 300 }, caption, tools, ariaLabel, table, fill, className } = props;
  return (
    <ChartFrame caption={caption} tools={tools} ariaLabel={ariaLabel} height={height} table={table} fill={fill} className={className}>
      {size => (series.length > 0 && x.labels.length > 0 ? <Plot {...props} size={size} /> : null)}
    </ChartFrame>
  );
}

interface Point { i: number; v: number }
/** The points a line joins: it breaks over a hole of more than six steps and three of its usual ones (scores still loading). */
function runsOf(pts: Point[]): Point[][] {
  const steps = pts.slice(1).map((p, k) => p.i - pts[k].i);
  const usual = [...steps].sort((a, b) => a - b)[Math.floor(steps.length / 2)] ?? 1;
  return pts.reduce<Point[][]>((runs, p, k) => (k === 0 || steps[k - 1] > Math.max(6, 3 * usual) ? [...runs, [p]] : [...runs.slice(0, -1), [...runs[runs.length - 1], p]]), []);
}
const pointsOf = (s: LineSeries): Point[] => s.values.flatMap((v, i) => (v === null || v === undefined ? [] : [{ i, v }]));
const rank = (s: LineSeries, promoted: string | null) => (s.id === promoted ? 3 : s.emphasis === 'strong' ? 2 : s.emphasis === 'context' ? 0 : 1);

function Plot({
  series, x, y, markers: allMarkers = [], refs = [], now, area, points = 'none', values = true, selected, onSelect, onSeries, seriesAction, extraRows, ariaLabel, ground = 'auto', size,
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
  const own = all.flatMap(a => a.pts.map(p => p.v));
  const round = domain(y, [...own, ...allMarkers.map(m => m.y), ...refs.map(r => r.y)]);
  // Values printed under the lowest point need ground there.
  const under = (Math.min(...own) - round.min) / (round.max - round.min) * (H - B - T);
  const dom = points === 'all' && y.min === undefined && round.ticks.length > 1 && under < 40 ? { ...round, min: round.min - (round.ticks[1] - round.ticks[0]) / 2 } : round;
  const ticks = tickLabels(dom.ticks, fmt);
  const name = (s: LineSeries) => (phone ? s.short ?? s.label : s.label);
  // With every point printed, the last one already says it.
  const printed = (s: LineSeries, i: number, v: number) => s.texts?.[i] ?? fmt(v);
  const valueText = (s: LineSeries, v: number) => s.endValue ?? s.texts?.[s.values.lastIndexOf(v)] ?? (values && points === 'none' && !s.label.includes(fmt(v)) ? fmt(v) : undefined);
  const isStrong = (s: LineSeries) => s.emphasis === 'strong';
  // Lines that matter equally: each has an end dot, and its label a stroke of its color.
  const equal = series.filter(s => s.emphasis !== 'context').length > 1 && !series.some(isStrong);
  const gutter = PHONE_GUTTER + (equal ? SWATCH : 0);
  const keyWidth = (s: LineSeries) => (equal && s.emphasis !== 'context' ? SWATCH : 0);
  const nameWidth = (s: LineSeries) => textWidth(name(s), isStrong(s) ? 15 : 14, isStrong(s));
  const valueWidth = (s: LineSeries, v?: string) => (v === undefined ? 0 : textWidth(v, 14, isStrong(s)));
  const fullWidth = (s: LineSeries, v?: string) => keyWidth(s) + nameWidth(s) + (v === undefined ? 0 : 6 + valueWidth(s, v));
  /** The name, with the value under it. */
  const stackWidth = (s: LineSeries, v?: string) => keyWidth(s) + Math.max(nameWidth(s), s.emphasis === 'context' ? 0 : valueWidth(s, v));
  const isContext = (s: LineSeries) => s.emphasis === 'context' && s.id !== promoted;
  const color = (s: LineSeries) => (isContext(s) ? token('context') : strokeVar(s.tone));


  // Under 560px only the latest marker of each group is drawn; the tooltip and the table have them all.
  const markers = phone ? allMarkers.filter(m => !allMarkers.some(k => k.group === m.group && k.x > m.x)) : allMarkers;
  // Margins. Lines that stop before the last x (a match in progress) are labeled inside the plot.
  const labeled = all.filter(a => a.pts.length > 0 && a.s.labelAt !== 'none');
  const ended = labeled.filter(a => (a.s.labelAt ?? 'end') === 'end');
  const lastX = ended.length ? Math.max(...ended.map(a => a.pts[a.pts.length - 1].i)) : n - 1;
  // White and Black alternate, so one line may stop a half-move before the other.
  const near = Math.max(1, Math.floor(n / 40));
  const inColumn = ended.filter(a => lastX - a.pts[a.pts.length - 1].i < (n > 20 ? near + 1 : 1));
  const lastMarkers = [...new Map(markers.map(m => [m.group, m])).values()].map(m => ({ ...m, ...markers.filter(k => k.group === m.group).reduce((a, b) => (b.x > a.x ? b : a)) }));
  const columnMarkers = lastMarkers.filter(m => m.x === lastX);
  const labelInset = (phone ? 12 : 14) + (columnMarkers.length > 1 ? MARK_PUSH : 0);
  const wide = Math.max(
    0,
    ...inColumn.map(a => { const w = fullWidth(a.s, valueText(a.s, a.pts[a.pts.length - 1].v)); return phone && w + labelInset + 4 > gutter ? stackWidth(a.s, valueText(a.s, a.pts[a.pts.length - 1].v)) : w; }),
    ...columnMarkers.map(m => textWidth(`${m.label} ${fmt(m.y)}`, 14)),
    ...(lastX === n - 1 && !phone ? refs.map(r => textWidth(r.label, 14)) : []),
  );
  // On phones a reference is named on its line, inside the plot.
  const refWide = lastX === n - 1 || phone ? 0 : Math.max(0, ...refs.map(r => textWidth(r.label, 14)));
  const L = group ? GROUP_EDGE[phone ? 'phone' : 'desktop'].L : Math.ceil(Math.max(...ticks.map(t => textWidth(t, 12)), 8)) + 11;
  const share = n > 1 ? lastX / (n - 1) : 1;
  const need = share > 0 ? (L + (W - L) * share + labelInset + 4 + wide - W) / share : 0;
  const most = phone ? gutter : W * 0.34;
  const R = group ? GROUP_EDGE[phone ? 'phone' : 'desktop'].R : Math.ceil(clamp(Math.max(need, refWide ? refWide + 18 : 0), wide || refWide ? 24 : 12, most));
  const plotW = W - L - R;
  // Printed values need room at both ends.
  const inset = points === 'all' ? 16 : 0;
  const insetL = Math.max(inset, markers.some(m => m.x === 0) ? MARK_EDGE : 0);
  const X = n > 1 ? linear(0, n - 1, L + insetL, W - R - inset) : () => L + plotW / 2;
  const Y = linear(dom.min, dom.max, H - B, T);
  const every = (phone ? x.every?.phone : x.every?.desktop) ?? Math.max(autoEvery(x.labels, plotW), phone && n > 8 ? 2 : 1);
  const line = (pts: Point[]) => pts.map((p, k) => `${k ? 'L' : 'M'}${X(p.i).toFixed(1)} ${Y(p.v).toFixed(1)}`).join('');
  const markR = phone ? 5 : 6;
  const pushed = dodge(markers.map(m => ({ x: X(m.x), y: Y(m.y) })), 2 * markR + 1);
  const markX = (m: LineMarker) => X(m.x) + (pushed[markers.indexOf(m)] ?? 0);

  // What can be pointed at: every x that has a value or a marker.
  const live = [...new Set([...all.flatMap(a => a.pts.map(p => p.i)), ...allMarkers.map(m => m.x)])].sort((a, b) => a - b);
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

  const plain = (m: LineMarker) => m.label.replace(fmt(m.y), '').trim();
  const rowsAt = (i: number, word = name): TooltipRow[] => {
    const lines = all
      .flatMap(({ s }) => { const v = s.values[i]; return v === null || v === undefined ? [] : [{ s, v }]; })
      .sort((a, b) => b.v - a.v);
    // The field that is out of it is not listed; a context line has no color to key, its point shows on the chart.
    const listed = lines.filter(({ s, v }) => !isContext(s) || fmt(v) !== fmt(0));
    const rows = (listed.length ? listed : lines).map(({ s, v }): TooltipRow => {
      const note = s.notes?.[i];
      return { key: s.id, label: word(s), value: note ? `${printed(s, i, v)}, ${note}` : printed(s, i, v), tone: isContext(s) ? undefined : s.tone, strong: isStrong(s) || s.id === promoted };
    });
    rows.push(...allMarkers.filter(m => m.x === i).sort((a, b) => b.y - a.y).map((m): TooltipRow => ({ key: `m-${m.group}`, label: plain(m), value: fmt(m.y), marker: m.shape })));
    return [...rows, ...(extraRows?.(i) ?? []).map((r, k): TooltipRow => ({ key: `x-${r.label}`, ...r, rule: k === 0 && rows.length > 0 }))];
  };
  const titleAt = (i: number) => x.titles?.[i] ?? x.labels[i];

  const clear = () => { setHover(null); setPromoted(null); setTouched(false); };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const { px, py } = local(e);
    setHover(nearestX(px));
    setPromoted(nearestSeries(px, py));
    setTouched(e.pointerType !== 'mouse');
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { if (hover !== null || promoted !== null) e.preventDefault(); clear(); setSaid(''); return; }
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
  // All the context names carry their values, or none does.
  const fits = inColumn.every(({ s, pts }) => s.emphasis !== 'context' || fullWidth(s, valueText(s, pts[pts.length - 1].v)) <= labelRoom + 2);
  const column: EndLabel[] = [
    ...inColumn.map(({ s, pts }): EndLabel => {
      const v = pts[pts.length - 1].v;
      const strong = isStrong(s);
      const size = strong ? 15 : 14;
      // A long name keeps its letters and gives up its number, which the tooltip and the table still have.
      const own = valueText(s, v);
      const under = stack && s.emphasis !== 'context' && own !== undefined;
      const value = under || (s.emphasis === 'context' ? fits : fullWidth(s, own) <= labelRoom + 2) ? own : undefined;
      const text = fitText(name(s), labelRoom - keyWidth(s), size, strong);
      return {
        id: s.id, text, value, extra: under ? SECOND_LINE : undefined, y: Y(v), strong, plain: s.emphasis !== 'context', color: color(s),
        swatch: keyWidth(s) > 0, dot: s.emphasis !== 'context',
        ariaLabel: `${s.label} ${fmt(v)}${seriesAction ? `, ${seriesAction}` : ''}`,
        onSelect: onSeries && (() => onSeries(s.id)),
      };
    }),
    ...columnMarkers.map((m): EndLabel => ({ id: `m-${m.group}`, text: m.label, value: m.label.includes(fmt(m.y)) ? undefined : fmt(m.y), y: Y(m.y), strong: false, dot: true, color: token('ink-3') })),
    ...(lastX === n - 1 && !phone ? refs.map((r): EndLabel => ({ id: `r-${r.label}`, text: r.label, y: Y(r.y), strong: false, color: token('ink-3') })) : []),
  ];
  const solved = solveLabels(column, T, H - B - 4, gap);
  const inlineSeries = labeled.filter(a => !inColumn.includes(a));
  const anchor = (a: { s: LineSeries; pts: Point[] }): Point => {
    const want = a.s.labelAt === 'start' ? a.pts[0].i : typeof a.s.labelAt === 'number' ? a.s.labelAt : a.pts[a.pts.length - 1].i;
    return a.pts.find(p => p.i === want) ?? a.pts.reduce((b, p) => (Math.abs(p.i - want) < Math.abs(b.i - want) ? p : b));
  };
  const lines = all.map(({ s, pts }) => ({ s, runs: runsOf(pts), parts: runsOf(pts).flatMap(run => run.slice(1).map((p, k): Segment => ({ x1: X(run[k].i), y1: Y(run[k].v), x2: X(p.i), y2: Y(p.v) }))) }));
  const segments = lines.flatMap(l => l.parts);
  const strongSegments = lines.filter(l => isStrong(l.s)).flatMap(l => l.parts);
  const plot: Box = { x: L, y: 0, w: W - L - 2, h: H - B };
  const labelBox = (l: EndLabel): Box => ({ x: labelX + labelInset - 6, y: (solved.get(l.id) ?? l.y) - gap / 2, w: (l.swatch ? SWATCH : 0) + Math.max(textWidth(l.extra ? l.text : `${l.text}  ${l.value ?? ''}`, 15, l.strong), l.extra ? textWidth(l.value ?? '', 14, l.strong) : 0) + 12, h: gap + (l.extra ?? 0) });
  const taken: Box[] = [
    ...markers.map(m => ({ x: markX(m) - 8, y: Y(m.y) - 8, w: 16, h: 16 })),
    ...column.map(labelBox),
  ];
  // On phones a reference is named on its line, in the clear; the values then keep off its name.
  const around = points === 'all' ? all.flatMap(({ pts }) => pts.map(p => ({ x: X(p.i) - 16, y: Y(p.v) - 26, w: 32, h: 52 }))) : [];
  const refNames = (phone ? refs : []).map(r => ({ r, ...placeOnLine(textWidth(r.label, 14) + 2, Y(r.y), segments, [...taken, ...around], { x: L, y: 0, w: plotW, h: H - B }) }));
  taken.push(...refNames.map(r => r.box));
  const refSegments = refs.map((r): Segment => ({ x1: L, y1: Y(r.y), x2: W - R, y2: Y(r.y) }));
  const pitch = n > 1 ? Math.abs(X(1) - X(0)) : W;
  const valueLabels = points === 'all' ? all.map(({ s, pts }) => ({ s, ...placePoints(pointLabels(s, pts, pitch >= NOTE_PITCH, X, Y, fmt, W), [...segments, ...refSegments], taken, { x: L, y: 2, w: W - L, h: H - B - 4 }) })) : [];
  taken.push(...valueLabels.flatMap(v => v.boxes));
  const inline: InlineLabel[] = [
    ...inlineSeries.map((a): InlineLabel => {
      const p = anchor(a);
      const onLine = typeof a.s.labelAt === 'number' || a.s.labelAt === 'start';
      const parts = lines.find(l => l.s === a.s)?.parts ?? [];
      const near = [...a.pts.filter(q => q !== p).map(q => ({ x: X(q.i), y: Y(q.v) })), ...parts.map(q => ({ x: (q.x1 + q.x2) / 2, y: (q.y1 + q.y2) / 2 }))]
        .sort((q, r) => Math.abs(q.x - X(p.i)) - Math.abs(r.x - X(p.i))).slice(0, 12);
      return {
        id: a.s.id, x: X(p.i), y: Y(p.v), width: nameWidth(a.s) + 2, prefer: onLine ? 'above' : 'right',
        alts: onLine ? near : undefined,
        // A context line that has no clear spot of its own goes unnamed rather than naming another.
        own: a.s.emphasis === 'context' ? parts : undefined,
        right: a.s.emphasis === 'context' ? W - R : undefined,
      };
    }),
    ...lastMarkers.filter(m => m.x !== lastX).map((m): InlineLabel => ({ id: `m-${m.group}`, x: markX(m), y: Y(m.y), width: textWidth(`${plain(m)} ${fmt(m.y)}`, 14) + 2, prefer: 'right' })),
  ];
  const spots = placeInline(inline, segments, taken, plot, strongSegments);

  const strongLabel = column.find(l => l.strong);
  const ordered = [...all].sort((a, b) => rank(a.s, promoted) - rank(b.s, promoted));
  const areaOf = area ? all.find(a => a.s.id === area.series) : undefined;
  const at = hover ?? (selected !== undefined && selected < n ? selected : null);
  const halo = groundStroke[ground];
  // A strong or promoted line passes over the others: each is broken for a moment where it is crossed.
  const overOf = (s: LineSeries) => lines.filter(l => rank(l.s, promoted) >= 2 && rank(l.s, promoted) > rank(s, promoted)).flatMap(l => l.parts);
  const tip = hover !== null ? rowsAt(hover) : [];
  const dotted = new Set(tip.slice(0, 6).map(r => r.key));
  const labelsRight = Math.max(0, ...column.map(l => { const b = labelBox(l); return b.x + b.w; }));
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
        <XAxis labels={x.labels} ticks={xTicks(x.labels, every, X)} x={X} y={H - 8} active={at} max={W} ground={ground} />
        {now !== undefined && now < n - 1 && <line x1={X(now)} x2={X(now)} y1={T} y2={H - B} strokeWidth={1} strokeDasharray="3 4" className="stroke-line" />}
        {refs.map(r => <line key={r.label} x1={L} x2={W - R} y1={Y(r.y)} y2={Y(r.y)} strokeWidth={1} strokeDasharray="4 4" className="stroke-ink-3" />)}
        {areaOf && areaOf.pts.length > 1 && (
          <path
            d={runsOf(areaOf.pts).map(run => `${line(run)}L${X(run[run.length - 1].i)} ${Y(area?.mode === 'zero' ? 0 : dom.min)}L${X(run[0].i)} ${Y(area?.mode === 'zero' ? 0 : dom.min)}Z`).join('')}
            fill={strokeVar(areaOf.s.tone)} fillOpacity={0.15}
          />
        )}
        {/* A selected first or last position has no rule: it would read as a y axis. Its tick and its points say where it is. */}
        {at !== null && (hover !== null || (at > 0 && at < n - 1)) && <Crosshair x={X(at)} top={T} bottom={H - B} quiet={hover === null} />}
        {ordered.map(({ s, pts }) => {
          const up = isStrong(s) || s.id === promoted;
          const last = pts[pts.length - 1];
          if (!last) return null;
          return (
            <g key={s.id}>
              <path d={(lines.find(l => l.s === s)?.runs ?? []).map(run => cutPath(run.map(p => ({ x: X(p.i), y: Y(p.v) })), overOf(s))).join('')} fill="none" stroke={color(s)} strokeWidth={up ? 3 : s.emphasis === 'context' ? 1.5 : 1.75} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dash ? '5 4' : undefined} />
              {points === 'all'
                ? pts.map(p => <circle key={p.i} cx={X(p.i)} cy={Y(p.v)} r={up ? 5 : 4} fill={color(s)} strokeWidth={2} className={halo} />)
                : (up || s.emphasis !== 'context' || pts.length === 1) && <circle cx={X(last.i)} cy={Y(last.v)} r={up ? 6 : 5} fill={color(s)} strokeWidth={up ? 3 : 2} className={halo} />}
            </g>
          );
        })}
        {[...new Set(markers.map(m => m.group))].map(g => {
          const of = markers.filter(m => m.group === g).sort((a, b) => a.x - b.x);
          return of.length > 1 && <path key={g} d={of.map((m, k) => `${k ? 'L' : 'M'}${markX(m)} ${Y(m.y)}`).join('')} fill="none" strokeWidth={1.25} strokeDasharray="4 4" className="stroke-ink-3" />;
        })}
        {markers.map((m, i) => <Marker key={i} shape={m.shape} x={markX(m)} y={Y(m.y)} r={markR} ground={ground} />)}
        {valueLabels.map(({ s, placed }) => (
          <g key={s.id} aria-hidden>
            {placed.map(p => (
              <text key={p.id} x={p.x} y={p.y} textAnchor="middle" paintOrder="stroke" strokeWidth={4} strokeLinejoin="round" className={cn('fill-ink type-micro font-semibold tnum', halo)}>
                {fmt(s.values[p.id] ?? 0)}
                {p.note && <tspan x={p.x} dy={14} className="fill-ink-3 font-normal">{s.notes?.[p.id]}</tspan>}
              </text>
            ))}
          </g>
        ))}
        {inlineSeries.map(({ s }) => inlineText(s.id, name(s), isStrong(s), isContext(s)))}
        {lastMarkers.filter(m => m.x !== lastX).map(m => inlineText(`m-${m.group}`, `${plain(m)} ${fmt(m.y)}`, false, true))}
        {phone ? refNames.map(({ r, x: rx, y: ry }) => <text key={r.label} x={rx} y={ry} paintOrder="stroke" strokeWidth={5} strokeLinejoin="round" className={cn('fill-ink-3 type-small tnum', halo)}>{r.label}</text>) : lastX !== n - 1 && refs.map(r => <text key={r.label} x={W - R + 8} y={Y(r.y) + 5} className="fill-ink-3 type-small">{r.label}</text>)}
        {at !== null && all.map(({ s }) => {
          const v = s.values[at];
          if (v === null || v === undefined || (isContext(s) && !dotted.has(s.id))) return null;
          return <circle key={s.id} cx={X(at)} cy={Y(v)} r={isContext(s) ? 3.5 : 5} fill={color(s)} strokeWidth={2} pointerEvents="none" className={halo} />;
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
      {hover !== null && tip.length > 0 && (
        <ChartTooltip
          x={X(hover)} width={W} title={titleAt(hover)} rows={tip} within={H - B} avoid={strongLabel && labelBox(strongLabel)}
          past={lastX < n - 1 && column.length > 0 ? { from: labelX + labelInset - 6, to: labelsRight + 4 } : undefined}
        />
      )}
    </div>
  );
}

/** What to print beside the points, most wanted first: the newest, the highest, the lowest, then back from the newest. */
function pointLabels(series: LineSeries, pts: Point[], notes: boolean, X: (i: number) => number, Y: (v: number) => number, fmt: (v: number) => string, right: number): PointLabel[] {
  const latest = pts.length - 1;
  const best = pts.reduce((a, p) => (p.v > a.v ? p : a), pts[0]);
  const worst = pts.reduce((a, p) => (p.v < a.v ? p : a), pts[0]);
  const turn = (p: Point) => (p === pts[latest] ? 0 : p === best ? 1 : p === worst ? 2 : 3 + latest - pts.indexOf(p));
  return [...pts].sort((a, b) => turn(a) - turn(b)).map((p): PointLabel => {
    const note = notes ? series.notes?.[p.i] : null;
    const k = pts.indexOf(p);
    const width = Math.max(textWidth(fmt(p.v), 12, true), note ? textWidth(note, 12) : 0) + 2;
    return {
      id: p.i, x: clamp(X(p.i), width / 2, right - width / 2), y: Y(p.v), width, note: Boolean(note),
      valley: (pts[k - 1]?.v ?? p.v) > p.v && (pts[k + 1]?.v ?? p.v) >= p.v,
    };
  });
}
