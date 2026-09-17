import TournamentHeader from '@/components/simulation/TournamentHeader';
import RelativeTime from '@/components/ui/RelativeTime';
import OlympiadDashboard from './OlympiadDashboard';
import MethodologyCards from './MethodologyCards';
import { olympiadSubnav } from './boards/BoardRacePage';
import { N_ROUNDS, OLYMPIAD_EVENTS, eventHref } from '@/lib/olympiad/config';
import {
  getOlympiadMatches,
  getOlympiadPlayers,
  getOlympiadProjectedPairings,
  getOlympiadRoundOdds,
  getOlympiadRun,
  getOlympiadStatus,
  getOlympiadSummary,
  getOlympiadSummaryHistory,
  getOlympiadTeams,
} from '@/lib/olympiad/queries';
import { teamsInRun } from '@/lib/olympiad/standings';
import type { OlympiadEvent } from '@/lib/olympiad/types';

export default async function OlympiadPage({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const [run, allTeams, players, matches, status] = await Promise.all([
    getOlympiadRun(event),
    getOlympiadTeams(event),
    getOlympiadPlayers(event),
    getOlympiadMatches(event),
    getOlympiadStatus(event),
  ]);
  const teams = teamsInRun(allTeams, run);
  const nextRound = run ? run.roundsCompleted + 1 : 0;
  const needProjected = run !== null && nextRound <= N_ROUNDS && !matches.some(m => m.round === nextRound);
  const [summary, history, projected, roundOdds] = run
    ? await Promise.all([
        getOlympiadSummary(event, run.runId),
        getOlympiadSummaryHistory(event),
        needProjected ? getOlympiadProjectedPairings(event, run.runId, nextRound, run.nTeams) : Promise.resolve([]),
        nextRound <= N_ROUNDS ? getOlympiadRoundOdds(event, run.runId, nextRound, run.nTeams, []) : Promise.resolve(null),
      ])
    : [[], [], [], null];
  const allMatches = projected.length ? [...matches, ...projected] : matches;
  const participantIds = new Set(summary.map(s => s.teamId));
  const nonParticipants = run ? teams.filter(t => !participantIds.has(t.teamId)).map(t => t.name) : [];

  const topSeeds = teams.slice(0, 8).map(t => ({ code: t.fedCode, title: t.name }));
  const finished = status.lastFinalRound >= N_ROUNDS;
  const startLabel = new Date(cfg.startDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const statusPill = finished
    ? { text: 'Final', live: false }
    : status.anyLive
      ? { text: `Round ${status.lastFinalRound + 1} in progress`, live: true }
      : status.lastFinalRound > 0
        ? { text: `After round ${status.lastFinalRound} of ${N_ROUNDS}`, live: false }
        : { text: `Starts ${startLabel}`, live: false };

  const meta = run
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
        flags={topSeeds}
        statusPill={statusPill}
        meta={meta}
        switcher={switcher}
        subnav={olympiadSubnav(event, 'odds')}
      />

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
