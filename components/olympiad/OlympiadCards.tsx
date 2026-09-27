import TournamentCard from '@/components/TournamentCard';
import Flag from '@/components/ui/Flag';
import { N_ROUNDS, OLYMPIAD_EVENTS, eventHref } from '@/lib/olympiad/config';
import { getOlympiadOfficialStandings, getOlympiadStatus, getOlympiadTeams } from '@/lib/olympiad/queries';
import { teamsInRun } from '@/lib/olympiad/standings';
import type { OlympiadEvent } from '@/lib/olympiad/types';

async function OlympiadCard({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const [status, allTeams, standings] = await Promise.all([
    getOlympiadStatus(event), getOlympiadTeams(event), getOlympiadOfficialStandings(event),
  ]);
  const teams = teamsInRun(allTeams, status.run);
  const finished = status.lastFinalRound >= N_ROUNDS;
  const cardStatus = finished ? 'completed' : status.lastFinalRound > 0 || status.anyLive ? 'live' : 'upcoming';
  const champion = finished
    ? teams.find(t => t.teamId === standings?.rows.find(r => r.rank === 1)?.teamId)?.name
    : undefined;
  const meta = finished
    ? `${N_ROUNDS} rounds · ${teams.length} teams`
    : status.run
      ? `${status.lastFinalRound > 0 ? `Round ${status.lastFinalRound} of ${N_ROUNDS}` : 'Pre-tournament'} · ${status.run.nSims.toLocaleString()} sims`
      : 'Sims coming soon';

  return (
    <TournamentCard
      name={cfg.shortTitle}
      href={eventHref(event)}
      description={cfg.description}
      format={cfg.format}
      status={cardStatus}
      winner={champion}
      meta={meta}
      decoration={
        teams.length > 0 ? (
          <div className="flex items-center gap-1">
            {(finished && standings
              ? standings.rows.filter(r => r.rank <= 3).sort((a, b) => a.rank - b.rank)
                  .flatMap(r => { const t = teams.find(x => x.teamId === r.teamId); return t ? [t] : []; })
              : teams.slice(0, 8)
            ).map(t => (
              <Flag key={t.teamId} code={t.fedCode} title={t.name} size="sm" />
            ))}
            <span className="ml-1 text-[11px] text-[var(--text-muted)]">+{Math.max(0, teams.length - 8)}</span>
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
