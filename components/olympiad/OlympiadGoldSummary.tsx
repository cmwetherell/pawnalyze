import Link from 'next/link';

import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import { N_ROUNDS, OLYMPIAD_EVENTS, eventHref } from '@/lib/olympiad/config';
import { getOlympiadRun, getOlympiadStatus, getOlympiadSummary, getOlympiadTeams } from '@/lib/olympiad/queries';
import type { OlympiadEvent } from '@/lib/olympiad/types';

async function GoldPanel({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const href = eventHref(event);
  const [run, teams, status] = await Promise.all([getOlympiadRun(event), getOlympiadTeams(event), getOlympiadStatus(event)]);
  const summary = run ? await getOlympiadSummary(event, run.runId) : [];
  const teamsById = new Map(teams.map(t => [t.teamId, t]));
  const top = [...summary].sort((a, b) => b.pGold - a.pGold).slice(0, 5);
  const stage = status.lastFinalRound >= N_ROUNDS
    ? 'Final'
    : status.anyLive
      ? `Round ${status.lastFinalRound + 1} live`
      : status.lastFinalRound > 0
        ? `After round ${status.lastFinalRound}`
        : 'Pre-tournament';

  return (
    <Link href={href} className="group surface-card p-5 sm:p-6 block hover:border-chess-gold/30 transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            {status.anyLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />}
            {event === 'open' ? 'Open' : "Women's"} · {stage}
          </p>
          <h3 className="font-heading text-lg text-[var(--text-primary)] group-hover:text-chess-gold transition-colors">
            Who wins gold?
          </h3>
        </div>
        {run && (
          <span className="text-[10px] text-[var(--text-muted)] text-right tabular-nums shrink-0">
            {run.nSims.toLocaleString()} sims
          </span>
        )}
      </div>

      {top.length > 0 ? (
        <ol className="space-y-2.5">
          {top.map((s, i) => {
            const team = teamsById.get(s.teamId);
            if (!team) return null;
            return (
              <li key={s.teamId} className="flex items-center gap-3">
                <span className="w-4 text-xs tabular-nums text-[var(--text-muted)]">{i + 1}</span>
                <Flag code={team.fedCode} size="md" title={team.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">{team.name}</span>
                    <span className="text-sm font-heading text-chess-gold tabular-nums shrink-0">{formatPct(s.pGold)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[var(--bg-surface-3)] overflow-hidden">
                    <div className="h-full bg-medal-gold rounded-full" style={{ width: `${Math.min(100, s.pGold * 100)}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          Simulations for the {cfg.shortTitle} arrive shortly before round 1.
        </p>
      )}

      <p className="mt-4 text-sm text-chess-gold group-hover:translate-x-1 transition-transform inline-block">
        {top.length > 0 ? `Explore all ${summary.length} teams & build scenarios` : 'See the field'} &rarr;
      </p>
    </Link>
  );
}

/** Home-page teaser: top-5 gold odds for both Olympiad events, linking to the simulations. */
export default async function OlympiadGoldSummary() {
  return (
    <>
      <GoldPanel event="open" />
      <GoldPanel event="women" />
    </>
  );
}
