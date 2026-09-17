import TournamentHeader from '@/components/simulation/TournamentHeader';
import BoardRaceDashboard from './BoardRaceDashboard';
import BoardRaceExplainer from './BoardRaceExplainer';
import { BOARD_LABELS, OLYMPIAD_EVENTS, boardsHref, eventHref } from '@/lib/olympiad/config';
import { getOlympiadBoardRace, getOlympiadRun, getOlympiadStatus, getOlympiadTeams } from '@/lib/olympiad/queries';
import { teamsInRun } from '@/lib/olympiad/standings';
import { statusPillFor } from '@/lib/olympiad/status';
import { MIN_GAMES_FOR_PRIZE, displayName } from '@/lib/olympiad/tpr';
import type { OlympiadEvent } from '@/lib/olympiad/types';

export function olympiadSubnav(event: OlympiadEvent, active: 'odds' | 'boards') {
  return [
    { label: 'Medal odds', href: eventHref(event), active: active === 'odds' },
    { label: 'Board prizes', href: boardsHref(event), active: active === 'boards' },
  ];
}

export default async function BoardRacePage({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const [run, allTeams, status, race] = await Promise.all([
    getOlympiadRun(event), getOlympiadTeams(event), getOlympiadStatus(event), getOlympiadBoardRace(event),
  ]);
  const teams = teamsInRun(allTeams, run);
  const players = race.boards.reduce((n, b) => n + b.length, 0);
  const leaders = race.boards.map((rows, i) => rows[0] ? { code: rows[0].fedCode, title: `${BOARD_LABELS[i]}: ${displayName(rows[0].name)} (${rows[0].tpr})` } : null).filter((x): x is { code: string; title: string } => x !== null);

  const meta = race.lastRound > 0
    ? [
        <span key="upd">games through <strong className="text-gold-ink font-semibold">round {race.lastRound}</strong></span>,
        <span key="n">{players} players on {BOARD_LABELS.length} boards</span>,
        <span key="min">{MIN_GAMES_FOR_PRIZE} games to qualify</span>,
      ]
    : [<span key="n">{players} players registered</span>];

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <TournamentHeader
        name="Board Prize Race"
        crumbs={[{ label: cfg.shortTitle, href: eventHref(event) }, { label: 'Board prizes' }]}
        website={cfg.chessResultsUrl}
        websiteLabel="chess-results"
        description="Individual gold, silver and bronze on each board go to the best performance rating among players who complete eight games. Who is on course?"
        format="5 boards · TPR · 8-game minimum"
        flags={leaders}
        statusPill={statusPillFor(status, cfg.startDate)}
        meta={meta}
        switcher={(['open', 'women'] as OlympiadEvent[]).map(e => ({ label: e === 'open' ? 'Open' : 'Women', href: boardsHref(e), active: e === event }))}
        subnav={olympiadSubnav(event, 'boards')}
      />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <BoardRaceDashboard event={event} race={race} teams={teams} />
        <BoardRaceExplainer />
      </div>
    </main>
  );
}
