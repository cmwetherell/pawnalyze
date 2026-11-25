'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { BottomBar } from '@/components/layout/BottomBar';
import { Section } from '@/components/layout/Section';
import { SectionBar } from '@/components/layout/SectionBar';
import { Callout } from '@/components/ui/Callout';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { Combobox } from '@/components/ui/Combobox';
import { CopyButton } from '@/components/ui/CopyButton';
import { Delta } from '@/components/ui/Delta';
import { EmptyState } from '@/components/ui/EmptyState';
import { Flag } from '@/components/ui/Flag';
import { PodiumStrip } from '@/components/ui/PodiumStrip';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { setUrlParam, useUrlParam } from '@/hooks/useUrlParam';
import { cachedJson } from '@/lib/olympiad/clientCache';
import { BOARD_LABELS, N_PRIZE_BOARDS, N_ROUNDS, boardLabel, playerHref } from '@/lib/olympiad/config';
import { contenders, medalPlaces } from '@/lib/olympiad/medals';
import { MIN_GAMES_FOR_PRIZE, displayName, formatScore } from '@/lib/olympiad/tpr';
import type { BoardRaceRowLite, BoardRaceSummary, BoardRows, OlympiadEvent, PlayerIndexEntry, Team } from '@/lib/olympiad/types';
import { sentenceName } from '../teams';
import { BoardLeaderboard } from './BoardLeaderboard';

interface BoardRaceDashboardProps {
  event: OlympiadEvent;
  finished: boolean;
  /** What the medals are for. */
  rule: string;
  /** `podium` holds the medal places of each board. */
  summary: BoardRaceSummary;
  /** Per board: gold changed hands in the last round. */
  newLeaders: boolean[];
  /** Board 1, rendered server-side so the first paint has a full table */
  initialRows: BoardRows;
  teams: Team[];
}

const MIN_GAMES_OPTIONS = [0, 3, 5, MIN_GAMES_FOR_PRIZE];
/** Once this has scrolled away the board switch moves into the section bar, or the bottom bar on phones. */
const CONTROL_ID = 'board-control';
const SECTIONS = [{
  label: 'Board prizes',
  items: [{ id: 'podiums', label: 'Medals' }, { id: 'race', label: 'Standings' }, { id: 'board-race-how', label: 'How it works' }],
}];

function boardUrl(event: OlympiadEvent, board: number, lastRound: number): string {
  return `/api/sims/olympiad-2026/board-race?${new URLSearchParams({ event, board: String(board), r: String(lastRound) })}`;
}

/** The team with the most places on the five podiums, when there is one. */
function topTeam(podium: BoardRaceRowLite[][]): { name: string; n: number; of: number } | null {
  const places = podium.flat();
  const count = new Map<string, number>();
  for (const p of places) count.set(p.teamName, (count.get(p.teamName) ?? 0) + 1);
  const [first, second] = [...count].sort((a, b) => b[1] - a[1]);
  return first && first[1] > 1 && first[1] > (second?.[1] ?? 0) ? { name: first[0], n: first[1], of: places.length } : null;
}

