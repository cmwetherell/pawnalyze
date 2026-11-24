import { cacheLife, cacheTag } from 'next/cache';
import { createKysely } from '@vercel/postgres-kysely';
import { sql } from 'kysely';

import { TAGS } from './config';
import type {
  EndGameRow, GameResult, GameStatus, HalfPoints, HistoryPoint, MarketRow, MatchOdds, McCheck, ModelGrid, PlayerId,
  Prize, RunParams, ScoreRow, SimRow, SimStats, Stage, StageOdds, WccGame, WccPlayer, WccRun, WccSummary, WdlSet,
} from './types';

interface PlayersTable {
  player_id: number; name: string; short_name: string; title: string | null; fide_id: number; fed_code: string;
  is_champion: boolean; rating_classical: number; rating_rapid: number; rating_blitz: number; rating_source: string | null;
  updated_at: Date;
}
interface GamesTable {
  game_no: number; stage: string; stage_game: number; starts_at: Date | null; white_player_id: number | null;
  result: string | null; status: string; pgn: string | null; source: string | null; updated_at: Date;
}
interface RunsTable {
  run_id: number; after_game: number; tb_games: number; n_sims: number; headline_variant: string; model_version: string;
  params: RunParams; is_current: boolean; source: string; created_at: Date; notes: string | null;
}
interface SimsTable {
  run_id: number; sim_id: number; g1_white: number; classical: (number | null)[]; p1_hp: number; p2_hp: number;
  end_game: number; decided_stage: string; tb: number[]; winner: number;
}
interface SummaryTable {
  run_id: number; variant: string; p_win1: number; p_win2: number; p_tb: number;
  stages: Record<Stage, StageOdds>; end_game: EndGameRow[]; score_dist: ScoreRow[]; prize: Prize; wdl: WdlSet;
  by_colour: MatchOdds['byColour']; game_played: number[] | null; mc: McCheck | null;
}
interface GridTable {
  model_version: string; tc: string; elo_min: number; elo_step: number; n: number; wdl: number[]; smoothed: boolean; created_at: Date;
}
interface MarketTable {
  source: string; as_of: Date; p_win1: number; p_win2: number; raw: unknown; url: string | null;
}

export interface WccDatabase {
  wcc_2026_players: PlayersTable;
  wcc_2026_games: GamesTable;
  wcc_2026_runs: RunsTable;
  wcc_2026_sims: SimsTable;
  wcc_2026_summary: SummaryTable;
  wcc_2026_model_grid: GridTable;
  wcc_2026_market: MarketTable;
}

const db = () => createKysely<WccDatabase>();

/** A missing table (pipeline not deployed yet) reads as "no data" rather than an error. */
function isMissingRelation(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return code === '42P01';
}
async function orEmpty<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isMissingRelation(err)) return fallback;
    console.error(`[wcc] ${label} failed:`, err instanceof Error ? err.stack : JSON.stringify(err));
    throw err;
  }
}

const iso = (d: Date | string | null) => (d === null ? null : new Date(d).toISOString());

function toRun(r: RunsTable): WccRun {
  return {
    runId: r.run_id,
    afterGame: r.after_game,
    tbGames: r.tb_games ?? 0,
    nSims: r.n_sims,
    headlineVariant: r.headline_variant,
    modelVersion: r.model_version,
    params: r.params,
    source: r.source as WccRun['source'],
    createdAt: new Date(r.created_at).toISOString(),
    notes: r.notes,
  };
}

export async function getWccPlayers(): Promise<WccPlayer[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.ref);
  return orEmpty('players', [], async () => {
    const rows = await db().selectFrom('wcc_2026_players').selectAll().orderBy('player_id').execute();
    return rows.map(r => ({
      playerId: r.player_id as PlayerId,
      name: r.name,
      shortName: r.short_name,
      title: r.title,
      fideId: r.fide_id,
      fedCode: r.fed_code,
      isChampion: r.is_champion,
      ratings: { classical: r.rating_classical, rapid: r.rating_rapid, blitz: r.rating_blitz },
      ratingSource: r.rating_source,
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  });
}

export async function getWccGames(): Promise<WccGame[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.ref);
  return orEmpty('games', [], async () => {
    const rows = await db()
      .selectFrom('wcc_2026_games')
      .select(['game_no', 'stage', 'stage_game', 'starts_at', 'white_player_id', 'result', 'status', sql<boolean>`pgn IS NOT NULL`.as('has_pgn')])
      .orderBy('game_no')
      .execute();
    return rows.map(r => ({
      gameNo: r.game_no,
      stage: r.stage as Stage,
      stageGame: r.stage_game,
      startsAt: iso(r.starts_at),
      whitePlayerId: (r.white_player_id as PlayerId | null) ?? null,
      result: (r.result as GameResult | null) ?? null,
      status: r.status as GameStatus,
      hasPgn: Boolean(r.has_pgn),
    }));
  });
}

export async function getWccRun(): Promise<WccRun | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.sims);
  return orEmpty('run', null, async () => {
    // Local development only: point the site at a run that is not (yet) flagged current.
    const devRun = process.env.NODE_ENV !== 'production' ? Number(process.env.WCC_DEV_RUN_ID) : NaN;
    let q = db().selectFrom('wcc_2026_runs').selectAll();
    q = Number.isInteger(devRun) ? q.where('run_id', '=', devRun) : q.where('is_current', '=', true);
    const row = await q.executeTakeFirst();
    return row ? toRun(row) : null;
  });
}

