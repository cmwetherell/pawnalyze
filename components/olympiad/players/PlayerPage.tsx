import { notFound } from 'next/navigation';

import { LineChart } from '@/components/charts/LineChart';
import { Container } from '@/components/layout/Container';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Part } from '@/components/layout/Part';
import { Section } from '@/components/layout/Section';
import { EligibilityPips, eligibilityLabel } from '@/components/olympiad/boards/EligibilityPips';
import { FormPips } from '@/components/olympiad/boards/FormPips';
import { CopyButton } from '@/components/ui/CopyButton';
import { Delta } from '@/components/ui/Delta';
import { Flag } from '@/components/ui/Flag';
import { IconButton } from '@/components/ui/IconButton';
import { Medal } from '@/components/ui/Medal';
import { Row, Rows } from '@/components/ui/Rows';
import { StatStrip } from '@/components/ui/StatStrip';
import { Tag } from '@/components/ui/Tag';
import { TextLink } from '@/components/ui/TextLink';
import { N_ROUNDS, OLYMPIAD_EVENTS, boardLabel, boardsHref, eventHref, playerHref } from '@/lib/olympiad/config';
import { MEDAL_WORD, medalPlaces, type MedalPlace } from '@/lib/olympiad/medals';
import { ordinal } from '@/lib/olympiad/odds';
import { getOlympiadBoardRace, getOlympiadPlayerGames } from '@/lib/olympiad/queries';
import { MIN_GAMES_FOR_PRIZE, displayName, formatScore } from '@/lib/olympiad/tpr';
import type { BoardRace, OlympiadEvent, PlayerRaceRow } from '@/lib/olympiad/types';
import { PlayerGames } from './PlayerGames';

export function findPlayer(race: BoardRace, fideId: number): PlayerRaceRow | null {
  for (const rows of race.boards) {
    const hit = rows.find(r => r.fideId === fideId);
    if (hit) return hit;
  }
  return null;
}

export function playerSummary(p: PlayerRaceRow, race: BoardRace): string {
  const label = boardLabel(p.board).toLowerCase();
  if (p.tpr === null) return `${displayName(p.name)} has not played yet on ${label}.`;
  const rank = p.rank !== null ? `${ordinal(p.rank)} of ${race.ranked[p.board - 1]} on ${label}` : label;
  return `TPR ${p.tpr} after ${p.games} ${p.games === 1 ? 'game' : 'games'} (${formatScore(p.score, p.games)}), ${rank}. ${p.eligible ? 'Eligible for a board medal' : `${eligibilityLabel(p.needed, p.canReach)} for the ${MIN_GAMES_FOR_PRIZE}-game minimum`}.`;
}

const plural = (n: number, one: string, many: string) => `${n === 0 ? 'no' : n} ${n === 1 ? one : many}`;

