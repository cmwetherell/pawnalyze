import Link from 'next/link';

import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import { N_ROUNDS, OLYMPIAD_EVENTS, eventHref } from '@/lib/olympiad/config';
import { getOlympiadOfficialStandings, getOlympiadRun, getOlympiadStatus, getOlympiadSummary, getOlympiadTeams } from '@/lib/olympiad/queries';
import { teamsInRun } from '@/lib/olympiad/standings';
import type { OlympiadEvent } from '@/lib/olympiad/types';

async function GoldPanel({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const href = eventHref(event);
  const [run, allTeams, status, standings] = await Promise.all([
    getOlympiadRun(event), getOlympiadTeams(event), getOlympiadStatus(event), getOlympiadOfficialStandings(event),
  ]);
  const finished = status.lastFinalRound >= N_ROUNDS;
  const teams = teamsInRun(allTeams, run);
  const summary = run ? await getOlympiadSummary(event, run.runId) : [];
  const teamsById = new Map(teams.map(t => [t.teamId, t]));
  const top = finished && standings
    ? standings.rows.filter(r => r.rank <= 5).sort((a, b) => a.rank - b.rank)
        .map(r => ({ teamId: r.teamId, pGold: 0, mp: r.mp, gp: r.gpHalf / 2 }))
    : [...summary].sort((a, b) => b.pGold - a.pGold).slice(0, 5)
        .map(s2 => ({ teamId: s2.teamId, pGold: s2.pGold, mp: null as number | null, gp: null as number | null }));
  const maxMp = Math.max(1, ...top.map(t => t.mp ?? 0));
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
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            {status.anyLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />}
            {event === 'open' ? 'Open' : "Women's"} · {stage}
          </p>
          <h3 className="font-heading text-lg text-[var(--text-primary)] group-hover:text-gold-ink transition-colors">
            {finished ? 'Final standings' : 'Who wins gold?'}
          </h3>
        </div>
        {run && (
          <span className="text-[11px] text-[var(--text-muted)] text-right tabular-nums shrink-0">
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
                    <span className="text-sm font-heading text-gold-ink tabular-nums shrink-0">
                      {s.mp !== null ? `${s.mp} MP` : formatPct(s.pGold)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[var(--bg-surface-3)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 0 ? 'bg-medal-gold' : i === 1 && s.mp !== null ? 'bg-medal-silver' : i === 2 && s.mp !== null ? 'bg-medal-bronze' : 'bg-medal-gold'}`}
                      style={{ width: `${s.mp !== null ? (s.mp / maxMp) * 100 : Math.min(100, s.pGold * 100)}%` }}
                    />
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

      <p className="mt-4 text-sm text-gold-ink group-hover:translate-x-1 transition-transform inline-block">
        {top.length === 0 ? 'See the field' : finished ? `Full results for all ${summary.length} teams` : `Explore all ${summary.length} teams & build scenarios`} &rarr;
      </p>
    </Link>
  );
}

/** Home-page teaser: top-5 for both Olympiad events -- gold odds while running, final table once over. */
export default async function OlympiadGoldSummary() {
  return (
    <>
      <GoldPanel event="open" />
      <GoldPanel event="women" />
    </>
  );
}
