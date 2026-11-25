export interface SolverLabel { id: string; /** Where the mark is; the first line of the label wants to be there. */ y: number; /** A strong label moves less. */ strong?: boolean; /** Room below the first line for a second one. */ extra?: number }

/**
 * Push labels apart to `gap` inside [min, max], each as little as possible: labels that touch form a block, the block
 * settles on the (weighted) middle of its marks, and blocks that then touch join. Returns id to y.
 */
export function solveLabels(labels: SolverLabel[], min: number, max: number, gap: number): Map<string, number> {
  /** `at` of an id is its distance from the top of the block; `sum` adds weight times (mark minus that distance). */
  interface Block { ids: [id: string, at: number][]; height: number; weight: number; sum: number }
  const at = (b: Block) => Math.max(min, Math.min(max - (b.height - gap), b.sum / b.weight));
  const blocks: Block[] = [];
  for (const l of [...labels].sort((p, q) => p.y - q.y)) {
    const weight = l.strong ? 4 : 1;
    let next: Block = { ids: [[l.id, 0]], height: gap + (l.extra ?? 0), weight, sum: weight * Math.min(max, Math.max(min, l.y)) };
    let prev = blocks[blocks.length - 1];
    while (prev && at(prev) + prev.height > at(next)) {
      const shift = prev.height;
      next = {
        ids: [...prev.ids, ...next.ids.map(([id, d]): [string, number] => [id, d + shift])],
        height: prev.height + next.height, weight: prev.weight + next.weight, sum: prev.sum + next.sum - next.weight * shift,
      };
      blocks.pop();
      prev = blocks[blocks.length - 1];
    }
    blocks.push(next);
  }
  return new Map(blocks.flatMap(b => b.ids.map(([id, d]): [string, number] => [id, at(b) + d])));
}

export interface Box { x: number; y: number; w: number; h: number }
export interface Segment { x1: number; y1: number; x2: number; y2: number }
export interface InlineLabel {
  id: string;
  /** Point the label belongs to. */
  x: number;
  y: number;
  width: number;
  /** Where to try first. */
  prefer: 'above' | 'right';
  /** Other points of the same line, nearest first, tried when the first is crowded. */
  alts?: { x: number; y: number }[];
  /** The line it names. With this the label is left out unless it can stand beside that line and nearer to it than to any other. */
  own?: Segment[];
}
export interface Placed { x: number; y: number; anchor: 'start' | 'middle' | 'end' }

const HEIGHT = 16;
const overlap = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Does a segment pass through a box? (Liang-Barsky clip.) */
function crosses(s: Segment, b: Box): boolean {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of [[-dx, s.x1 - b.x], [dx, b.x + b.w - s.x1], [-dy, s.y1 - b.y], [dy, b.y + b.h - s.y1]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return false; t0 = Math.max(t0, r); } else { if (r < t0) return false; t1 = Math.min(t1, r); }
  }
  return true;
}

/** Distance between a box and a segment; 0 when they meet. */
function distance(s: Segment, b: Box): number {
  if (crosses(s, b)) return 0;
  const toBox = (x: number, y: number) => Math.hypot(Math.max(b.x - x, 0, x - b.x - b.w), Math.max(b.y - y, 0, y - b.y - b.h));
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const len = dx * dx + dy * dy || 1;
  const toLine = (x: number, y: number) => {
    const t = Math.max(0, Math.min(1, ((x - s.x1) * dx + (y - s.y1) * dy) / len));
    return Math.hypot(s.x1 + t * dx - x, s.y1 + t * dy - y);
  };
  return Math.min(toBox(s.x1, s.y1), toBox(s.x2, s.y2), toLine(b.x, b.y), toLine(b.x + b.w, b.y), toLine(b.x, b.y + b.h), toLine(b.x + b.w, b.y + b.h));
}

/** An optional label further than this from its own line would seem to name another. */
const NEAR = 12;

/**
 * Labels inside the plot: each takes the nearest spot that touches no line, marker or other label. A required label with
 * no such spot takes the least bad one; an optional one (`own`) is left to the tooltip and the table. Returns baselines.
 */
export function placeInline(labels: InlineLabel[], lines: Segment[], taken: Box[], bounds: Box): Map<string, Placed> {
  const boxes = [...taken];
  const out = new Map<string, Placed>();
  for (const l of labels) {
    const spots: { at: Placed; cost: number }[] = [];
    [{ x: l.x, y: l.y }, ...(l.alts ?? [])].forEach((p, k) => {
      const away = k * 9 + (l.prefer === 'right' ? 14 : 0);
      for (const d of [10, 18, 28, 40]) {
        for (const [dx, anchor] of [[0, 'middle'], [8, 'start'], [-8, 'end']] as const) {
          const side = anchor === 'middle' ? 0 : 3;
          spots.push({ at: { x: p.x + dx, y: p.y - d, anchor }, cost: d * 1.6 + side + away });
          spots.push({ at: { x: p.x + dx, y: p.y + d + 10, anchor }, cost: d * 1.6 + 4 + side + away });
        }
      }
      if (k > 0) return;
      for (const d of [12, 20]) {
        spots.push({ at: { x: p.x + d, y: p.y + 5, anchor: 'start' }, cost: l.prefer === 'right' ? d - 8 : d + 14 });
        spots.push({ at: { x: p.x - d, y: p.y + 5, anchor: 'end' }, cost: d + 20 });
      }
    });
    const box = (p: Placed): Box => ({ x: p.anchor === 'middle' ? p.x - l.width / 2 : p.anchor === 'end' ? p.x - l.width : p.x, y: p.y - HEIGHT + 3, w: l.width, h: HEIGHT });
    const outside = (b: Box) => b.x < bounds.x || b.x + b.w > bounds.x + bounds.w || b.y < bounds.y || b.y + b.h > bounds.y + bounds.h;
    const clear = (b: Box) => {
      if (outside(b) || boxes.some(x => overlap(x, b)) || lines.some(x => crosses(x, b))) return false;
      const own = l.own;
      if (!own) return true;
      const mine = Math.min(...own.map(x => distance(x, b)));
      return mine <= NEAR && !lines.some(x => !own.includes(x) && distance(x, b) < mine);
    };
    spots.sort((a, b) => a.cost - b.cost);
    const score = (s: { at: Placed; cost: number }) => {
      const b = box(s.at);
      return s.cost + (outside(b) ? 600 : 0) + lines.filter(x => crosses(x, b)).length * 60 + boxes.filter(x => overlap(x, b)).length * 120;
    };
    const best = spots.find(s => clear(box(s.at))) ?? (l.own ? undefined : spots.reduce((a, b) => (score(b) < score(a) ? b : a)));
    if (best) {
      out.set(l.id, best.at);
      boxes.push(box(best.at));
    }
  }
  return out;
}