export default async function PlayerPage({ event, fideId }: { event: OlympiadEvent; fideId: number }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const race = await getOlympiadBoardRace(event);
  const player = findPlayer(race, fideId);
  if (!player) notFound();
  const games = await getOlympiadPlayerGames(event, fideId);
  const boardRows = race.boards[player.board - 1];
  const idx = boardRows.findIndex(r => r.fideId === fideId);
  const prev = idx > 0 ? boardRows[idx - 1] : null;
  const next = idx >= 0 && idx < boardRows.length - 1 && boardRows[idx + 1].tpr !== null ? boardRows[idx + 1] : null;

  const name = displayName(player.name);
  const board = boardLabel(player.board);
  const boardWord = board.toLowerCase();
  const boardHref = `${boardsHref(event)}?board=${player.board}`;
  const finished = race.lastFinalRound >= N_ROUNDS;
  const medals = medalPlaces(boardRows);
  const medal = medals.get(fideId) ?? null;
  const wins = player.form.filter(f => f.score === 1).length;
  const draws = player.form.filter(f => f.score === 0.5).length;
  const losses = player.form.filter(f => f.score === 0).length;
  const tally = `${plural(wins, 'win', 'wins')}, ${plural(draws, 'draw', 'draws')} and ${plural(losses, 'loss', 'losses')}`;

  const points = player.tprByRound.flatMap((tpr, i) => (tpr === null ? [] : [{ round: i + 1, tpr, rank: player.rankByRound[i] ?? null }]));
  const rounds = player.tprByRound.map((_, i) => i + 1);
  // The round from which this player has been first on the board without a break.
  let firstSince = race.lastRound + 1;
  while (firstSince > 1 && player.rankByRound[firstSince - 2] === 1) firstSince--;
  const peak = points.reduce<(typeof points)[number] | null>((a, p) => (a && a.tpr >= p.tpr ? a : p), null);
  const trend = player.tpr === null || !peak
    ? null
    : firstSince < race.lastRound
      ? `First on ${boardWord} from round ${firstSince} on.`
      : `Highest after round ${peak.round}: ${peak.tpr}.`;

  return (
    <Page kind="dashboard">
      <PageHead
        title={name}
        crumbs={[
          { label: 'Simulations', href: '/simulations' },
          { label: cfg.shortTitle, href: eventHref(event) },
          { label: 'Board prizes', href: boardHref },
          { label: name },
        ]}
        media={<Flag code={player.fedCode} size="hero" title={player.teamName} decorative />}
        status={player.title && <Tag tone="brand">{player.title}</Tag>}
        facts={[
          <div key="team" className="flex flex-wrap items-center gap-x-3 lg:flex-col lg:items-start">
            <TextLink standalone href={`${eventHref(event)}?team=${player.teamId}`}>{player.teamName}</TextLink>
            <span className="font-normal text-ink-2">{board}, {player.rating ? `rating ${player.rating}` : 'unrated'}</span>
          </div>,
        ]}
        crumbActions={
          <span className="-mr-3 flex items-center">
            <CopyButton kind="link" label="Copy link" variant="icon" />
            {prev
              ? <IconButton icon="chevron-left" href={playerHref(event, prev.fideId)} label={`Previous on ${board}: ${displayName(prev.name)}`} title={displayName(prev.name)} />
              : <IconButton icon="chevron-left" label={`Previous on ${board}`} disabled />}
            {next
              ? <IconButton icon="chevron-right" href={playerHref(event, next.fideId)} label={`Next on ${board}: ${displayName(next.name)}`} title={displayName(next.name)} />
              : <IconButton icon="chevron-right" label={`Next on ${board}`} disabled />}
          </span>
        }
      />

      <Container className="pb-section">
        <StatStrip
          columns={4}
          items={[
            {
              key: 'tpr', label: 'Performance', hint: 'Tournament performance rating', size: 'lg', value: player.tpr ?? '–',
              delta: player.tpr !== null && player.rating > 0 && <Delta value={player.tpr} base={player.rating} unit="plain" />,
              sub: player.rating > 0 ? `vs rating ${player.rating}` : 'unrated',
            },
            {
              key: 'rank', label: board, hint: 'Rank on this board among players with a game', size: 'lg',
              value: <span className="inline-flex items-center gap-3">{player.rank !== null ? ordinal(player.rank) : '–'}{medal && <Medal rank={medal} size={28} />}</span>,
              sub: <>of {race.ranked[player.board - 1]} ranked{medal && medal !== player.rank && `, ${MEDAL_WORD[medal]} among players ${finished ? 'with' : 'who can reach'} ${MIN_GAMES_FOR_PRIZE} games`}</>,
            },
            {
              key: 'score', label: 'Score', size: 'lg', value: player.games ? formatScore(player.score, player.games) : '–',
              sub: `${wins}W ${draws}D ${losses}L${player.avgOpp ? `, average opponent ${player.avgOpp}` : ''}`,
            },
            {
              key: 'games', label: 'Games', hint: `${MIN_GAMES_FOR_PRIZE} games needed for a board medal`, size: 'lg', value: player.games,
              sub: (
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <EligibilityPips games={player.games} needed={player.needed} canReach={player.canReach} roundsLeft={race.roundsLeft} className="flex-nowrap" />
                  <span>{player.eligible ? `Eligible, ${MIN_GAMES_FOR_PRIZE} needed` : eligibilityLabel(player.needed, player.canReach)}{!finished && `, ${race.roundsLeft} ${race.roundsLeft === 1 ? 'round' : 'rounds'} left`}</span>
                </span>
              ),
            },
          ]}
        />
      </Container>

      <Section
        label="Games and performance"
        layout="split"
        ratio="7/5"
        rule={false}
        note={`Performance rating = average opponent rating + FIDE’s bonus for the percentage score. Board medals go to the highest TPR with at least ${MIN_GAMES_FOR_PRIZE} games; ties go to the player with more games. Ratings and results from the official broadcast.`}
      >
        <Part
          rule="always"
          id="games"
          title="Games"
          finding={player.games > 0 && `${tally.charAt(0).toUpperCase()}${tally.slice(1)}${player.avgOpp ? ` against an average of ${player.avgOpp}` : ''}.`}
          actions={<FormPips form={player.form} lastRound={race.lastRound} size="md" />}
        >
          <PlayerGames event={event} player={player} games={games} lastRound={race.lastRound} knownFideIds={race.boards.flat().map(r => r.fideId)} />
        </Part>

        <div className="flex flex-col gap-12">
          <Part rule="always" id="trend" title="Round by round" finding={trend}>
            {trend ? (
              <LineChart
                caption={`Performance rating after each round and rank on ${boardWord}`}
                ariaLabel={`Performance rating by round: ${points.map(p => `after round ${p.round} ${p.tpr}${p.rank ? `, ${ordinal(p.rank)} on the board` : ''}`).join('; ')}`}
                series={[{ id: 'tpr', label: name, values: player.tprByRound, notes: player.rankByRound.map(r => (r === null ? null : ordinal(r))), tone: 'series-1', emphasis: 'strong', labelAt: 'none' }]}
                x={{ labels: rounds.map(r => `R${r}`), titles: rounds.map(r => `After round ${r}`) }}
                y={{ format: 'plain', ...ratingDomain([...points.map(p => p.tpr), ...(player.rating > 0 ? [player.rating] : [])]) }}
                refs={player.rating > 0 ? [{ y: player.rating, label: `rating ${player.rating}` }] : undefined}
                points="all"
                height={{ desktop: 320, phone: 280 }}
                table={{ columns: ['Round', 'Performance', 'Rank'], rows: points.map(p => [`R${p.round}`, p.tpr, p.rank ? ordinal(p.rank) : '–']) }}
              />
            ) : (
              <p className="type-body text-ink-2">No games yet.</p>
            )}
          </Part>

          <Part rule="always" id="board" title={`${board} top 5`}>
            <Rows label={`${board} top 5`}>
              {boardRows.slice(0, 5).map(r => (
                <Row
                  key={r.fideId} size="sm" href={playerHref(event, r.fideId)} selected={r.fideId === fideId}
                  lead={<Standing rank={r.rank} medal={medals.get(r.fideId)} code={r.fedCode} />} title={displayName(r.name)} value={r.tpr}
                />
              ))}
              {idx >= 5 && <Row size="sm" selected lead={<Standing rank={player.rank} medal={medals.get(fideId)} code={player.fedCode} />} title={name} value={player.tpr ?? '–'} />}
            </Rows>
            <TextLink standalone href={boardHref} className="mt-2">Full {boardWord} race</TextLink>
          </Part>
        </div>
      </Section>
    </Page>
  );
}

/** Whole hundreds (two hundreds for a wide range) around the ratings: the line uses the height, and the ticks stay few. */
function ratingDomain(values: number[]): { min: number; max: number; ticks: number[] } {
  const step = Math.max(...values) - Math.min(...values) > 480 ? 200 : 100;
  const min = Math.floor((Math.min(...values) - step * 0.4) / step) * step;
  const max = Math.ceil((Math.max(...values) + step * 0.2) / step) * step;
  return { min, max, ticks: Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step) };
}

function Standing({ rank, medal, code }: { rank: number | null; medal?: MedalPlace; code: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex w-6 type-data text-ink-3">{medal ? <Medal rank={medal} /> : rank ?? '–'}</span>
      <Flag code={code} size="sm" decorative />
    </span>
  );
}