function toSummary(r: SummaryTable): WccSummary {
  return {
    runId: r.run_id,
    variant: r.variant as WccSummary['variant'],
    pWin1: Number(r.p_win1),
    pWin2: Number(r.p_win2),
    pTb: Number(r.p_tb),
    stages: r.stages,
    endGame: r.end_game,
    scoreDist: r.score_dist,
    prize: r.prize,
    wdl: r.wdl,
    byColour: r.by_colour,
    gamePlayed: r.game_played ?? [],
    mc: r.mc,
  };
}

export async function getWccSummary(runId: number, variant: 'wcc' | 'model' = 'wcc'): Promise<WccSummary | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.sims);
  return orEmpty('summary', null, async () => {
    const row = await db()
      .selectFrom('wcc_2026_summary')
      .selectAll()
      .where('run_id', '=', runId)
      .where('variant', '=', variant)
      .executeTakeFirst();
    return row ? toSummary(row) : null;
  });
}

/** The headline (latest) pipeline run per match state, for the odds-over-time chart. */
export async function getWccHistory(): Promise<HistoryPoint[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.sims);
  return orEmpty('history', [], async () => {
    const { rows } = await sql<{ run_id: number; after_game: number; tb_games: number; created_at: Date; p_win1: number; p_tb: number }>`
      SELECT DISTINCT ON (r.after_game, r.tb_games) r.run_id, r.after_game, r.tb_games, r.created_at, s.p_win1, s.p_tb
      FROM wcc_2026_runs r
      JOIN wcc_2026_summary s ON s.run_id = r.run_id AND s.variant = r.headline_variant
      WHERE r.source = 'pipeline'
      ORDER BY r.after_game, r.tb_games, r.is_current DESC, r.created_at DESC
    `.execute(db());
    return rows.map(r => ({
      runId: r.run_id,
      afterGame: r.after_game,
      tbGames: r.tb_games ?? 0,
      createdAt: new Date(r.created_at).toISOString(),
      pWin1: Number(r.p_win1),
      pTb: Number(r.p_tb),
    }));
  });
}

/** The newest pipeline run after a given classical game (used to freeze the odds once decided). */
export async function getWccRunAtGame(afterGame: number, tbGames = 0): Promise<WccRun | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.sims);
  return orEmpty('run at game', null, async () => {
    const row = await db()
      .selectFrom('wcc_2026_runs')
      .selectAll()
      .where('source', '=', 'pipeline')
      .where('after_game', '=', afterGame)
      .where('tb_games', '=', tbGames)
      .orderBy('created_at', 'desc')
      .executeTakeFirst();
    return row ? toRun(row) : null;
  });
}

export async function getWccMarket(): Promise<MarketRow[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.ref);
  return orEmpty('market', [], async () => {
    const rows = await db().selectFrom('wcc_2026_market').selectAll().orderBy('as_of').execute();
    return rows.map(r => ({
      source: r.source,
      asOf: new Date(r.as_of).toISOString(),
      pWin1: Number(r.p_win1),
      pWin2: Number(r.p_win2),
      url: r.url,
      raw: r.raw,
    }));
  });
}

export async function getWccGrid(modelVersion: string): Promise<ModelGrid | null> {
  'use cache';
  cacheLife('days');
  cacheTag(TAGS.model);
  return orEmpty('grid', null, async () => {
    const row = await db()
      .selectFrom('wcc_2026_model_grid')
      .select(['model_version', 'elo_min', 'elo_step', 'n', 'wdl'])
      .where('model_version', '=', modelVersion)
      .where('tc', '=', 'all')
      .executeTakeFirst();
    if (!row) return null;
    return { modelVersion: row.model_version, eloMin: row.elo_min, eloStep: row.elo_step, n: row.n, wdl: row.wdl.map(Number) };
  });
}

