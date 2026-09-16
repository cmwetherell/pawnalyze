import { cacheLife, cacheTag } from 'next/cache';
import { createKysely } from '@vercel/postgres-kysely';
import { sql } from 'kysely';

import { N_ROUNDS } from './config';
import { OUTCOME_OP } from './filters';
import type {
  HistoryPoint,
  Match,
  OlympiadEvent,
  OlympiadStatus,
  Pick,
  Player,
  Run,
  ScenarioResult,
  Team,
  TeamDetail,
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
}

const db = () => createKysely<OlympiadDatabase>();

export const tags = {
  ref: (event: OlympiadEvent) => `olympiad-2026-${event}`,
  sims: (event: OlympiadEvent) => `olympiad-2026-sims-${event}`,
  scenario: (event: OlympiadEvent) => `olympiad-2026-scenario-${event}`,
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
    .select(['team_id', 'p_gold', 'p_silver', 'p_bronze', 'p_medal', 'p_top10', 'exp_rank', 'exp_mp', 'exp_gp'])
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
    expGp: Number(r.exp_gp),
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
    map.set(id, { teamId: id, pGold: 0, pSilver: 0, pBronze: 0, pMedal: 0, pTop10: 0, expRank: 0, expMp: 0, expGp: 0 });
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

/** Latest pipeline run per rounds_completed, joined to its summary — for the odds-over-time chart. */
export async function getOlympiadSummaryHistory(event: OlympiadEvent): Promise<HistoryPoint[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.sims(event));
  const { rows } = await sql<{
    run_id: number; rounds_completed: number; team_id: number; p_gold: number; p_medal: number; p_top10: number;
  }>`
    WITH latest AS (
      SELECT DISTINCT ON (rounds_completed) run_id, rounds_completed
      FROM olympiad_2026_runs
      WHERE event = ${event} AND source = 'pipeline'
      ORDER BY rounds_completed, created_at DESC
    )
    SELECT l.run_id, l.rounds_completed, s.team_id, s.p_gold, s.p_medal, s.p_top10
    FROM latest l
    JOIN olympiad_2026_team_summary s ON s.run_id = l.run_id
    ORDER BY l.rounds_completed, s.team_id
  `.execute(db());
  return rows.map(r => ({
    runId: r.run_id,
    roundsCompleted: r.rounds_completed,
    teamId: r.team_id,
    pGold: Number(r.p_gold),
    pMedal: Number(r.p_medal),
    pTop10: Number(r.p_top10),
  }));
}

export async function getOlympiadStatus(event: OlympiadEvent): Promise<OlympiadStatus> {
  'use cache';
  cacheLife('hours');
  cacheTag(tags.ref(event));
  cacheTag(tags.sims(event));
  const [run, agg] = await Promise.all([
    getOlympiadRun(event),
    sql<{ last_final: number | null; any_live: boolean; max_round: number | null }>`
      SELECT max(round) FILTER (WHERE status = 'final')::int AS last_final,
             coalesce(bool_or(status = 'live'), false) AS any_live,
             max(round)::int AS max_round
      FROM olympiad_2026_matches WHERE event = ${event}
    `.execute(db()),
  ]);
  const row = agg.rows[0];
  const lastFinal = row?.last_final ?? 0;
  const maxRound = row?.max_round ?? 0;
  return {
    run,
    lastFinalRound: lastFinal,
    anyLive: row?.any_live ?? false,
    nextRoundPublished: maxRound > lastFinal ? maxRound : null,
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
