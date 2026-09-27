import { EVENT } from '@/lib/wcc/config';
import { exact } from '@/lib/wcc/match';
import {
  getWccGames, getWccHistory, getWccMarket, getWccPlayers, getWccRun, getWccRunAtGame, getWccSimSample, getWccSimStats, getWccSummary,
} from '@/lib/wcc/queries';
import { matchState } from '@/lib/wcc/status';
import type { WccRun, WccSummary } from '@/lib/wcc/types';
import FaceOffHero from './FaceOffHero';
import HeadToHead from './HeadToHead';
import ModelVsMarkets from './ModelVsMarkets';
import ScheduleCalendar from './ScheduleCalendar';
import WccDashboard from './WccDashboard';
import WccMethodology from './WccMethodology';
import { resolvePlayers } from './players';

/** Server-side guard: the site's TypeScript DP must reproduce the pipeline's stored summary. */
function parityCheck(run: WccRun, summary: WccSummary, state: ReturnType<typeof matchState>) {
  try {
    const fixed = new Map([...state.fixed].filter(([g]) => g <= run.afterGame));
    const tb = run.afterGame >= 14 ? state.tbFixed.slice(0, run.tbGames) : [];
    const mine = exact({ wdl: summary.wdl, fixed, g1White: run.params.g1_white ?? null, tb });
    const d = Math.abs(mine.pWin1 - summary.pWin1);
    if (d > 1e-6) {
      console.error(`[wcc] parity drift on run ${run.runId}: site p_win1=${mine.pWin1.toFixed(8)} vs stored ${summary.pWin1.toFixed(8)} (Δ=${d.toExponential(2)})`);
    }
  } catch (err) {
    console.error('[wcc] parity check failed:', err instanceof Error ? err.message : String(err));
  }
}

export default async function WccPage() {
  const [rows, games, run, market, history] = await Promise.all([
    getWccPlayers(), getWccGames(), getWccRun(), getWccMarket(), getWccHistory(),
  ]).catch((err: unknown) => {
    console.error('[wcc] data load failed:', err instanceof Error ? err.stack : JSON.stringify(err));
    throw err;
  });
  const players = resolvePlayers(rows, run);
  const state = matchState(games, run?.params.g1_white ?? null);
  const finished = state.winner !== null;

  // Once decided, the current run is degenerate (100% / 0%); show the odds from before the decisive game.
  let oddsRun = run;
  if (run && finished) {
    const frozen = state.decidedStage === 'classical' && state.decidedAt !== null
      ? await getWccRunAtGame(state.decidedAt - 1, 0)
      : await getWccRunAtGame(14, 0);
    oddsRun = frozen ?? run;
  }

  const [summary, rawSummary, simStats, simSample] = oddsRun
    ? await Promise.all([
        getWccSummary(oddsRun.runId, oddsRun.headlineVariant === 'model' ? 'model' : 'wcc'),
        getWccSummary(oddsRun.runId, 'model'),
        run ? getWccSimStats(run.runId) : Promise.resolve(null),
        run ? getWccSimSample(run.runId, 1) : Promise.resolve([]),
      ])
    : [null, null, null, []];

  if (oddsRun && summary) parityCheck(oddsRun, summary, state);

  const ratingGap = players[2].ratings.classical - players[1].ratings.classical;
  const drawRate = summary ? (summary.wdl.classical['1'][1] + summary.wdl.classical['2'][1]) / 2 : null;
  const methodology = <WccMethodology run={oddsRun} summary={summary} rawSummary={rawSummary} players={players} />;
  const h2h = <HeadToHead players={players} />;

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <FaceOffHero players={players} />
      {run && oddsRun && summary ? (
        <WccDashboard
          players={players}
          games={games}
          run={oddsRun}
          summary={summary}
          history={history}
          markets={market}
          simStats={simStats}
          simSample={simSample}
          finished={finished}
          slots={{
            markets: <ModelVsMarkets modelPWin1={summary.pWin1} players={players} stored={market} ratingGap={ratingGap} drawRate={drawRate} />,
            h2h,
            methodology,
          }}
        />
      ) : (
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pb-12 space-y-6">
          <section className="surface-card p-6 sm:p-8 text-center -mt-16 relative z-10">
            <h2 className="font-heading text-xl text-[var(--text-primary)]">Match odds are on their way</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
              Exact match probabilities, confirmed by 10,000 simulations, will appear here shortly. The match starts in {EVENT.city} on 22 November.
            </p>
          </section>
          {h2h}
          <ScheduleCalendar games={state.classical} players={players} />
          {methodology}
        </div>
      )}
    </main>
  );
}
