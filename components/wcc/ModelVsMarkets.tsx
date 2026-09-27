import { Suspense } from 'react';

import RelativeTime from '@/components/ui/RelativeTime';
import { MARKETS } from '@/lib/wcc/config';
import { getLiveMarkets } from '@/lib/wcc/markets';
import type { LiveQuote, MarketRow } from '@/lib/wcc/types';
import PolymarketEmbed from './PolymarketEmbed';
import { Section, formatPct, type Players } from './ui';

interface Props {
  modelPWin1: number;
  players: Players;
  /** Stored market rows (bet365 reference, last-good snapshots). */
  stored: MarketRow[];
  ratingGap: number;
  drawRate: number | null;
}

const cents = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}¢`);
const vol = (v: number | null, unit: 'usd' | 'contracts') => {
  if (v === null) return null;
  const k = v >= 1000 ? `${(v / 1000).toFixed(v >= 100_000 ? 0 : 1)}k` : `${Math.round(v)}`;
  return unit === 'usd' ? `$${k} traded` : `${k} contracts traded`;
};

function latest(stored: MarketRow[], source: string): MarketRow | null {
  return stored.filter(m => m.source === source).sort((a, b) => b.asOf.localeCompare(a.asOf))[0] ?? null;
}

function Tile({
  name, p1, players, children, href, emphasis,
}: { name: string; p1: number; players: Players; children?: React.ReactNode; href?: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-xl p-4 flex flex-col gap-2 ${emphasis ? 'bg-chess-gold/[0.07] ring-1 ring-chess-gold/40' : 'bg-[var(--bg-surface-2)]'}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--text-secondary)]">{name}</p>
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[var(--text-muted)] hover:text-gold-ink underline decoration-dotted">
            source
          </a>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{players[1].shortName}</p>
          <p className="font-heading text-2xl text-[var(--text-primary)]">{formatPct(p1)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{players[2].shortName}</p>
          <p className="font-heading text-2xl text-[var(--text-primary)]">{formatPct(1 - p1)}</p>
        </div>
      </div>
      <div className="flex h-1.5 gap-[2px] rounded-full overflow-hidden" aria-hidden>
        <div style={{ width: `${p1 * 100}%`, background: 'var(--wcc-p1)' }} />
        <div className="flex-1" style={{ background: 'var(--wcc-p2)' }} />
      </div>
      {children && <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">{children}</div>}
    </div>
  );
}

function QuoteDetails({ q, players, unit }: { q: LiveQuote; players: Players; unit: 'usd' | 'contracts' }) {
  return (
    <>
      <p className="tabular-nums">
        {players[1].shortName} {cents(q.players['1'].bid)} / {cents(q.players['1'].ask)} · {players[2].shortName} {cents(q.players['2'].bid)} / {cents(q.players['2'].ask)}
        <span className="sr-only"> (bid / ask)</span>
      </p>
      <p>bid / ask · mid-prices renormalised{vol(q.volume, unit) ? ` · ${vol(q.volume, unit)}` : ''}</p>
    </>
  );
}

async function LiveTiles({ modelPWin1, players, stored }: Pick<Props, 'modelPWin1' | 'players' | 'stored'>) {
  const live = await getLiveMarkets();
  const snap = (source: 'kalshi' | 'polymarket') => latest(stored, source);
  const tile = (source: 'kalshi' | 'polymarket') => {
    const q = live?.[source] ?? null;
    const cfg = MARKETS[source];
    if (q) {
      return (
        <Tile key={source} name={cfg.label} p1={q.pWin1} players={players} href={cfg.url}>
          <QuoteDetails q={q} players={players} unit={source === 'kalshi' ? 'contracts' : 'usd'} />
          {live && <p>Live · <RelativeTime iso={live.fetchedAt} prefix="updated " /></p>}
        </Tile>
      );
    }
    const s = snap(source);
    if (s) {
      return (
        <Tile key={source} name={cfg.label} p1={s.pWin1} players={players} href={cfg.url}>
          <p>Live price unavailable · last snapshot <RelativeTime iso={s.asOf} /></p>
        </Tile>
      );
    }
    return (
      <div key={source} className="rounded-xl bg-[var(--bg-surface-2)] p-4 text-xs text-[var(--text-muted)]">
        {cfg.label} prices are unavailable right now. <a className="underline" href={cfg.url} target="_blank" rel="noopener noreferrer">View the market</a>.
      </div>
    );
  };
  return (
    <>
      <Tile name="Pawnalyze model" p1={modelPWin1} players={players} emphasis>
        <p>Exact match odds from ratings, confirmed by simulation.</p>
      </Tile>
      {tile('kalshi')}
      {tile('polymarket')}
    </>
  );
}

function TilesSkeleton() {
  return (
    <>
      {[0, 1, 2].map(i => <div key={i} className="h-[168px] rounded-xl bg-[var(--bg-surface-2)] animate-pulse" />)}
    </>
  );
}

function betOdds(m: MarketRow): Record<'1' | '2', string> | null {
  const odds = (m.raw as { odds?: Record<string, unknown> } | null)?.odds;
  return odds && typeof odds['1'] === 'string' && typeof odds['2'] === 'string' ? { '1': odds['1'], '2': odds['2'] } : null;
}

function marketAverage(stored: MarketRow[]): number | null {
  const xs = (['kalshi', 'polymarket'] as const).map(s => latest(stored, s)?.pWin1).filter((v): v is number => v !== undefined);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export default function ModelVsMarkets({ modelPWin1, players, stored, ratingGap, drawRate }: Props) {
  const bet = latest(stored, 'bet365');
  const mkt = marketAverage(stored);
  const ratio = mkt !== null && modelPWin1 > 0 ? mkt / modelPWin1 : null;
  const [p1, p2] = [players[1].shortName, players[2].shortName];
  const higher = ratingGap >= 0 ? p2 : p1;

  return (
    <Section
      id="markets"
      eyebrow="Model vs markets"
      title="What the money says"
      description={<>Our exact odds next to live prediction-market prices. Markets are shown as the mid-price, renormalised so both players sum to 100%.</>}
    >
      <div className="grid md:grid-cols-3 gap-3">
        <Suspense fallback={<TilesSkeleton />}>
          <LiveTiles modelPWin1={modelPWin1} players={players} stored={stored} />
        </Suspense>
      </div>

      {bet && (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Bookmaker reference: bet365{betOdds(bet) ? <> ({p1} {betOdds(bet)!['1']}, {p2} {betOdds(bet)!['2']})</> : null} implies <span className="tabular-nums text-[var(--text-secondary)]">{p1} {formatPct(bet.pWin1)} · {p2} {formatPct(bet.pWin2)}</span> after removing the margin
          {' '}(as of {new Date(bet.asOf).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}).
        </p>
      )}

      <div className="mt-4 rounded-xl border border-[var(--border)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
        <p className="font-semibold text-[var(--text-primary)]">Why the gap?</p>
        <p>
          {ratio !== null && ratio > 1.15
            ? <>The markets give {p1} roughly {ratio >= 1.8 ? `${ratio.toFixed(1)}×` : `${Math.round((ratio - 1) * 100)}% more than`} our model’s chance. </>
            : ratio !== null && ratio < 0.87
              ? <>The markets are less optimistic about {p1} than our model. </>
              : ratio !== null ? <>The markets and our model broadly agree. </> : null}
          Our model only knows ratings: {higher} is <strong className="text-[var(--text-primary)] tabular-nums">{Math.abs(ratingGap)} points</strong> higher on the live list after the Olympiad
          {drawRate !== null && <>. Even after calibrating to how drawish title matches are (about {formatPct(drawRate, 0)} of classical games here), that gap makes {higher} the favourite in every game, and over 14 games small per-game edges add up</>}.
        </p>
        <p>
          Traders may be pricing what a ratings model cannot see: {p1}’s experience of winning a title match, months of targeted preparation,
          and the usual pull of betting markets toward underdogs (the favourite–longshot bias). Neither view is “right” — the gap is the story.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2">Polymarket, live</p>
        <PolymarketEmbed
          markets={[
            { slug: MARKETS.polymarket.slugs[2], title: `Polymarket: will ${p2} win the 2026 World Chess Championship?` },
            { slug: MARKETS.polymarket.slugs[1], title: `Polymarket: will ${p1} win the 2026 World Chess Championship?` },
          ]}
        />
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          Third-party widgets, loaded only when this section is on screen. Prices are not advice; check local rules before trading.
        </p>
      </div>
    </Section>
  );
}