export function BoardRaceDashboard({ event, finished, rule, summary, newLeaders, initialRows, teams }: BoardRaceDashboardProps) {
  const router = useRouter();
  const over = summary.lastRound >= N_ROUNDS;
  // Once the last round is in, "can still reach eight" and "has played eight" are the same list.
  const [minGames, setMinGames] = useState(over ? MIN_GAMES_FOR_PRIZE : 0);
  const [onlyReachable, setOnlyReachable] = useState(!over && summary.lastFinalRound >= 4);
  // Fetched boards, keyed by board number; board 1 arrives with the page.
  const [loaded, setLoaded] = useState<Record<number, BoardRows>>({ [initialRows.board]: initialRows });
  const [error, setError] = useState<string | null>(null);

  const teamsById = useMemo(() => new Map(teams.map(t => [t.teamId, t])), [teams]);

  // ?board= and ?team= live in the URL (client-only; the server never reads searchParams).
  const boardParam = Number(useUrlParam('board'));
  const board = boardParam >= 1 && boardParam <= N_PRIZE_BOARDS ? boardParam : 1;
  const teamParam = Number(useUrlParam('team'));
  const teamId = teamParam && teamsById.has(teamParam) ? teamParam : null;
  const selectBoard = (b: number) => setUrlParam('board', b === 1 ? null : String(b));
  const selectTeam = (t: number | null) => setUrlParam('team', t === null ? null : String(t));

  const fetchBoard = (b: number) => cachedJson<BoardRows>(`board|${event}|${summary.lastRound}|${b}`, boardUrl(event, b, summary.lastRound));

  // Load the selected board when it is not in memory yet; warm the others when idle.
  useEffect(() => {
    let canceled = false;
    if (!loaded[board]) {
      fetchBoard(board)
        .then(rows => { if (!canceled) { setLoaded(prev => ({ ...prev, [board]: rows })); setError(null); } })
        .catch((e: unknown) => { if (!canceled) setError(e instanceof Error ? e.message : 'Could not load this board'); });
    }
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 800));
    const handle = idle(() => {
      for (let b = 1; b <= N_PRIZE_BOARDS; b++) if (b !== board && !loaded[b]) void fetchBoard(b).then(rows => { if (!canceled) setLoaded(prev => (prev[b] ? prev : { ...prev, [b]: rows })); }).catch(() => {});
    });
    return () => { canceled = true; (window.cancelIdleCallback ?? window.clearTimeout)(handle as number); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, event, summary.lastRound]);

  const boardRows = loaded[board]?.rows ?? null;
  const rows = useMemo(() => (boardRows ?? []).filter(r =>
    (teamId === null || r.teamId === teamId)
    && r.games >= minGames
    && (!onlyReachable || r.canReach),
  ), [boardRows, teamId, minGames, onlyReachable]);
  const medals = useMemo(() => medalPlaces(boardRows ?? []), [boardRows]);

  const team = teamId !== null ? teamsById.get(teamId) : null;

  const matchesPlayer = (p: PlayerIndexEntry, q: string): boolean => {
    const s = q.toLowerCase();
    const teamName = teamsById.get(p.teamId)?.name.toLowerCase() ?? '';
    return displayName(p.name).toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || teamName.includes(s) || p.fedCode.toLowerCase() === s;
  };

  if (summary.lastRound === 0) {
    return (
      <Section id="podiums" label="Board races" note={rule} rule={false} className="pt-6 md:pt-0" layout="plain">
        <EmptyState
          title="Board races start after round 1"
          body={`Performance ratings appear here as soon as the first round’s games are in. Medals need ${MIN_GAMES_FOR_PRIZE} games, so the picture settles in the second week.`}
        />
      </Section>
    );
  }

  const best = topTeam(summary.podium);
  const [first, second] = boardRows ? contenders(boardRows) : summary.podium[board - 1];
  const lead = first && second && first.tpr !== null && second.tpr !== null ? first.tpr - second.tpr : null;
  const points = (n: number) => `${n} ${n === 1 ? 'point' : 'points'}`;
  const verdict = first && (finished
    ? `${displayName(first.name)} won board gold with a performance of ${first.tpr}${second && lead !== null ? lead > 0 ? `, ${points(lead)} ahead of ${displayName(second.name)}` : `, level with ${displayName(second.name)} on rating and ahead on games` : ''}.`
    : `${displayName(first.name)} leads on ${first.tpr}${second && lead ? `, ${points(lead)} ahead of ${displayName(second.name)}` : ''}.`);

  const boardSwitch = (where: 'page' | 'bar' | 'bottom') => (
    <Segmented
      role="tablist"
      ariaLabel="Board"
      size={where === 'page' ? 'md' : 'sm'}
      full={where !== 'bar'}
      value={String(board)}
      onChange={v => selectBoard(Number(v))}
      items={BOARD_LABELS.map((label, i) => {
        const leader = summary.podium[i][0];
        return {
          value: String(i + 1), label, short: i < 4 ? `B${i + 1}` : 'Res', ariaLabel: label,
          icon: leader && where === 'page' ? <Flag code={leader.fedCode} size="xs" decorative /> : undefined,
        };
      })}
    />
  );

  return (
    <>
      <Section
        id="podiums"
        title={best ? `${sentenceName(best.name)} ${finished ? 'won' : 'holds'} ${best.n} of the ${best.of} ${finished ? 'board medals' : 'medal places'}` : finished ? 'Board medals' : 'Board leaders'}
        layout="wide"
        rule={false}
        note={rule}
        className="pt-6 md:pt-0"
      >
        <PodiumStrip
          label="Podium of each board"
          selected={String(board)}
          onSelect={k => selectBoard(Number(k))}
          columns={BOARD_LABELS.map((label, i) => ({
            key: String(i + 1),
            label,
            meta: newLeaders[i] ? 'New leader' : `${summary.ranked[i]} ranked`,
            places: [0, 1, 2].map(k => {
              const r = summary.podium[i][k];
              return r ? {
                name: displayName(r.name), flag: r.fedCode, value: r.tpr,
                title: `${displayName(r.name)} (${r.fedCode}), ${formatScore(r.score, r.games)}`,
                delta: r.rank !== null && r.prevRank !== null && <Delta value={r.rank} base={r.prevRank} unit="places" better="down" short />,
              } : null;
            }),
          }))}
        />
      </Section>

      <SectionBar
        groups={SECTIONS}
        heroId={CONTROL_ID}
        eventLabel="Board prizes"
        live={boardSwitch('bar')}
      />

      <Section
        id="race"
        title={<span id="board-table-heading">{boardLabel(board)}{finished ? '' : ' race'}</span>}
        layout="wide"
        finding={
          <>
            {verdict}{' '}
            {finished
              ? `Ranked by performance rating over ${N_ROUNDS} rounds, with a minimum of ${MIN_GAMES_FOR_PRIZE} games.`
              : `Ranked by performance rating through round ${summary.lastRound}; ${MIN_GAMES_FOR_PRIZE} games needed.`}{' '}
            Select a player for games and replays.
          </>
        }
        actions={<CopyButton kind="link" label="Copy link" variant="secondary" />}
      >
        <div id={CONTROL_ID}>{boardSwitch('page')}</div>

        <div className="mb-2 mt-4 grid grid-cols-1 items-center gap-x-6 gap-y-3 lg:grid-cols-12">
          <Combobox
            items={summary.index}
            getKey={p => p.fideId}
            match={matchesPlayer}
            onSelect={p => router.push(playerHref(event, p.fideId))}
            placeholder="Find a player"
            className="lg:col-span-4"
            renderOption={p => (
              <>
                <Flag code={p.fedCode} size="xs" decorative />
                <span className="min-w-0 flex-1 truncate">{p.title ? `${p.title} ` : ''}{displayName(p.name)}</span>
                <span className="shrink-0 type-label text-ink-3 tnum">{boardLabel(p.board)}{p.tpr !== null ? `, ${p.tpr}` : ''}</span>
              </>
            )}
          />
          <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-8 lg:justify-end">
            {team && (
              <Chip icon={<Flag code={team.fedCode} size="xs" decorative />} onClear={() => selectTeam(null)} clearLabel="Clear team filter">{team.name}</Chip>
            )}
            {!over && <Checkbox checked={onlyReachable} onChange={e => setOnlyReachable(e.target.checked)} label={`Can still reach ${MIN_GAMES_FOR_PRIZE} games`} />}
            <Segmented
              ariaLabel="Minimum games"
              size="sm"
              value={String(minGames)}
              onChange={v => setMinGames(Number(v))}
              items={MIN_GAMES_OPTIONS.map(n => ({ value: String(n), label: n === 0 ? 'All' : n === MIN_GAMES_FOR_PRIZE ? 'Eligible' : `${n}+ games` }))}
            />
          </div>
        </div>

        {boardRows ? (
          <BoardLeaderboard
            event={event} race={summary} label={`${boardLabel(board)} standings`} rows={rows} medals={medals} total={boardRows.length}
            onClearFilters={() => { setMinGames(0); setOnlyReachable(false); selectTeam(null); }}
          />
        ) : error ? (
          <Callout tone="negative" icon="error">{error}</Callout>
        ) : (
          <Skeleton kind="rounds" rows={12} label="Loading board" />
        )}
      </Section>

      <BottomBar label="Board" heroId={CONTROL_ID}>{boardSwitch('bottom')}</BottomBar>
    </>
  );
}
