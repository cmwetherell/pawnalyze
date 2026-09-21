import { cacheLife, cacheTag } from 'next/cache';
import { createKysely } from '@vercel/postgres-kysely';
import { sql } from 'kysely';

import { N_ROUNDS } from './config';
import { OUTCOME_OP } from './filters';
import { buildBoardRace, liteRow } from './race';
import { teamsInRun } from './standings';
import { parseGamePgn } from './tpr';
import type {
  BoardRace,
  BoardRows,
  Game,
  HistoryPoint,
  Match,
  OlympiadEvent,
  OpponentShare,
  OlympiadStatus,
  Pick,
  Player,
  PlayerGame,
  RoundOdds,
  Run,
  ScenarioResult,
  Team,
  TeamDetail,
  TeamOpponents,
  TeamSummary,
} from './types';

interface TeamsTable {
  event: string; team_id: number; fed_code: string; name: string; avg_rating: number; captain: string | null;
}
interface PlayersTable {
  event: string; team_id: number; board: number; name: string; title: string | null; rating: number; fide_id: number | null;
}
interface MatchesTable {
  event: string; round: number; board_no: number; team1_id: number; team2_id: number | null;
  team1_score: number | null; team2_score: number | null; status: string; updated_at: Date;
}
interface RunsTable {
  run_id: number; event: string; rounds_completed: number; n_sims: number; n_teams: number;
  source: string; is_current: boolean; created_at: Date; notes: string | null;
}
interface SimsTable {
  run_id: number; sim_id: number; gold: number; silver: number; bronze: number;
  top10: number[]; final_rank: number[]; match_points: number[]; game_points: number[]; round_scores: number[][];
  round_opps: number[][] | null;
}
interface GamesTable {
  event: string; round: number; board_no: number; board: number;
  white_team_id: number | null; black_team_id: number | null;
  white_player: string; black_player: string; white_fide_id: number | null; black_fide_id: number | null;
  white_elo: number; black_elo: number; result: string; pgn: string | null; source: string; updated_at: Date;
}
interface TeamSummaryTable {
  run_id: number; event: string; team_id: number; p_gold: number; p_silver: number; p_bronze: number;
  p_medal: number; p_top10: number; exp_rank: number; exp_mp: number; exp_gp: number;
}

export interface OlympiadDatabase {
  olympiad_2026_teams: TeamsTable;
  olympiad_2026_players: PlayersTable;
  olympiad_2026_matches: MatchesTable;
  olympiad_2026_runs: RunsTable;
  olympiad_2026_sims: SimsTable;
  olympiad_2026_team_summary: TeamSummaryTable;
  olympiad_2026_games: GamesTable;
}

const db = () => createKysely<OlympiadDatabase>();

export const tags = {
  ref: (event: OlympiadEvent) => `olympiad-2026-${event}`,
  sims: (event: OlympiadEvent) => `olympiad-2026-sims-${event}`,
  scenario: (event: OlympiadEvent) => `olympiad-2026-scenario-${event}`,
  games: (event: OlympiadEvent) => `olympiad-2026-games-${event}`,
};

function toRun(r: RunsTable): Run {
  return {
    runId: r.run_id,
    event: r.event as OlympiadEvent,
    roundsCompleted: r.rounds_completed,
    nSims: r.n_sims,
    nTeams: r.n_teams,
    source: r.source as Run['source'],
    createdAt: new Date(r.created_at).toISOString(),
    notes: r.notes,
  };
}

export async function getOlympiadTeams(event: OlympiadEvent): Promise<Team[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.ref(event));
  const rows = await db()
    .selectFrom('olympiad_2026_teams')
    .select(['team_id', 'fed_code', 'name', 'avg_rating', 'captain'])
    .where('event', '=', event)
    .orderBy('team_id')
    .execute();
  return rows.map(r => ({
    teamId: r.team_id, fedCode: r.fed_code, name: r.name, avgRating: r.avg_rating, captain: r.captain,
  }));
}

