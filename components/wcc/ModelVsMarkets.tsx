import { Suspense } from 'react';

import { SplitRows, type SplitRow } from '@/components/charts/SplitRows';
import { Section } from '@/components/layout/Section';
import { Heading } from '@/components/ui/Heading';
import { Prose } from '@/components/ui/Prose';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPct } from '@/lib/format';
import { MARKETS } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import { getLiveMarkets } from '@/lib/wcc/markets';
import type { LiveQuote, MarketRow } from '@/lib/wcc/types';
import PolymarketEmbed from './PolymarketEmbed';

interface Props {
  modelPWin1: number;
  players: Players;
  /** Stored market rows (bet365 reference, last-good snapshots). */
  stored: MarketRow[];
  ratingGap: number;
  drawRate: number | null;
}

const cents = (v: number | null) => (v === null ? '–' : `${Math.round(v * 100)}¢`);
const vol = (v: number | null, unit: 'usd' | 'contracts') => {
  if (v === null) return null;
  const k = v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : v >= 1000 ? `${(v / 1000).toFixed(v >= 100_000 ? 0 : 1)}k` : `${Math.round(v)}`;
  return unit === 'usd' ? `$${k}` : `${k} contracts`;
};

export function latestQuote(stored: MarketRow[], source: string): MarketRow | null {
  return stored.filter(m => m.source === source).sort((a, b) => b.asOf.localeCompare(a.asOf))[0] ?? null;
}

function BidAsk({ q, players }: { q: LiveQuote; players: Players }) {
  return (
    <>
      <span className="block">{players[1].shortName} {cents(q.players['1'].bid)} / {cents(q.players['1'].ask)}</span>
      <span className="block">{players[2].shortName} {cents(q.players['2'].bid)} / {cents(q.players['2'].ask)}</span>
    </>
  );
}

function betOdds(m: MarketRow): Record<'1' | '2', string> | null {
  const odds = (m.raw as { odds?: Record<string, unknown> } | null)?.odds;
  return odds && typeof odds['1'] === 'string' && typeof odds['2'] === 'string' ? { '1': odds['1'], '2': odds['2'] } : null;
}

/** The async part: live quotes, with the last stored snapshot behind them. */
async function MarketRows({ modelPWin1, players, stored }: Pick<Props, 'modelPWin1' | 'players' | 'stored'>) {
  const live = await getLiveMarkets();
  const [p1, p2] = [players[1].shortName, players[2].shortName];
  const market = (source: 'kalshi' | 'polymarket'): SplitRow => {
    const cfg = MARKETS[source];
    const q = live?.[source] ?? null;
    const base = { key: source, title: cfg.label, href: cfg.url };
    if (q && live) {
      return {
        ...base, left: q.pWin1, meta: 'Mid-price, live',
        cells: [<BidAsk key="b" q={q} players={players} />, vol(q.volume, source === 'kalshi' ? 'contracts' : 'usd'), <RelativeTime key="u" iso={live.fetchedAt} />],
      };
    }
    const s = latestQuote(stored, source);
    if (s) return { ...base, left: s.pWin1, meta: 'Live price unavailable; last snapshot', cells: [null, null, <RelativeTime key="u" iso={s.asOf} />] };
    return { ...base, left: null, meta: 'Prices are unavailable right now.' };
  };
  const bet = latestQuote(stored, 'bet365');
  const odds = bet && betOdds(bet);
  const rows: SplitRow[] = [
    { key: 'model', title: 'Pawnalyze model', left: modelPWin1, own: true, meta: 'Exact match odds from ratings, confirmed by simulation' },
    market('kalshi'),
    market('polymarket'),
    ...(bet ? [{
      key: 'bet365', title: MARKETS.bet365.label, left: bet.pWin1,
      meta: <>Bookmaker reference{odds ? `: ${p1} ${odds['1']}, ${p2} ${odds['2']}` : ''}, margin removed</>,
      cells: [null, null, new Date(bet.asOf).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })],
    }] : []),
  ];
  return <SplitRows label="Match odds by source" head="Source" names={[p1, p2]} tones={['p1', 'p2']} columns={['Bid / ask', 'Traded', 'Updated']} rows={rows} />;
}

function marketAverage(stored: MarketRow[]): number | null {
  const xs = (['kalshi', 'polymarket'] as const).map(s => latestQuote(stored, s)?.pWin1).filter((v): v is number => v !== undefined);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export default function ModelVsMarkets({ modelPWin1, players, stored, ratingGap, drawRate }: Props) {
  const mkt = marketAverage(stored);
  const ratio = mkt !== null && modelPWin1 > 0 ? mkt / modelPWin1 : null;
  const [p1, p2] = [players[1].shortName, players[2].shortName];
  const higher = ratingGap >= 0 ? p2 : p1;

  return (
    <Section
      id="markets"
      layout="wide"
      title="What the money says"
      finding="Our exact odds next to live prediction-market prices. Markets are shown as the mid-price, renormalised so both players sum to 100%."
    >
      <Suspense fallback={<Skeleton kind="bars" rows={4} label="Loading market prices" />}>
        <MarketRows modelPWin1={modelPWin1} players={players} stored={stored} />
      </Suspense>

      <Heading level={3} style="h3" className="mt-12">Why the gap?</Heading>
      <Prose columns={2} className="mt-3">
        <p>
          {ratio !== null && ratio > 1.15
            ? <>The markets give {p1} roughly {ratio >= 1.8 ? `${ratio.toFixed(1)} times` : `${Math.round((ratio - 1) * 100)}% more than`} our model’s chance. </>
            : ratio !== null && ratio < 0.87
              ? <>The markets are less optimistic about {p1} than our model. </>
              : ratio !== null ? <>The markets and our model broadly agree. </> : null}
          Our model only knows ratings: {higher} is <strong>{Math.abs(ratingGap)} points</strong> higher on the rating list the match uses
          {drawRate !== null && <>. Even after calibrating to how drawish title matches are (about {formatPct(drawRate, 0)} of classical games here), that gap makes {higher} the favourite in every game, and over 14 games small per-game edges add up</>}.
        </p>
        <p>
          Traders may be pricing what a ratings model cannot see: {p1}’s experience of winning a title match, months of targeted preparation,
          and the usual pull of betting markets toward underdogs (the favourite-longshot bias). Neither view is “right”.
        </p>
      </Prose>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Heading level={3} style="h3">Polymarket, live</Heading>
          <p className="mt-3 type-small text-ink-2">
            Third-party widgets, loaded only when this section is on screen. Prices are not advice; check local rules before trading.
          </p>
        </div>
        <div className="min-w-0 lg:col-span-8">
          <PolymarketEmbed
            markets={[
              { slug: MARKETS.polymarket.slugs[2], title: `Polymarket: will ${p2} win the 2026 World Chess Championship?` },
              { slug: MARKETS.polymarket.slugs[1], title: `Polymarket: will ${p1} win the 2026 World Chess Championship?` },
            ]}
          />
        </div>
      </div>
    </Section>
  );
}
