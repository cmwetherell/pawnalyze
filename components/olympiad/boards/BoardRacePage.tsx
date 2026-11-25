import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { FlagStack } from '@/components/ui/FlagStack';
import { Tag } from '@/components/ui/Tag';
import { TextLink } from '@/components/ui/TextLink';
import { BOARD_LABELS, OLYMPIAD_EVENTS, boardsHref, eventHref } from '@/lib/olympiad/config';
import { contenders, hasNewLeader } from '@/lib/olympiad/medals';
import { getOlympiadBoardRace, getOlympiadBoardRows, getOlympiadRun, getOlympiadStatus, getOlympiadTeams } from '@/lib/olympiad/queries';
import { liteRow, summarizeRace } from '@/lib/olympiad/race';
import { teamsInRun } from '@/lib/olympiad/standings';
import { isFinished, statusPillFor } from '@/lib/olympiad/status';
import { MIN_GAMES_FOR_PRIZE, displayName } from '@/lib/olympiad/tpr';
import type { OlympiadEvent } from '@/lib/olympiad/types';
import { BoardRaceDashboard } from './BoardRaceDashboard';
import { BoardRaceExplainer } from './BoardRaceExplainer';

export function olympiadSubnav(event: OlympiadEvent, active: 'odds' | 'boards') {
  return [
    { label: 'Medal odds', href: eventHref(event), active: active === 'odds' },
    { label: 'Board prizes', href: boardsHref(event), active: active === 'boards' },
  ];
}

export default async function BoardRacePage({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const [run, allTeams, status, race, board1] = await Promise.all([
    getOlympiadRun(event), getOlympiadTeams(event), getOlympiadStatus(event), getOlympiadBoardRace(event), getOlympiadBoardRows(event, 1),
  ]);
  const teams = teamsInRun(allTeams, run);
  const finished = isFinished(status);
  // The page ships podiums, a search index and board 1; other boards load on demand. Medals go to players who can meet the eight-game rule.
  const summary = { ...summarizeRace(race), podium: race.boards.map(rows => contenders(rows).slice(0, 3).map(liteRow)) };
  const newLeaders = race.boards.map(rows => hasNewLeader(rows, race.lastRound));
  const players = race.boards.reduce((n, b) => n + b.length, 0);
  const leaders = summary.podium.flatMap((rows, i) => (rows[0] ? [{ code: rows[0].fedCode, name: `${BOARD_LABELS[i]}: ${displayName(rows[0].name)} (${rows[0].tpr})` }] : []));
  const pill = statusPillFor(status, cfg.startDate);

  const rule = finished
    ? 'Individual gold, silver and bronze on each board went to the best performance rating among players who completed eight games. Final standings for all five boards.'
    : 'Individual gold, silver and bronze on each board go to the best performance rating among players who complete eight games. Who is on course?';
  const source = <TextLink key="src" href={cfg.chessResultsUrl}>chess-results</TextLink>;
  const facts = race.lastRound > 0
    ? [`${BOARD_LABELS.length} boards, TPR, ${MIN_GAMES_FOR_PRIZE}-game minimum`, `Games through round ${race.lastRound}`, `${players} players on ${BOARD_LABELS.length} boards`, source]
    : [`${BOARD_LABELS.length} boards, TPR, ${MIN_GAMES_FOR_PRIZE}-game minimum`, `${players} players registered`, source];

  return (
    <Page kind="dashboard">
      <PageHead
        title={finished ? 'Board prizes' : 'Board prize race'}
        crumbs={[{ label: 'Simulations', href: '/simulations' }, { label: cfg.shortTitle, href: eventHref(event) }, { label: 'Board prizes' }]}
        switcher={(['open', 'women'] as OlympiadEvent[]).map(e => ({ label: e === 'open' ? 'Open' : 'Women', href: boardsHref(e), active: e === event }))}
        status={<Tag tone={pill.live ? 'live' : 'neutral'}>{pill.text}</Tag>}
        media={leaders.length > 0 && <FlagStack items={leaders} size="lg" label="Board leaders" />}
        facts={facts}
        tabs={olympiadSubnav(event, 'boards')}
      />
      <BoardRaceDashboard
        event={event} finished={finished} rule={rule} summary={summary} newLeaders={newLeaders} initialRows={board1} teams={teams}
      />
      <BoardRaceExplainer />
    </Page>
  );
}
