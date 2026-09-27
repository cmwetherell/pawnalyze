import { cacheLife, cacheTag } from 'next/cache';

import { MARKETS, TAGS } from './config';
import type { LiveMarkets, LiveQuote, PlayerId, PlayerKey } from './types';

const TIMEOUT_MS = 3000;

type Side = LiveQuote['players'][PlayerKey];

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

function mid(side: Side): number | null {
  if (side.bid !== null && side.ask !== null && side.ask > 0 && side.ask >= side.bid) return (side.bid + side.ask) / 2;
  return side.last;
}

function normalise(source: LiveQuote['source'], players: Record<PlayerKey, Side>, volume: number | null, url: string): LiveQuote | null {
  const m1 = players['1'].mid;
  const m2 = players['2'].mid;
  if (m1 === null || m2 === null || m1 + m2 <= 0) return null;
  return { source, pWin1: m1 / (m1 + m2), players, volume, url };
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
  return res.json();
}

async function fetchPolymarket(): Promise<LiveQuote | null> {
  const cfg = MARKETS.polymarket;
  const body = await getJson(cfg.api) as { volume?: number | string; markets?: Record<string, unknown>[] }[];
  const event = Array.isArray(body) ? body[0] : null;
  if (!event?.markets) return null;
  const side = (id: PlayerId): Side => {
    const m = event.markets!.find(x => x.slug === cfg.slugs[id] || x.groupItemTitle === cfg.titles[id]);
    if (!m) return { bid: null, ask: null, last: null, mid: null };
    let yes: number | null = null;
    try {
      const prices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
      yes = Array.isArray(prices) ? num(prices[0]) : null;
    } catch { /* ignore */ }
    const s: Side = { bid: num(m.bestBid), ask: num(m.bestAsk), last: num(m.lastTradePrice) ?? yes, mid: null };
    s.mid = mid(s);
    return s;
  };
  const volume = num(event.volume);
  return normalise('polymarket', { '1': side(1), '2': side(2) }, volume, cfg.url);
}

async function fetchKalshi(): Promise<LiveQuote | null> {
  const cfg = MARKETS.kalshi;
  const one = async (id: PlayerId): Promise<{ side: Side; volume: number | null }> => {
    const body = await getJson(`${cfg.api}${cfg.tickers[id]}`) as { market?: Record<string, unknown> };
    const m = body.market ?? {};
    const s: Side = { bid: num(m.yes_bid_dollars), ask: num(m.yes_ask_dollars), last: num(m.last_price_dollars), mid: null };
    s.mid = mid(s);
    return { side: s, volume: num(m.volume_fp) };
  };
  const [a, b] = await Promise.all([one(1), one(2)]);
  const volume = a.volume !== null || b.volume !== null ? (a.volume ?? 0) + (b.volume ?? 0) : null;
  return normalise('kalshi', { '1': a.side, '2': b.side }, volume, cfg.url);
}

async function settle<T>(label: string, p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    console.warn(`[wcc] ${label} market fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

/**
 * Live prediction-market prices (keyless public APIs), normalised to P(Gukesh wins).
 * Cached for minutes; returns null when both sources fail so the card can degrade gracefully.
 */
export async function getLiveMarkets(): Promise<LiveMarkets | null> {
  'use cache';
  // Short expiry (< 5 min) keeps this out of the prerendered shell: the page stays static and the
  // market card streams in at request time inside its <Suspense> boundary.
  cacheLife({ stale: 60, revalidate: 60, expire: 180 });
  cacheTag(TAGS.markets);
  const [kalshi, polymarket] = await Promise.all([
    settle('Kalshi', fetchKalshi()),
    settle('Polymarket', fetchPolymarket()),
  ]);
  if (!kalshi && !polymarket) return null;
  return { fetchedAt: new Date().toISOString(), kalshi, polymarket };
}