export async function getOlympiadPlayers(event: OlympiadEvent): Promise<Player[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.ref(event));
  const rows = await db()
    .selectFrom('olympiad_2026_players')
    .select(['team_id', 'board', 'name', 'title', 'rating', 'fide_id'])
    .where('event', '=', event)
    .orderBy('team_id')
    .orderBy('board')
    .execute();
  return rows.map(r => ({
    teamId: r.team_id, board: r.board, name: r.name, title: r.title, rating: r.rating, fideId: r.fide_id,
  }));
}

export async function getOlympiadMatches(event: OlympiadEvent): Promise<Match[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.ref(event));
  const rows = await db()
    .selectFrom('olympiad_2026_matches')
    .select(['round', 'board_no', 'team1_id', 'team2_id', 'team1_score', 'team2_score', 'status'])
    .where('event', '=', event)
    .orderBy('round')
    .orderBy('board_no')
    .execute();
  return rows.map(r => ({
    round: r.round,
    boardNo: r.board_no,
    team1Id: r.team1_id,
    team2Id: r.team2_id,
    team1Score: r.team1_score,
    team2Score: r.team2_score,
    status: r.status as Match['status'],
  }));
}

export async function getOlympiadRun(event: OlympiadEvent): Promise<Run | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.sims(event));
  // Local development only: point the site at a run that is not (yet) flagged current.
  const devRun = process.env.NODE_ENV !== 'production' ? Number(process.env.OLYMPIAD_DEV_RUN_ID) : NaN;
  let q = db().selectFrom('olympiad_2026_runs').selectAll().where('event', '=', event);
  q = Number.isInteger(devRun) ? q.where('run_id', '=', devRun) : q.where('is_current', '=', true);
  const row = await q.executeTakeFirst();
  return row ? toRun(row) : null;
}

export async function getOlympiadSummary(event: OlympiadEvent, runId: number): Promise<TeamSummary[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.sims(event));
  const rows = await db()
    .selectFrom('olympiad_2026_team_summary')
    .select(['team_id', 'p_gold', 'p_silver', 'p_bronze', 'p_medal', 'p_top10', 'exp_rank', 'exp_mp'])
    .where('run_id', '=', runId)
    .orderBy('p_gold', 'desc')
    .execute();
  if (rows.length === 0) return summaryFromSims(event, runId);
  return rows.map(r => ({
    teamId: r.team_id,
    pGold: Number(r.p_gold),
    pSilver: Number(r.p_silver),
    pBronze: Number(r.p_bronze),
    pMedal: Number(r.p_medal),
    pTop10: Number(r.p_top10),
    expRank: Number(r.exp_rank),
    expMp: Number(r.exp_mp),
  }));
}

/** Fallback when a run has sims but no summary rows (e.g. a dev run): aggregate the sims directly. */
async function summaryFromSims(event: OlympiadEvent, runId: number): Promise<TeamSummary[]> {
  const matches = await getOlympiadMatches(event);
  const ids = Array.from(new Set(matches.flatMap(m => (m.team2Id === null ? [m.team1Id] : [m.team1Id, m.team2Id])))).sort((a, b) => a - b);
  if (ids.length === 0) return [];
  const scenario = await getOlympiadScenario(event, runId, [], ids);
  const n = Math.max(scenario.matched, 1);
  const map = new Map<number, TeamSummary>();
  for (const id of ids) {
    map.set(id, { teamId: id, pGold: 0, pSilver: 0, pBronze: 0, pMedal: 0, pTop10: 0, expRank: 0, expMp: 0 });
  }
  for (const r of scenario.ranks) {
    const row = map.get(r.teamId);
    if (!row) continue;
    const p = r.n / n;
    if (r.rank === 1) row.pGold += p;
    if (r.rank === 2) row.pSilver += p;
    if (r.rank === 3) row.pBronze += p;
    if (r.rank <= 3) row.pMedal += p;
    if (r.rank <= 10) row.pTop10 += p;
  }
  for (const t of scenario.teams) {
    const row = map.get(t.teamId);
    if (row) { row.expRank = t.expRank; row.expMp = t.expMp; }
  }
  return Array.from(map.values()).sort((a, b) => b.pGold - a.pGold);
}

