'use client';

import { memo, useMemo } from 'react';

import { LineChart, type LineMarker } from '@/components/charts/LineChart';
import { Section } from '@/components/layout/Section';
import { formatPct } from '@/lib/format';
import type { Players } from '@/lib/wcc/display';
import type { HistoryPoint, MarketRow } from '@/lib/wcc/types';

const SLOTS = ['Pre', ...Array.from({ length: 14 }, (_, i) => `G${i + 1}`), 'TB'];
const TITLES = ['Before the match', ...Array.from({ length: 14 }, (_, i) => `After game ${i + 1}`), 'During the tiebreaks'];
const slotOf = (h: { afterGame: number; tbGames: number }) => (h.tbGames > 0 ? 15 : h.afterGame);
const SOURCES: Record<string, { label: string; shape: LineMarker['shape'] }> = {
  kalshi: { label: 'Kalshi', shape: 'circle' },
  polymarket: { label: 'Polymarket', shape: 'square' },
  bet365: { label: 'bet365', shape: 'triangle' },
};

/** raw.after_game written by the market snapshot cron, if any. */
function taggedSlot(raw: unknown): number | null {
  const v = raw && typeof raw === 'object' ? (raw as { after_game?: unknown }).after_game : undefined;
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 14 ? v : null;
}

function build(history: HistoryPoint[], markets: MarketRow[]) {
  const runs = [...history].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const bySlot = new Map<number, HistoryPoint>();
  for (const h of runs) bySlot.set(slotOf(h), h);
  // Each market snapshot belongs to the match state in force when it was taken: the game it was
  // tagged with by the snapshot cron, else the latest run before it. The latest snapshot per slot wins.
  const dots = new Map<string, { slot: number; source: string; p: number }>();
  for (const m of [...markets].sort((a, b) => a.asOf.localeCompare(b.asOf))) {
    if (!SOURCES[m.source]) continue;
    let slot = taggedSlot(m.raw);
    if (slot === null) {
      const before = runs.filter(r => r.createdAt <= m.asOf).pop() ?? runs[0];
      if (!before) continue;
      slot = slotOf(before);
    }
    dots.set(`${m.source}-${slot}`, { slot, source: m.source, p: m.pWin1 });
  }
  const points = [...bySlot.entries()].sort((a, b) => a[0] - b[0]);
  const list = [...dots.values()].sort((a, b) => a.slot - b.slot);
  const slots = [...new Set([...points.map(([slot]) => slot), ...list.map(d => d.slot)])].sort((a, b) => a - b);
  return { bySlot, points, dots: list, slots, sources: [...new Set(list.map(d => d.source))] };
}

/** P(Gukesh wins) after each game, with prediction-market prices as markers. Hidden until there are two points. */
export const WinProbHistory = memo(function WinProbHistory({ history, markets, players }: { history: HistoryPoint[]; markets: MarketRow[]; players: Players }) {
  const { bySlot, points, dots, slots, sources } = useMemo(() => build(history, markets), [history, markets]);
  if (points.length < 2) return null;
  const [p1, p2] = [players[1].shortName, players[2].shortName];
  const [, first] = points[0];
  const [lastSlot, last] = points[points.length - 1];
  const top = Math.max(...points.map(([, h]) => h.pWin1), ...dots.map(d => d.p));
  const of = (slot: number, source: string) => dots.find(d => d.slot === slot && d.source === source);
  const at = (v: number | undefined) => (v === undefined ? '–' : formatPct(v));
  return (
    <Section
      id="history"
      title="How the odds have moved"
      finding={
        <>
          {p1} had <strong className="font-medium text-ink">{formatPct(first.pWin1)}</strong> {TITLES[points[0][0]].toLowerCase()} and has <strong className="font-medium text-ink">{formatPct(last.pWin1)}</strong> {TITLES[lastSlot].toLowerCase()}.
          {sources.length > 0 && ' Markers show prediction-market prices at the time.'}
        </>
      }
    >
      <LineChart
        caption={`${p1}’s chance to win the match`}
        ariaLabel={`${p1} win probability from ${formatPct(first.pWin1)} ${TITLES[points[0][0]].toLowerCase()} to ${formatPct(last.pWin1)} now.`}
        series={[{ id: 'p1', label: p1, tone: 'p1', emphasis: 'strong', values: SLOTS.map((_, i) => bySlot.get(i)?.pWin1 ?? null) }]}
        x={{ labels: SLOTS, titles: TITLES, every: { desktop: 1, phone: 3 } }}
        y={{ min: 0, max: top < 0.45 ? 0.5 : 1, format: 'pct' }}
        height={{ desktop: 360, phone: 300 }}
        markers={dots.map(d => ({ x: d.slot, y: d.p, group: d.source, ...SOURCES[d.source] }))}
        now={lastSlot}
        extraRows={i => {
          const h = bySlot.get(i);
          return h ? [{ label: p2, value: formatPct(1 - h.pWin1), tone: 'p2' as const }, { label: 'Tiebreak', value: formatPct(h.pTb) }] : [];
        }}
        table={{
          columns: ['After', p1, 'Tiebreak', ...sources.map(s => SOURCES[s].label)],
          rows: slots.map(s => [SLOTS[s], at(bySlot.get(s)?.pWin1), at(bySlot.get(s)?.pTb), ...sources.map(src => at(of(s, src)?.p))]),
        }}
      />
    </Section>
  );
});
