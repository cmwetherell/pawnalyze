'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import BoardLeaderboard from './BoardLeaderboard';
import PodiumStrip from './PodiumStrip';
import Combobox from '@/components/ui/Combobox';
import CopyLink from '@/components/ui/CopyLink';
import Flag from '@/components/ui/Flag';
import { SkeletonRounds } from '@/components/ui/Skeleton';
import { setUrlParam, useUrlParam } from '@/hooks/useUrlParam';
import { BOARD_LABELS, N_PRIZE_BOARDS, boardLabel, playerHref } from '@/lib/olympiad/config';
import { cachedJson } from '@/lib/olympiad/clientCache';
import { MIN_GAMES_FOR_PRIZE, displayName } from '@/lib/olympiad/tpr';
import type { BoardRaceSummary, BoardRows, OlympiadEvent, PlayerIndexEntry, Team } from '@/lib/olympiad/types';

interface BoardRaceDashboardProps {
  event: OlympiadEvent;
  summary: BoardRaceSummary;
  /** Board 1, rendered server-side so the first paint has a full table */
  initialRows: BoardRows;
  teams: Team[];
}

const MIN_GAMES_OPTIONS = [0, 3, 5, MIN_GAMES_FOR_PRIZE];

function boardUrl(event: OlympiadEvent, board: number, lastRound: number): string {
  return `/api/sims/olympiad-2026/board-race?${new URLSearchParams({ event, board: String(board), r: String(lastRound) })}`;
}

export default function BoardRaceDashboard({ event, summary, initialRows, teams }: BoardRaceDashboardProps) {
  const router = useRouter();
  const [minGames, setMinGames] = useState(0);
  const [onlyReachable, setOnlyReachable] = useState(summary.lastFinalRound >= 4);
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
    let cancelled = false;
    if (!loaded[board]) {
      fetchBoard(board)
        .then(rows => { if (!cancelled) { setLoaded(prev => ({ ...prev, [board]: rows })); setError(null); } })
        .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load this board'); });
    }
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 800));
    const handle = idle(() => {
      for (let b = 1; b <= N_PRIZE_BOARDS; b++) if (b !== board && !loaded[b]) void fetchBoard(b).then(rows => { if (!cancelled) setLoaded(prev => (prev[b] ? prev : { ...prev, [b]: rows })); }).catch(() => {});
    });
    return () => { cancelled = true; (window.cancelIdleCallback ?? window.clearTimeout)(handle as number); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, event, summary.lastRound]);

  const boardRows = loaded[board]?.rows ?? null;
  const rows = useMemo(() => (boardRows ?? []).filter(r =>
    (teamId === null || r.teamId === teamId)
    && r.games >= minGames
    && (!onlyReachable || r.canReach),
  ), [boardRows, teamId, minGames, onlyReachable]);

  const team = teamId !== null ? teamsById.get(teamId) : null;

  const matchesPlayer = (p: PlayerIndexEntry, q: string): boolean => {
    const s = q.toLowerCase();
    const teamName = teamsById.get(p.teamId)?.name.toLowerCase() ?? '';
    return displayName(p.name).toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || teamName.includes(s) || p.fedCode.toLowerCase() === s;
  };

  if (summary.lastRound === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <h2 className="font-heading text-lg text-[var(--text-primary)]">Board races start after round 1</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
          Performance ratings appear here as soon as the first round’s games are in. Medals need {MIN_GAMES_FOR_PRIZE} games, so the picture settles in the second week.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PodiumStrip race={summary} selected={board} onSelect={selectBoard} />

      <div className="sticky top-14 z-20 -mx-4 px-4 py-2 bg-[var(--bg-base)]/90 backdrop-blur sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-0">
        <div role="tablist" aria-label="Board" className="grid grid-cols-5 rounded-lg bg-[var(--bg-surface-2)] p-0.5 text-xs">
          {BOARD_LABELS.map((label, i) => {
            const leader = summary.podium[i][0];
            const active = board === i + 1;
            return (
              <button
                key={label}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => selectBoard(i + 1)}
                onMouseEnter={() => { if (!loaded[i + 1]) void fetchBoard(i + 1).catch(() => {}); }}
                className={`h-10 rounded-md font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${
                  active ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span className="sm:hidden">{i < 4 ? `B${i + 1}` : 'Res'}</span>
                <span className="hidden sm:inline">{label}</span>
                {leader && <Flag code={leader.fedCode} size="xs" className="!ring-0 hidden sm:inline-block" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      <section className="surface-card overflow-hidden" aria-labelledby="board-table-heading">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 pt-4 pb-3">
          <div>
            <h2 id="board-table-heading" className="text-xl font-heading text-[var(--text-primary)]">{boardLabel(board)} race</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Ranked by performance rating through round {summary.lastRound} · {MIN_GAMES_FOR_PRIZE} games needed · tap a player for games and replays
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Combobox
              items={summary.index}
              getKey={p => p.fideId}
              match={matchesPlayer}
              onSelect={p => router.push(playerHref(event, p.fideId))}
              placeholder="Find a player…"
              className="flex-1 sm:w-64"
              inputClassName="h-10"
              renderOption={p => (
                <>
                  <Flag code={p.fedCode} size="xs" aria-hidden />
                  <span className="truncate flex-1">{p.title && <span className="text-gold-ink text-[11px] font-semibold mr-1">{p.title}</span>}{p.title ? ' ' : ''}{displayName(p.name)}</span>
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums">{boardLabel(p.board)}{p.tpr !== null ? ` · ${p.tpr}` : ''}</span>
                </>
              )}
            />
            <CopyLink className="hidden sm:inline-flex" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 pb-3 text-xs">
          <div role="group" aria-label="Minimum games" className="inline-flex rounded-md bg-[var(--bg-surface-2)] p-0.5">
            {MIN_GAMES_OPTIONS.map(n => (
              <button
                key={n}
                type="button"
                aria-pressed={minGames === n}
                onClick={() => setMinGames(n)}
                className={`h-9 px-2.5 rounded font-medium ${minGames === n ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                {n === 0 ? 'All' : n === MIN_GAMES_FOR_PRIZE ? 'Eligible' : `${n}+ games`}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 h-9 px-2 rounded-md text-[var(--text-secondary)] cursor-pointer select-none">
            <input type="checkbox" checked={onlyReachable} onChange={e => setOnlyReachable(e.target.checked)} className="accent-[#C9A84C]" />
            Can still reach {MIN_GAMES_FOR_PRIZE} games
          </label>
          {team && (
            <button type="button" onClick={() => selectTeam(null)} className="inline-flex items-center gap-1.5 h-9 pl-2 pr-2.5 rounded-full border border-chess-gold/40 bg-chess-gold/10 text-[var(--text-primary)]">
              <Flag code={team.fedCode} size="xs" className="!ring-0" aria-hidden />
              {team.name}
              <span aria-hidden className="text-[var(--text-muted)]">×</span>
              <span className="sr-only">Clear team filter</span>
            </button>
          )}
        </div>

        {boardRows ? (
          <BoardLeaderboard event={event} race={summary} rows={rows} total={boardRows.length} />
        ) : error ? (
          <p className="px-4 sm:px-6 py-8 text-sm text-rose-400 text-center" role="alert">{error}</p>
        ) : (
          <div className="px-4 sm:px-6 py-4" aria-busy="true" aria-label="Loading board"><SkeletonRounds rows={12} /></div>
        )}
      </section>
    </div>
  );
}
