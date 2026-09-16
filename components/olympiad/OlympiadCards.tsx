import TournamentCard from '@/components/TournamentCard';
import Flag from '@/components/ui/Flag';
import { N_ROUNDS, OLYMPIAD_EVENTS, eventHref } from '@/lib/olympiad/config';
import { getOlympiadStatus, getOlympiadTeams } from '@/lib/olympiad/queries';
import { teamsInRun } from '@/lib/olympiad/standings';
import type { OlympiadEvent } from '@/lib/olympiad/types';

async function OlympiadCard({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const [status, allTeams] = await Promise.all([getOlympiadStatus(event), getOlympiadTeams(event)]);
  const teams = teamsInRun(allTeams, status.run);
  const cardStatus =
    status.lastFinalRound >= N_ROUNDS ? 'completed'
      : status.lastFinalRound > 0 || status.anyLive ? 'live'
        : 'upcoming';
  const meta = status.run
    ? `${status.lastFinalRound > 0 ? `Round ${status.lastFinalRound} of ${N_ROUNDS}` : 'Pre-tournament'} · ${status.run.nSims.toLocaleString()} sims`
    : 'Sims coming soon';

  return (
    <TournamentCard
      name={cfg.shortTitle}
      href={eventHref(event)}
      description={cfg.description}
      format={cfg.format}
      status={cardStatus}
      meta={meta}
      decoration={
        teams.length > 0 ? (
          <div className="flex items-center gap-1">
            {teams.slice(0, 8).map(t => (
              <Flag key={t.teamId} code={t.fedCode} title={t.name} size="sm" />
            ))}
            <span className="ml-1 text-[10px] text-[var(--text-muted)]">+{Math.max(0, teams.length - 8)}</span>
          </div>
        ) : null
      }
    />
  );
}

/** Both Olympiad cards; drop into any card grid. */
export default async function OlympiadCards() {
  return (
    <>
      <OlympiadCard event="open" />
      <OlympiadCard event="women" />
    </>
  );
}
