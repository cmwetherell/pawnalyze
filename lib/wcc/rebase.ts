/**
 * Re-base a pipeline run onto the match-start ratings (config MATCH_RATINGS).
 *
 * The stored W/D/L come from the ratings the run was computed with. When those differ from
 * MATCH_RATINGS, each raw triplet is moved by the model grid's difference
 * grid(new ratings) − grid(run ratings), per time control, and re-calibrated with the run's θ: the
 * same method as the what-if lab. The match odds are then recomputed exactly at the run's own match
 * state. When the run already uses MATCH_RATINGS, nothing changes, so a new pipeline run with these
 * ratings takes over automatically.
 */
import { MATCH_RATING_SOURCE, MATCH_RATINGS } from './config';
import { exact } from './match';
import { add, calibrate, lookup, uncalibrate } from './model';
import { getWccGrid } from './queries';
import type { MatchState } from './status';
import type { ModelGrid, PlayerKey, RunRatings, TimeControl, WccRun, WccSummary, WdlByWhite, WdlSet } from './types';

const TCS: TimeControl[] = ['classical', 'rapid', 'blitz'];
const KEY: Record<TimeControl, keyof RunRatings> = { classical: 'c', rapid: 'r', blitz: 'b' };
const PLAYERS: PlayerKey[] = ['1', '2'];

export function usesMatchRatings(run: WccRun): boolean {
  return PLAYERS.every(p => (['c', 'r', 'b'] as const).every(k => Number(run.params.ratings?.[p]?.[k]) === MATCH_RATINGS[p][k]));
}

function shiftWdl(wdl: WdlSet, from: Record<PlayerKey, RunRatings>, grid: ModelGrid, theta: Record<TimeControl, number>): WdlSet {
  const out = {} as WdlSet;
  for (const tc of TCS) {
    const k = KEY[tc];
    const byWhite = {} as WdlByWhite;
    for (const white of PLAYERS) {
      const black: PlayerKey = white === '1' ? '2' : '1';
      const raw = uncalibrate(wdl[tc][white], theta[tc]);
      const moved = add(
        raw,
        lookup(grid, MATCH_RATINGS[white][k], MATCH_RATINGS[black][k]),
        lookup(grid, from[white][k], from[black][k]),
      );
      byWhite[white] = calibrate(moved, theta[tc]);
    }
    out[tc] = byWhite;
  }
  return out;
}

function rebaseSummary(s: WccSummary, run: WccRun, state: MatchState, grid: ModelGrid): WccSummary {
  // The 'model' variant is the raw model (θ = 1); 'wcc' is calibrated with the run's θ.
  const theta = s.variant === 'model'
    ? { classical: 1, rapid: 1, blitz: 1 }
    : { classical: run.params.theta?.classical ?? 1, rapid: run.params.theta?.rapid ?? 1, blitz: run.params.theta?.blitz ?? 1 };
  const wdl = shiftWdl(s.wdl, run.params.ratings, grid, theta);
  const fixed = new Map([...state.fixed].filter(([g]) => g <= run.afterGame));
  const tb = run.afterGame >= 14 ? state.tbFixed.slice(0, run.tbGames) : [];
  const odds = exact({ wdl, fixed, g1White: run.params.g1_white ?? null, tb });
  // The simulation cross-check belongs to the stored ratings, so it no longer applies.
  return { ...s, ...odds, wdl, mc: null };
}

/**
 * The run and its summaries at the match-start ratings. Returns them unchanged if the run already
 * uses those ratings, or if the model grid is unavailable (logged).
 */
export async function withMatchRatings<T extends (WccSummary | null)[]>(
  run: WccRun,
  summaries: [...T],
  state: MatchState,
): Promise<{ run: WccRun; summaries: T }> {
  if (usesMatchRatings(run)) return { run, summaries: summaries as T };
  let grid: ModelGrid | null = null;
  try {
    grid = await getWccGrid(run.modelVersion);
  } catch (err) {
    console.error('[wcc] rating grid load failed:', err instanceof Error ? err.message : String(err));
  }
  if (!grid) {
    console.warn(`[wcc] run ${run.runId} uses other ratings than MATCH_RATINGS and no grid for ${run.modelVersion}; showing stored odds`);
    return { run, summaries: summaries as T };
  }
  return rebaseWith(run, summaries, state, grid);
}

/** The pure step of withMatchRatings, given the model grid. */
export function rebaseWith<T extends (WccSummary | null)[]>(
  run: WccRun,
  summaries: [...T],
  state: MatchState,
  grid: ModelGrid,
): { run: WccRun; summaries: T } {
  if (usesMatchRatings(run)) return { run, summaries: summaries as T };
  const rebasedRun: WccRun = {
    ...run,
    params: { ...run.params, ratings: MATCH_RATINGS, rating_source: MATCH_RATING_SOURCE },
    rebasedFrom: run.params.ratings,
  };
  return {
    run: rebasedRun,
    summaries: summaries.map(s => (s ? rebaseSummary(s, run, state, grid) : s)) as T,
  };
}