/**
 * Chess-results renumbers every seed when a team withdraws, so team_ids can differ between runs with
 * different n_teams. Completed rounds are stored with their actual scores in every sim row, so aligning
 * an old run's scores against the current run's (same pipeline, same conventions for forfeits and byes)
 * recovers the mapping old team_id -> current team_id. Whichever numbering has more teams may skip
 * exactly the surplus; a team appended at the end (a late scrape pickup) maps as the identity.
 * Returns null when it can't be done safely.
 */
async function numberingMap(
  runId: number,
  roundsCompleted: number,
  nTeamsOld: number,
  nTeamsCur: number,
  curScores: number[][],   // current run's actual scores, [round][team - 1], at least roundsCompleted rounds
): Promise<Map<number, number> | null> {
  if (roundsCompleted === 0 || nTeamsOld === nTeamsCur) return null;
  const { rows } = await sql<{ scores: number[][] | null }>`
    SELECT round_scores[1:${sql.lit(roundsCompleted)}][1:${sql.lit(nTeamsOld)}] AS scores
    FROM olympiad_2026_sims WHERE run_id = ${runId} ORDER BY sim_id LIMIT 1
  `.execute(db());
  const old = rows[0]?.scores;
  if (!old) return null;
  const oldVec = (t: number) => old.map(r => r[t - 1]);
  const curVec = (t: number) => curScores.slice(0, roundsCompleted).map(r => r[t - 1]);
  const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

  const map = new Map<number, number>();
  const slack = Math.abs(nTeamsOld - nTeamsCur);
  let skipped = 0;
  let o = 1;
  let c = 1;
  while (o <= nTeamsOld && c <= nTeamsCur) {
    if (same(oldVec(o), curVec(c))) {
      map.set(o, c);
      o += 1;
      c += 1;
    } else if (nTeamsOld > nTeamsCur) {
      o += 1; // team withdrawn since the old run
      skipped += 1;
    } else {
      c += 1; // team added since the old run
      skipped += 1;
    }
    if (skipped > slack) return null; // alignment failed
  }
  skipped += (nTeamsOld - o + 1) + (nTeamsCur - c + 1);
  return skipped === slack ? map : null;
}

/**
 * Latest pipeline run per rounds_completed, joined to its summary — for the odds-over-time chart.
 * Runs made under an older team numbering are translated to the current numbering (see numberingMap);
 * runs that cannot be translated are left out rather than mis-attributed.
 */
export async function getOlympiadSummaryHistory(event: OlympiadEvent): Promise<HistoryPoint[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.sims(event));
  const current = await getOlympiadRun(event);
  if (!current) return [];

  const { rows } = await sql<{
    run_id: number; rounds_completed: number; n_teams: number; team_id: number; p_gold: number; p_medal: number; p_top10: number;
  }>`
    WITH latest AS (
      SELECT DISTINCT ON (rounds_completed) run_id, rounds_completed, n_teams
      FROM olympiad_2026_runs r
      WHERE event = ${event} AND source = 'pipeline' AND rounds_completed <= ${current.roundsCompleted}
        AND EXISTS (SELECT 1 FROM olympiad_2026_team_summary s WHERE s.run_id = r.run_id)
      ORDER BY rounds_completed, (run_id = ${current.runId}) DESC, created_at DESC
    )
    SELECT l.run_id, l.rounds_completed, l.n_teams, s.team_id, s.p_gold, s.p_medal, s.p_top10
    FROM latest l
    JOIN olympiad_2026_team_summary s ON s.run_id = l.run_id
    ORDER BY l.rounds_completed, s.team_id
  `.execute(db());
  if (rows.length === 0) return [];

  // One mapping per distinct old numbering (n_teams), derived from the run with the most completed rounds.
  const runsByN = new Map<number, { runId: number; roundsCompleted: number }[]>();
  for (const r of rows) {
    if (r.n_teams === current.nTeams) continue;
    const list = runsByN.get(r.n_teams) ?? [];
    if (!list.some(x => x.runId === r.run_id)) list.push({ runId: r.run_id, roundsCompleted: r.rounds_completed });
    runsByN.set(r.n_teams, list);
  }
  const maps = new Map<number, Map<number, number> | null>();
  if (runsByN.size > 0) {
    // Current numbering's actual scores per completed round, from the current run's own sims.
    const { rows: cur } = await sql<{ scores: number[][] | null }>`
      SELECT round_scores[1:${sql.lit(Math.max(current.roundsCompleted, 1))}][1:${sql.lit(current.nTeams)}] AS scores
      FROM olympiad_2026_sims WHERE run_id = ${current.runId} ORDER BY sim_id LIMIT 1
    `.execute(db());
    const curScores = cur[0]?.scores ?? [];
    for (const [n, list] of runsByN) {
      const best = [...list].sort((a, b) => b.roundsCompleted - a.roundsCompleted)[0];
      maps.set(n, await numberingMap(best.runId, best.roundsCompleted, n, current.nTeams, curScores));
    }
  }

  const out: HistoryPoint[] = [];
  for (const r of rows) {
    let teamId = r.team_id;
    if (r.n_teams !== current.nTeams) {
      const m = maps.get(r.n_teams);
      if (!m) continue;
      const mapped = m.get(r.team_id);
      if (mapped === undefined) continue;
      teamId = mapped;
    }
    out.push({
      runId: r.run_id,
      roundsCompleted: r.rounds_completed,
      teamId,
      pGold: Number(r.p_gold),
      pMedal: Number(r.p_medal),
      pTop10: Number(r.p_top10),
    });
  }
  return out;
}