function toSim(r: SimsTable): SimRow {
  return {
    simId: r.sim_id,
    g1White: r.g1_white as PlayerId,
    classical: (r.classical ?? []).map(v => (v === null ? null : (v as HalfPoints))),
    p1Hp: r.p1_hp,
    p2Hp: r.p2_hp,
    endGame: r.end_game,
    decidedStage: r.decided_stage as Stage,
    tb: (r.tb ?? []).map(v => v as HalfPoints),
    winner: r.winner as PlayerId,
  };
}

/** One stored simulation by position (0..n_sims-1) in sim_id order. */
export async function getWccSim(runId: number, index: number): Promise<SimRow | null> {
  'use cache';
  cacheLife('days');
  cacheTag(TAGS.sims);
  return orEmpty('sim', null, async () => {
    const row = await db()
      .selectFrom('wcc_2026_sims')
      .selectAll()
      .where('run_id', '=', runId)
      .orderBy('sim_id')
      .offset(Math.max(0, Math.floor(index)))
      .limit(1)
      .executeTakeFirst();
    return row ? toSim(row) : null;
  });
}

/** A small, deterministic spread of sims (every k-th row) for the replay's first deal. */
export async function getWccSimSample(runId: number, size = 12): Promise<SimRow[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.sims);
  return orEmpty('sim sample', [], async () => {
    const { rows } = await sql<SimsTable>`
      SELECT * FROM (
        SELECT *, row_number() OVER (ORDER BY sim_id) AS rn FROM wcc_2026_sims WHERE run_id = ${runId}
      ) x WHERE rn % 797 = 1 ORDER BY sim_id LIMIT ${size}
    `.execute(db());
    return rows.map(toSim);
  });
}

/** Fun facts across all stored sims of a run. */
export async function getWccSimStats(runId: number): Promise<SimStats | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAGS.sims);
  return orEmpty('sim stats', null, async () => {
    const { rows } = await sql<{
      n: number; longest_sd: number | null; max_margin: number | null; all_draws: number; to_sd: number; shutouts: number;
      mm_p1: number | null; mm_p2: number | null; mm_games: number | null;
    }>`
      WITH s AS (SELECT * FROM wcc_2026_sims WHERE run_id = ${runId}),
      mm AS (SELECT p1_hp, p2_hp, end_game FROM s ORDER BY abs(p1_hp - p2_hp) DESC, end_game ASC, sim_id LIMIT 1)
      SELECT count(*)::int AS n,
             max(CASE WHEN decided_stage = 'sd' THEN coalesce(array_length(tb, 1), 0) - 8 END)::int AS longest_sd,
             max(abs(p1_hp - p2_hp))::int AS max_margin,
             count(*) FILTER (WHERE p1_hp = 14 AND p2_hp = 14 AND array_position(classical, 0::smallint) IS NULL AND array_position(classical, 2::smallint) IS NULL)::int AS all_draws,
             count(*) FILTER (WHERE decided_stage = 'sd')::int AS to_sd,
             count(*) FILTER (WHERE least(p1_hp, p2_hp) <= 1)::int AS shutouts,
             (SELECT p1_hp FROM mm)::int AS mm_p1, (SELECT p2_hp FROM mm)::int AS mm_p2, (SELECT end_game FROM mm)::int AS mm_games
      FROM s
    `.execute(db());
    const r = rows[0];
    if (!r || r.n === 0) return null;
    return {
      n: r.n,
      longestSd: Math.max(0, r.longest_sd ?? 0),
      maxMargin: r.max_margin ?? 0,
      maxMarginScore: r.mm_p1 !== null && r.mm_p2 !== null && r.mm_games !== null ? { p1: r.mm_p1, p2: r.mm_p2, games: r.mm_games } : null,
      allDraws: r.all_draws,
      toSd: r.to_sd,
      shutouts: r.shutouts,
    };
  });
}


// ---- writes (the market snapshot cron only)

/** When the newest stored snapshot for a market source was taken (uncached). */
export async function getLastMarketAt(source: string): Promise<Date | null> {
  const row = await db()
    .selectFrom('wcc_2026_market')
    .select(sql<Date | null>`max(as_of)`.as('last'))
    .where('source', '=', source)
    .executeTakeFirst();
  return row?.last ? new Date(row.last) : null;
}

export async function insertMarketSnapshot(row: {
  source: string; asOf: Date; pWin1: number; url: string | null; raw: Record<string, unknown>;
}): Promise<void> {
  await db()
    .insertInto('wcc_2026_market')
    .values({
      source: row.source,
      as_of: row.asOf,
      p_win1: row.pWin1,
      p_win2: 1 - row.pWin1,
      url: row.url,
      // Sent as text; Postgres casts it to the column's json/jsonb type.
      raw: JSON.stringify(row.raw),
    })
    .onConflict(oc => oc.doNothing())
    .execute();
}
