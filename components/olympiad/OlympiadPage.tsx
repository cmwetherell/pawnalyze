import TournamentHeader from '@/components/simulation/TournamentHeader';
import RelativeTime from '@/components/ui/RelativeTime';
import OlympiadDashboard from './OlympiadDashboard';
import FinalPodium from './FinalPodium';
import MethodologyCards from './MethodologyCards';
import { olympiadSubnav } from './boards/BoardRacePage';
import { N_ROUNDS, OLYMPIAD_EVENTS, eventHref } from '@/lib/olympiad/config';
import {
  getOlympiadBoardRace,
  getOlympiadMatches,
  getOlympiadOfficialStandings,
  getOlympiadPlayers,
  getOlympiadProjectedPairings,
  getOlympiadRoundOdds,
  getOlympiadRun,
  getOlympiadRunAtRound,
  getOlympiadStatus,
  getOlympiadSummary,
  getOlympiadSummaryHistory,
  getOlympiadTeams,
} from '@/lib/olympiad/queries';
import { teamsInRun } from '@/lib/olympiad/standings';
import { isFinished, statusPillFor } from '@/lib/olympiad/status';
import type { OlympiadEvent } from '@/lib/olympiad/types';

export default async function OlympiadPage({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const [run, allTeams, roster, matches, status, race, officialStandings] = await Promise.all([
    getOlympiadRun(event),
    getOlympiadTeams(event),
    getOlympiadPlayers(event),
    getOlympiadMatches(event),
    getOlympiadStatus(event),
    getOlympiadBoardRace(event),
    getOlympiadOfficialStandings(event),
  ]).catch((err: unknown) => {
    // Surface driver errors that are thrown as plain objects (they otherwise log as [object Object]).
    console.error(`[olympiad] data load failed for ${event}:`, err instanceof Error ? err.stack : JSON.stringify(err));
    throw err;
  });
  // Attach each player's board-race stats so the spotlight roster can show TPR and link to profiles.
  const raceByFide = new Map(race.boards.flat().map(r => [r.fideId, r]));
  const players = roster.map(p => {
    const r = p.fideId !== null ? raceByFide.get(p.fideId) : undefined;
    return r ? { ...p, race: { tpr: r.tpr, score: r.score, games: r.games, rank: r.rank } } : p;
  });
  const teams = teamsInRun(allTeams, run);
  const finished = isFinished(status);
  const nextRound = run ? run.roundsCompleted + 1 : 0;

  // With every round simulated the current run is degenerate (medalists at 100%, everyone else 0%),
  // so once the event is over the odds shown are the ones from before the final round -- the last
  // point at which they were a forecast. The result itself comes from the official standings.
  const oddsRun = finished ? (await getOlympiadRunAtRound(event, N_ROUNDS - 1)) ?? run : run;
  const needProjected = run !== null && nextRound <= N_ROUNDS && !matches.some(m => m.round === nextRound);
  const [summary, history, projected, roundOdds] = run
    ? await Promise.all([
        getOlympiadSummary(event, (oddsRun ?? run).runId),
        getOlympiadSummaryHistory(event),
        needProjected ? getOlympiadProjectedPairings(event, run.runId, nextRound, run.nTeams) : Promise.resolve([]),
        nextRound <= N_ROUNDS ? getOlympiadRoundOdds(event, run.runId, nextRound, run.nTeams, []) : Promise.resolve(null),
      ])
    : [[], [], [], null];
  const allMatches = projected.length ? [...matches, ...projected] : matches;
  const participantIds = new Set(summary.map(s => s.teamId));
  const nonParticipants = run ? teams.filter(t => !participantIds.has(t.teamId)).map(t => t.name) : [];

  const medalists = finished && officialStandings
    ? officialStandings.rows.filter(r => r.rank <= 3).sort((a, b) => a.rank - b.rank)
    : [];
  const teamById = new Map(teams.map(t => [t.teamId, t]));
  // Champions lead the header flag stack once the event is over; seeds order it before that.
  const headerFlags = medalists.length === 3
    ? medalists.flatMap(r => {
        const t = teamById.get(r.teamId);
        return t ? [{ code: t.fedCode, title: t.name }] : [];
      })
    : teams.slice(0, 8).map(t => ({ code: t.fedCode, title: t.name }));
  const preTournamentGold = new Map(
    history.filter(h => h.roundsCompleted === 0).map(h => [h.teamId, h.pGold]),
  );
  const statusPill = statusPillFor(status, cfg.startDate);

  const meta = finished && run
    ? [
        <span key="final">Final · {N_ROUNDS} rounds · {summary.length} teams</span>,
        <span key="sims"><strong className="text-gold-ink font-semibold">{run.nSims.toLocaleString()}</strong> simulations per round</span>,
        <span key="ended">Ended {new Date(cfg.endDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>,
      ]
    : run
    ? [
        <span key="sims"><strong className="text-gold-ink font-semibold">{run.nSims.toLocaleString()}</strong> simulations after round {run.roundsCompleted}</span>,
        ...(status.lastFinalRound > run.roundsCompleted
          ? [<span key="lag">round {status.lastFinalRound} results not yet simulated</span>]
          : []),
        <RelativeTime key="upd" iso={run.createdAt} prefix="updated " />,
        <span key="teams">{summary.length} teams playing</span>,
      ]
    : [<span key="teams">{teams.length} teams registered</span>];

  const switcher = (['open', 'women'] as OlympiadEvent[]).map(e => ({
    label: e === 'open' ? 'Open' : 'Women',
    href: eventHref(e),
    active: e === event,
  }));

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <TournamentHeader
        name={cfg.shortTitle}
        website={cfg.chessResultsUrl}
        websiteLabel="chess-results"
        description={cfg.description}
        format={cfg.format}
        flags={headerFlags}
        statusPill={statusPill}
        meta={meta}
        switcher={switcher}
        subnav={olympiadSubnav(event, 'odds')}
      />

      {finished && officialStandings ? (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-6">
          <FinalPodium
            standings={officialStandings}
            teams={teams}
            preTournamentGold={preTournamentGold}
            eventLabel={cfg.shortTitle}
          />
        </div>
      ) : null}

      {run ? (
        <OlympiadDashboard
          event={event}
          run={run}
          teams={teams}
          players={players}
          matches={allMatches}
          summary={summary}
          history={history}
          roundOdds={roundOdds}
          anyLive={status.anyLive}
          finished={finished}
          oddsRound={(oddsRun ?? run).roundsCompleted}
          officialStandings={officialStandings}
        />
      ) : (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
          <div className="surface-card p-8 text-center">
            <div className="w-10 h-10 mx-auto rounded-lg bg-chess-gold/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-gold-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-heading text-lg text-[var(--text-primary)]">Simulations coming soon</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
              {teams.length > 0
                ? `${teams.length} teams are registered. The first batch of simulations will appear here once the pairings are in.`
                : 'Team lists and pairings will appear here as soon as they are published.'}
            </p>
            <a
              href={cfg.chessResultsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-gold-ink hover:text-chess-gold-light underline decoration-chess-gold/30"
            >
              View the field on chess-results
            </a>
          </div>
        </div>
      )}

      <MethodologyCards nonParticipants={nonParticipants} />
    </main>
  );
}