export async function getOlympiadStatus(event: OlympiadEvent): Promise<OlympiadStatus> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.ref(event));
  cacheTag(tags.sims(event));
  const [run, agg] = await Promise.all([
    getOlympiadRun(event),
    sql<{ last_final: number | null; any_live: boolean }>`
      SELECT max(round) FILTER (WHERE status = 'final')::int AS last_final,
             coalesce(bool_or(status = 'live'), false) AS any_live
      FROM olympiad_2026_matches WHERE event = ${event}
    `.execute(db()),
  ]);
  const row = agg.rows[0];
  return {
    run,
    lastFinalRound: row?.last_final ?? 0,
    anyLive: row?.any_live ?? false,
  };
}

function predicates(picks: Pick[]) {
  return picks.map(p =>
    sql`round_scores[${sql.lit(p.round)}][${sql.lit(p.teamId)}] ${sql.raw(OUTCOME_OP[p.outcome])} 4`,
  );
}

/**
 * Conditional medal / top-10 odds for all teams plus expected rank & MP for `teamIds`,
 * over the simulations matching every pick. Picks must already be validated.
 * Two independent statements (no shared CTE): a materialized CTE gets re-scanned once per
 * team id, which is far slower than a second sequential scan.
 */
export async function getOlympiadScenario(
  event: OlympiadEvent,
  runId: number,
  picks: Pick[],
  teamIds: number[],
): Promise<ScenarioResult> {
  'use cache';
  cacheLife('days');
  cacheTag(tags.scenario(event));

  const where = picks.length ? sql`AND ${sql.join(predicates(picks), sql` AND `)}` : sql``;
  const ids = Array.from(new Set(teamIds)).slice(0, 40);

  const ranksQ = sql<{ matched: number; team_id: number; rank: number; n: number }>`
    SELECT (SELECT count(*)::int FROM olympiad_2026_sims WHERE run_id = ${runId} ${where}) AS matched,
           u.team_id, u.rank, count(*)::int AS n
    FROM olympiad_2026_sims m, unnest(m.top10) WITH ORDINALITY AS u(team_id, rank)
    WHERE m.run_id = ${runId} ${where}
    GROUP BY u.team_id, u.rank
  `.execute(db());

  const subQ = ids.length
    ? sql<{ team_id: number; exp_rank: number | null; exp_mp: number | null }>`
        SELECT t.id AS team_id,
               avg(s.final_rank[t.id])::real AS exp_rank,
               avg(s.match_points[t.id])::real AS exp_mp
        FROM olympiad_2026_sims s, unnest(${ids}::int[]) AS t(id)
        WHERE s.run_id = ${runId} ${where}
        GROUP BY t.id
      `.execute(db())
    : Promise.resolve({ rows: [] as { team_id: number; exp_rank: number | null; exp_mp: number | null }[] });

  const [ranks, sub] = await Promise.all([ranksQ, subQ]);
  let matched = ranks.rows[0]?.matched;
  if (matched === undefined) {
    const { rows } = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM olympiad_2026_sims WHERE run_id = ${runId} ${where}
    `.execute(db());
    matched = rows[0]?.n ?? 0;
  }

  return {
    runId,
    matched,
    ranks: ranks.rows.map(r => ({ teamId: r.team_id, rank: Number(r.rank), n: r.n })),
    teams: sub.rows
      .filter(t => t.exp_rank !== null && t.exp_mp !== null)
      .map(t => ({ teamId: t.team_id, expRank: Number(t.exp_rank), expMp: Number(t.exp_mp) })),
  };
}

/** Final-rank histogram and per-remaining-round W/D/L odds for one team under the given picks. */
export async function getOlympiadTeamDetail(
  event: OlympiadEvent,
  runId: number,
  teamId: number,
  fromRound: number,
  picks: Pick[],
): Promise<TeamDetail> {
  'use cache';
  cacheLife('days');
  cacheTag(tags.scenario(event));

  const where = picks.length ? sql`AND ${sql.join(predicates(picks), sql` AND `)}` : sql``;
  const t = sql.lit(teamId);
  const from = Math.min(Math.max(fromRound, 1), N_ROUNDS + 1);

  // Slice the team's column out of round_scores per row so the big array is never materialized.
  const { rows } = await sql<{
    total: number;
    rank_dist: { rank: number; n: number }[];
    round_odds: { round: number; w: number; d: number; l: number }[];
  }>`
    WITH m AS (
      SELECT final_rank[${t}] AS rk,
             round_scores[${sql.lit(from)}:${sql.lit(N_ROUNDS)}][${t}:${t}] AS rs
      FROM olympiad_2026_sims
      WHERE run_id = ${runId} ${where}
    )
    SELECT (SELECT count(*)::int FROM m) AS total,
           (SELECT coalesce(json_agg(json_build_object('rank', rk, 'n', n) ORDER BY rk), '[]'::json)
              FROM (SELECT rk, count(*)::int AS n FROM m GROUP BY 1) x) AS rank_dist,
           (SELECT coalesce(json_agg(json_build_object('round', r, 'w', w, 'd', d, 'l', l) ORDER BY r), '[]'::json)
              FROM (
                SELECT u.r + ${sql.lit(from - 1)} AS r,
                       count(*) FILTER (WHERE u.v > 4)::int AS w,
                       count(*) FILTER (WHERE u.v = 4)::int AS d,
                       count(*) FILTER (WHERE u.v < 4)::int AS l
                FROM m, unnest(m.rs) WITH ORDINALITY AS u(v, r)
                GROUP BY u.r
              ) y) AS round_odds
  `.execute(db());

  const row = rows[0];
  return {
    total: row?.total ?? 0,
    rankDist: (row?.rank_dist ?? []).map(d => ({ rank: Number(d.rank), n: d.n })),
    roundOdds: (row?.round_odds ?? []).map(o => ({ round: Number(o.round), w: o.w, d: o.d, l: o.l })),
  };
}

/**
 * The engine's pairing for `round` when it is identical across every simulation (the round right after
 * rounds_completed, before chess-results publishes it). Returns [] when round_opps is missing or varies.
 */
export async function getOlympiadProjectedPairings(
  event: OlympiadEvent,
  runId: number,
  round: number,
  nTeams: number,
): Promise<Match[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.sims(event));
  if (round < 1 || round > N_ROUNDS) return [];
  const r = sql.lit(round);
  const n = sql.lit(nTeams);
  const { rows } = await sql<{ distinct_pairings: number; opps: number[][] | null }>`
    SELECT (SELECT count(DISTINCT round_opps[${r}:${r}][1:${n}])::int
              FROM olympiad_2026_sims WHERE run_id = ${runId} AND sim_id < 500) AS distinct_pairings,
           (SELECT round_opps[${r}:${r}][1:${n}] FROM olympiad_2026_sims
              WHERE run_id = ${runId} AND round_opps IS NOT NULL ORDER BY sim_id LIMIT 1) AS opps
  `.execute(db());
  const row = rows[0];
  const opps = row?.opps?.[0];
  if (!row || row.distinct_pairings !== 1 || !opps) return [];
  const matches: Match[] = [];
  opps.forEach((opp, i) => {
    const teamId = i + 1;
    if (opp > 0 && teamId < opp) {
      matches.push({
        round, boardNo: matches.length + 1, team1Id: teamId, team2Id: opp,
        team1Score: null, team2Score: null, status: 'scheduled', projected: true,
      });
    }
  });
  return matches;
}

/** Likely opponents for one team: next round, and the round after split by the next-round result. */
export async function getOlympiadTeamOpponents(
  event: OlympiadEvent,
  runId: number,
  teamId: number,
  nextRound: number,
  picks: Pick[],
): Promise<TeamOpponents> {
  'use cache';
  cacheLife('days');
  cacheTag(tags.scenario(event));

  const empty: TeamOpponents = {
    available: false, total: 0, nextRound: null, next: [], followingRound: null,
    following: { all: [], w: [], d: [], l: [] }, outcomeCounts: { w: 0, d: 0, l: 0 },
  };
  if (nextRound < 1 || nextRound > N_ROUNDS) return empty;

  const where = picks.length ? sql`AND ${sql.join(predicates(picks), sql` AND `)}` : sql``;
  const t = sql.lit(teamId);
  const r0 = sql.lit(nextRound);
  const hasFollowing = nextRound + 1 <= N_ROUNDS;
  const o1 = hasFollowing ? sql`round_opps[${sql.lit(nextRound + 1)}][${t}]` : sql`0`;

  const { rows } = await sql<{ o0: number; s0: number; o1: number; n: number }>`
    SELECT round_opps[${r0}][${t}] AS o0, round_scores[${r0}][${t}] AS s0, ${o1} AS o1, count(*)::int AS n
    FROM olympiad_2026_sims
    WHERE run_id = ${runId} AND round_opps IS NOT NULL ${where}
    GROUP BY 1, 2, 3
  `.execute(db());
  if (rows.length === 0) return empty;

  const add = (map: Map<number, number>, id: number, n: number) => map.set(id, (map.get(id) ?? 0) + n);
  const toShares = (map: Map<number, number>): OpponentShare[] =>
    Array.from(map.entries()).map(([teamId, n]) => ({ teamId, n })).sort((a, b) => b.n - a.n);

  const next = new Map<number, number>();
  const all = new Map<number, number>();
  const byOutcome = { w: new Map<number, number>(), d: new Map<number, number>(), l: new Map<number, number>() };
  const outcomeCounts = { w: 0, d: 0, l: 0 };
  let total = 0;
  for (const row of rows) {
    total += row.n;
    add(next, row.o0, row.n);
    if (hasFollowing) add(all, row.o1, row.n);
    const key = row.s0 > 4 ? 'w' : row.s0 === 4 ? 'd' : 'l';
    outcomeCounts[key] += row.n;
    if (hasFollowing) add(byOutcome[key], row.o1, row.n);
  }
  return {
    available: true,
    total,
    nextRound,
    next: toShares(next),
    followingRound: hasFollowing ? nextRound + 1 : null,
    following: { all: toShares(all), w: toShares(byOutcome.w), d: toShares(byOutcome.d), l: toShares(byOutcome.l) },
    outcomeCounts,
  };
}

/** Model win/draw/loss counts for every team in `round`, optionally conditioned on picks. One pass over the run. */
export async function getOlympiadRoundOdds(
  event: OlympiadEvent,
  runId: number,
  round: number,
  nTeams: number,
  picks: Pick[],
): Promise<RoundOdds> {
  'use cache';
  cacheLife('days');
  cacheTag(tags.scenario(event));

  const empty: RoundOdds = { round, total: 0, teams: {} };
  if (round < 1 || round > N_ROUNDS) return empty;
  const where = picks.length ? sql`AND ${sql.join(predicates(picks), sql` AND `)}` : sql``;
  const r = sql.lit(round);
  const n = sql.lit(nTeams);

  const { rows } = await sql<{ team_id: number; w: number; d: number; l: number }>`
    SELECT u.tid::int AS team_id,
           count(*) FILTER (WHERE u.v > 4)::int AS w,
           count(*) FILTER (WHERE u.v = 4)::int AS d,
           count(*) FILTER (WHERE u.v < 4)::int AS l
    FROM olympiad_2026_sims m, unnest(m.round_scores[${r}:${r}][1:${n}]) WITH ORDINALITY AS u(v, tid)
    WHERE m.run_id = ${runId} ${where}
    GROUP BY u.tid
  `.execute(db());

  const teams: RoundOdds['teams'] = {};
  let total = 0;
  for (const row of rows) {
    teams[row.team_id] = { w: row.w, d: row.d, l: row.l };
    total = Math.max(total, row.w + row.d + row.l);
  }
  return { round, total, teams };
}

// ---- Board-prize race

function scoreFor(result: string, colour: 'w' | 'b'): 0 | 0.5 | 1 | null {
  if (result === '1/2-1/2') return 0.5;
  if (result === '1-0') return colour === 'w' ? 1 : 0;
  if (result === '0-1') return colour === 'w' ? 0 : 1;
  return null;
}

/** Every finished board game of the event, without moves. */
export async function getOlympiadGames(event: OlympiadEvent): Promise<Game[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.games(event));
  const rows = await db()
    .selectFrom('olympiad_2026_games')
    .select(['round', 'board_no', 'board', 'white_fide_id', 'black_fide_id', 'white_player', 'black_player', 'white_elo', 'black_elo', 'result'])
    .where('event', '=', event)
    .orderBy('round')
    .orderBy('board_no')
    .orderBy('board')
    .execute();
  return rows.map(r => ({
    round: r.round, boardNo: r.board_no, board: r.board,
    whiteFideId: r.white_fide_id, blackFideId: r.black_fide_id,
    whiteName: r.white_player, blackName: r.black_player,
    whiteElo: r.white_elo, blackElo: r.black_elo,
    result: r.result as Game['result'],
  }));
}

/** Per-board TPR leaderboards for the individual medals, keyed by FIDE id (stable across seed renumbering). */
export async function getOlympiadBoardRace(event: OlympiadEvent): Promise<BoardRace> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.games(event));
  cacheTag(tags.ref(event));
  const [games, players, teams, run, status] = await Promise.all([
    getOlympiadGames(event), getOlympiadPlayers(event), getOlympiadTeams(event), getOlympiadRun(event), getOlympiadStatus(event),
  ]);
  return buildBoardRace(event, games, players, teamsInRun(teams, run), status.lastFinalRound);
}

/** One player's games with moves (a handful of rows, so the PGN column is fine here). */
export async function getOlympiadPlayerGames(event: OlympiadEvent, fideId: number): Promise<PlayerGame[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.games(event));
  const rows = await db()
    .selectFrom('olympiad_2026_games')
    .select(['round', 'board_no', 'white_fide_id', 'black_fide_id', 'white_player', 'black_player', 'white_elo', 'black_elo', 'result', 'pgn'])
    .where('event', '=', event)
    .where(eb => eb.or([eb('white_fide_id', '=', fideId), eb('black_fide_id', '=', fideId)]))
    .orderBy('round')
    .execute();
  return rows.map(r => {
    const colour: 'w' | 'b' = r.white_fide_id === fideId ? 'w' : 'b';
    const own = colour === 'w';
    return {
      round: r.round,
      boardNo: r.board_no,
      colour,
      ownRating: own ? r.white_elo : r.black_elo,
      oppFideId: own ? r.black_fide_id : r.white_fide_id,
      oppName: own ? r.black_player : r.white_player,
      oppRating: own ? r.black_elo : r.white_elo,
      result: r.result as PlayerGame['result'],
      score: scoreFor(r.result, colour),
      moves: parseGamePgn(r.pgn).moves,
    };
  });
}

/** One board's leaderboard rows, ready for the client (no per-round arrays). */
export async function getOlympiadBoardRows(event: OlympiadEvent, board: number): Promise<BoardRows> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.games(event));
  cacheTag(tags.ref(event));
  const race = await getOlympiadBoardRace(event);
  return { board, lastRound: race.lastRound, rows: (race.boards[board - 1] ?? []).map(liteRow) };
}
