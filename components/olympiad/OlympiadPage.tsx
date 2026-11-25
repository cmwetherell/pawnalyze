import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlagStack } from '@/components/ui/FlagStack';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { Tag } from '@/components/ui/Tag';
import { TextLink } from '@/components/ui/TextLink';
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
import { olympiadSubnav } from './boards/BoardRacePage';
import { OlympiadDashboard } from './OlympiadDashboard';
import { OlympiadMethod } from './OlympiadMethod';
import { podiumRows } from './podium';

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

  const medalists = finished && officialStandings ? podiumRows(officialStandings) : [];
  const teamById = new Map(teams.map(t => [t.teamId, t]));
  // Champions lead the flags once the event is over; seeds order them before that.
  const flags = (medalists.length ? medalists.flatMap(r => teamById.get(r.teamId) ?? []) : teams.slice(0, 8)).map(t => ({ code: t.fedCode, name: t.name }));
  const status_ = statusPillFor(status, cfg.startDate);

  const meta = finished && run
    ? [
        `${summary.length} teams, Samarkand`,
        `${run.nSims.toLocaleString('en-US')} simulations per round`,
        `Ended ${new Date(cfg.endDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`,
      ]
    : run
    ? [
        `${run.nSims.toLocaleString('en-US')} simulations after round ${run.roundsCompleted}`,
        ...(status.lastFinalRound > run.roundsCompleted ? [`Round ${status.lastFinalRound} results not yet simulated`] : []),
        <RelativeTime key="upd" iso={run.createdAt} prefix="Updated " />,
        `${summary.length} teams playing`,
      ]
    : [`${teams.length} teams registered`];

  return (
    <Page kind="dashboard">
      <PageHead
        crumbs={[{ label: 'Simulations', href: '/simulations' }, { label: cfg.shortTitle }]}
        switcher={(['open', 'women'] as const).map(e => ({ label: e === 'open' ? 'Open' : 'Women', href: eventHref(e), active: e === event }))}
        media={<FlagStack items={flags} size={medalists.length ? 'lg' : 'md'} label={medalists.length ? 'Medalists' : 'Top seeds'} />}
        status={<Tag tone={status_.live ? 'live' : 'neutral'} icon={finished ? 'check' : undefined}>{status_.text}</Tag>}
        title={cfg.shortTitle}
        facts={[cfg.format, ...meta, <TextLink key="cr" href={cfg.chessResultsUrl}>chess-results</TextLink>]}
        tabs={olympiadSubnav(event, 'odds')}
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
          finished={finished}
          oddsRound={(oddsRun ?? run).roundsCompleted}
          officialStandings={officialStandings}
        />
      ) : (
        <Section layout="plain" rule={false} label="Simulations">
          <EmptyState
            title="Simulations coming soon"
            body={teams.length > 0
              ? `${teams.length} teams are registered. The first batch of simulations will appear here once the pairings are in.`
              : 'Team lists and pairings will appear here as soon as they are published.'}
            action={<TextLink standalone href={cfg.chessResultsUrl}>View the field on chess-results</TextLink>}
          />
        </Section>
      )}

      <OlympiadMethod description={cfg.description} nonParticipants={nonParticipants} />
    </Page>
  );
}
