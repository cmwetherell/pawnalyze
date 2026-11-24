import Image from 'next/image';
import Link from 'next/link';

import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import { CLASSICAL_SCHEDULE, WCC_HREF } from '@/lib/wcc/config';
import { WCC_PHOTOS } from '@/lib/wcc/photos';
import { getWccGames, getWccPlayers, getWccRun, getWccSummary } from '@/lib/wcc/queries';
import { withMatchRatings } from '@/lib/wcc/rebase';
import { currentOdds, fmtScore, matchState } from '@/lib/wcc/status';
import type { PlayerId } from '@/lib/wcc/types';
import { CompactCountdown } from './MatchStatus';
import { resolvePlayers } from './players';
import { Crown } from './ui';

const AVATAR: Record<PlayerId, string> = { 1: WCC_PHOTOS.gukesh.portrait.src, 2: WCC_PHOTOS.sindarov.portrait.src };

/** Home-page flagship card: face-off, split bar, countdown or score, CTA. */
export default async function WccHomeFeature() {
  const [rows, games, run] = await Promise.all([getWccPlayers(), getWccGames(), getWccRun()]);
  const stored = run ? await getWccSummary(run.runId, 'wcc') : null;
  const state = matchState(games, run?.params.g1_white ?? null);
  const rebased = run ? await withMatchRatings(run, [stored], state) : null;
  const shownRun = rebased?.run ?? null;
  const summary = rebased?.summaries[0] ?? null;
  const players = resolvePlayers(rows, shownRun);
  const p1 = shownRun && summary ? currentOdds(summary, shownRun, state).pWin1 : null;
  const started = state.lastFinal > 0 || state.anyLive;

  const side = (id: PlayerId) => {
    const p = players[id];
    const right = id === 2;
    return (
      <div className={`flex flex-col ${right ? 'items-end text-right' : 'items-start'} min-w-0`}>
        <div className="relative w-20 h-24 sm:w-28 sm:h-36 rounded-xl overflow-hidden ring-1 ring-white/10" style={{ boxShadow: `0 16px 40px -18px var(--wcc-p${id})` }}>
          <Image src={AVATAR[id]} alt={p.name} fill sizes="112px" className="object-cover" style={{ objectPosition: '50% 30%' }} />
          <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: `var(--wcc-p${id})` }} />
        </div>
        <p className="mt-2 flex items-center gap-1.5 font-heading text-lg sm:text-2xl text-white">
          {!right && <Flag code={p.fedCode} size="xs" aria-hidden />}
          {p.shortName}
          {right && <Flag code={p.fedCode} size="xs" aria-hidden />}
        </p>
        <p className={`text-[10px] sm:text-[11px] uppercase tracking-wider ${p.isChampion ? 'text-chess-gold' : 'text-white/55'} inline-flex items-center gap-1`}>
          {p.isChampion && <Crown className="w-3 h-3" />}{p.isChampion ? 'Champion' : 'Challenger'} · {p.ratings.classical || '—'}
        </p>
      </div>
    );
  };

  return (
    <Link
      href={WCC_HREF}
      className="group relative block overflow-hidden rounded-2xl bg-[#0B0D12] text-white ring-1 ring-white/10 hover:ring-chess-gold/40 transition-all"
    >
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -left-24 -top-10 w-80 h-80 rounded-full blur-3xl opacity-25" style={{ background: 'var(--wcc-p1)' }} />
        <div className="absolute -right-24 -top-10 w-80 h-80 rounded-full blur-3xl opacity-25" style={{ background: 'var(--wcc-p2)' }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-chess-gold/60 to-transparent" />
      </div>
      <div className="relative p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-chess-gold">World Chess Championship 2026 · Geneva</p>
          <p className="text-xs text-white/60">
            {state.winner
              ? `${players[state.winner].shortName} is World Champion`
              : started
                ? `After game ${state.lastFinal}: ${fmtScore(state.score1, state.score2)}`
                : <CompactCountdown to={CLASSICAL_SCHEDULE[0].startsAt} />}
          </p>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {side(1)}
          <div className="text-center">
            <span className="grid place-items-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-chess-gold/50 font-heading text-chess-gold text-sm">VS</span>
          </div>
          {side(2)}
        </div>
        {p1 !== null && (
          <div className="mt-6">
            <div className="flex justify-between items-end font-heading">
              <span className="text-3xl sm:text-4xl">{formatPct(p1)}</span>
              <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-white/50 pb-1.5 hidden sm:inline">chance to win the match</span>
              <span className="text-3xl sm:text-4xl">{formatPct(1 - p1)}</span>
            </div>
            <div className="mt-2 flex h-3 gap-[2px] rounded-full overflow-hidden" role="img" aria-label={`${players[1].shortName} ${formatPct(p1)}, ${players[2].shortName} ${formatPct(1 - p1)}`}>
              <div style={{ width: `${p1 * 100}%`, background: 'var(--wcc-p1)' }} />
              <div className="flex-1" style={{ background: 'var(--wcc-p2)' }} />
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-white/70 max-w-md">
            {run
              ? `Exact odds, confirmed by ${run.nSims.toLocaleString('en-US')} simulations. Build scenarios, explore the tiebreaks, compare the markets.`
              : 'Exact match odds, tiebreak paths and a scenario builder, arriving soon.'}
          </p>
          <span className="inline-flex items-center gap-2 bg-chess-gold text-chess-dark font-semibold px-4 h-11 rounded-lg group-hover:bg-chess-gold-light transition-colors text-sm">
            Explore the match
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
