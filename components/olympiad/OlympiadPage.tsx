import TournamentHeader from '@/components/simulation/TournamentHeader';
import OlympiadDashboard from './OlympiadDashboard';
import MethodologyCards from './MethodologyCards';
import { N_ROUNDS, OLYMPIAD_EVENTS } from '@/lib/olympiad/config';
import {
  getOlympiadMatches,
  getOlympiadPlayers,
  getOlympiadRun,
  getOlympiadStatus,
  getOlympiadSummary,
  getOlympiadSummaryHistory,
  getOlympiadTeams,
} from '@/lib/olympiad/queries';
import type { OlympiadEvent } from '@/lib/olympiad/types';

export default async function OlympiadPage({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const [run, teams, players, matches, status] = await Promise.all([
    getOlympiadRun(event),
    getOlympiadTeams(event),
    getOlympiadPlayers(event),
    getOlympiadMatches(event),
    getOlympiadStatus(event),
  ]);
  const [summary, history] = run
    ? await Promise.all([getOlympiadSummary(event, run.runId), getOlympiadSummaryHistory(event)])
    : [[], []];

  const topSeeds = teams.slice(0, 8).map(t => ({ code: t.fedCode, title: t.name }));
  const finished = status.lastFinalRound >= N_ROUNDS;
  const statusPill = finished
    ? { text: 'Final', live: false }
    : status.anyLive
      ? { text: `Round ${status.lastFinalRound + 1} in progress`, live: true }
      : status.lastFinalRound > 0
        ? { text: `After round ${status.lastFinalRound} of ${N_ROUNDS}`, live: false }
        : { text: `Starts ${new Date(cfg.startDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`, live: false };

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
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2 w-full">
        <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-3xl">
          {run ? (
            <>
              We simulate the remaining rounds <strong className="text-chess-gold">{run.nSims.toLocaleString()} times</strong> after
              every round, pairing teams Swiss-style and playing out each board from the players&apos; ratings. Use the{' '}
              <span className="text-[var(--text-primary)] font-medium">Scenario Builder</span> to lock in match results
              and see how the medal picture changes.
            </>
          ) : (
            <>
              Simulations for the {cfg.shortTitle} arrive shortly before round 1. Check back soon.
            </>
          )}
        </p>
      </div>

      {run ? (
        <OlympiadDashboard
          event={event}
          run={run}
          teams={teams}
          players={players}
          matches={matches}
          summary={summary}
          history={history}
          lastFinalRound={status.lastFinalRound}
          anyLive={status.anyLive}
        />
      ) : (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
          <div className="surface-card p-8 text-center">
            <div className="w-10 h-10 mx-auto rounded-lg bg-chess-gold/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-chess-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              className="inline-block mt-4 text-sm text-chess-gold hover:text-chess-gold-light underline decoration-chess-gold/30"
            >
              View the field on chess-results
            </a>
          </div>
        </div>
      )}

      <MethodologyCards />
    </main>
  );
}
