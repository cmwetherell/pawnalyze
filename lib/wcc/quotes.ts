import type { HistoryPoint, MarketRow } from './types';

/** The newest stored price of one source. */
export function latestQuote(stored: MarketRow[], source: string): MarketRow | null {
  return stored.filter(m => m.source === source).sort((a, b) => b.asOf.localeCompare(a.asOf))[0] ?? null;
}

/** A place on the "after game N" axis: 0 is before the match, 15 the tiebreaks. */
export const TB_SLOT = 15;
export const slotOf = (h: Pick<HistoryPoint, 'afterGame' | 'tbGames'>) => (h.tbGames > 0 ? TB_SLOT : h.afterGame);

/** raw.after_game written by the market snapshot cron, if any. */
function taggedSlot(raw: unknown): number | null {
  const v = raw && typeof raw === 'object' ? (raw as { after_game?: unknown }).after_game : undefined;
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 14 ? v : null;
}

/**
 * The state of the match a stored price belongs to: the game it was tagged with by the snapshot cron, else the latest run
 * before it. `runs` are oldest first.
 */
export function quoteSlot(quote: MarketRow, runs: HistoryPoint[]): number | null {
  const tagged = taggedSlot(quote.raw);
  if (tagged !== null) return tagged;
  const before = runs.filter(r => r.createdAt <= quote.asOf).pop() ?? runs[0];
  return before ? slotOf(before) : null;
}
