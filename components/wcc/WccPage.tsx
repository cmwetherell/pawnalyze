import { Container } from '@/components/layout/Container';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Section } from '@/components/layout/Section';
import { FaceOff } from '@/components/chess/FaceOff';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PhotoCreditLine } from '@/components/ui/PhotoCredit';
import { EVENT, WCC_HREF } from '@/lib/wcc/config';
import { exact } from '@/lib/wcc/match';
import {
  getWccGames, getWccHistory, getWccMarket, getWccPlayers, getWccRun, getWccRunAtGame, getWccSummary,
} from '@/lib/wcc/queries';
import { TB_SLOT, latestQuote, quoteSlot } from '@/lib/wcc/quotes';
import { withMatchRatings } from '@/lib/wcc/rebase';
import { currentOdds, matchState } from '@/lib/wcc/status';
import type { WccRun, WccSummary } from '@/lib/wcc/types';
import HeadToHead from './HeadToHead';
import { MatchScore, NextGame, scoreLabel } from './MatchNow';
import ModelVsMarkets from './ModelVsMarkets';
import { Schedule } from './Schedule';
import WccDashboard from './WccDashboard';
import WccMethodology from './WccMethodology';
import { FACE_OFF_CHANGES, FACE_OFF_PHOTOS, faceOffSides, resolvePlayers } from './players';

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
  const [rows, games, run, market, storedHistory] = await Promise.all([
    getWccPlayers(), getWccGames(), getWccRun(), getWccMarket(), getWccHistory(),
  ]).catch((err: unknown) => {
    console.error('[wcc] data load failed:', err instanceof Error ? err.stack : JSON.stringify(err));
    throw err;
  });
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

  const [storedSummary, storedRaw] = oddsRun
    ? await Promise.all([
        getWccSummary(oddsRun.runId, oddsRun.headlineVariant === 'model' ? 'model' : 'wcc'),
        getWccSummary(oddsRun.runId, 'model'),
      ])
    : [null, null];

  if (oddsRun && storedSummary) parityCheck(oddsRun, storedSummary, state);

  // Odds at the match-start ratings (a no-op once the pipeline's run uses them).
  let summary = storedSummary;
  let rawSummary = storedRaw;
  let history = storedHistory;
  if (oddsRun) {
    const rebased = await withMatchRatings(oddsRun, [storedSummary, storedRaw], state);
    [summary, rawSummary] = rebased.summaries;
    if (rebased.run.rebasedFrom && summary) {
      // The run's own point on the odds-over-time chart moves with it.
      const { runId } = oddsRun;
      const { pWin1, pTb } = summary;
      history = storedHistory.map(h => (h.runId === runId ? { ...h, pWin1, pTb } : h));
    }
    oddsRun = rebased.run;
  }
  const players = resolvePlayers(rows, oddsRun);

  const ratingGap = players[2].ratings.classical - players[1].ratings.classical;
  const drawRate = summary ? (summary.wdl.classical['1'][1] + summary.wdl.classical['2'][1]) / 2 : null;
  const methodology = <WccMethodology run={oddsRun} summary={summary} rawSummary={rawSummary} players={players} />;
  const h2h = <HeadToHead players={players} />;

  // The last stored price, with the moment it is from: the live quote is in the markets section.
  const quote = latestQuote(market, 'kalshi');
  const slot = quote && quoteSlot(quote, [...storedHistory].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
  const kalshi = quote && slot !== null
    ? { p: quote.pWin1, when: slot === 0 ? 'before the match' : slot === TB_SLOT ? 'during the tiebreaks' : `after game ${slot}` }
    : null;

  return (
    <Page kind="dashboard">
      <PageHead
        enter
        size="mega"
        title="Gukesh vs Sindarov"
        crumbs={[{ label: 'Simulations', href: '/simulations' }, { label: 'World Championship 2026' }]}
        facts={[
          'FIDE World Championship 2026',
          `Nov 22 to Dec 13, ${EVENT.venue}, ${EVENT.venueArea}`,
          '14 classical games, first to 7½, $2.5M prize fund',
        ]}
      />
      {run && oddsRun && summary ? (
        <WccDashboard
          players={players}
          games={games}
          run={oddsRun}
          summary={summary}
          history={history}
          markets={market}
          kalshi={kalshi}
          finished={finished}
          slots={{
            markets: <ModelVsMarkets modelPWin1={currentOdds(summary, oddsRun, state).pWin1} players={players} stored={market} ratingGap={ratingGap} drawRate={drawRate} />,
            h2h,
            methodology,
          }}
        />
      ) : (
        <>
          <section id="odds" aria-label="Match odds" className="pb-section">
            <Container>
              <FaceOff
                variant="hero"
                sides={faceOffSides(players)}
                p1={null}
                score={<MatchScore state={state} players={players} />}
                scoreLabel={scoreLabel(state)}
                next={<NextGame state={state} />}
                actions={<Button variant="primary" href={`${WCC_HREF}/live`}>Watch live</Button>}
                credit={<PhotoCreditLine photos={FACE_OFF_PHOTOS} changes={FACE_OFF_CHANGES} />}
              />
              <EmptyState
                className="mt-8"
                title="Match odds are on their way"
                body={`Exact match probabilities, confirmed by 10,000 simulations, will appear here shortly. The match starts in ${EVENT.city} on November 22.`}
              />
            </Container>
          </section>
          <Section layout="plain" label="Form">{h2h}</Section>
          <Schedule games={state.classical} players={players} />
          {methodology}
        </>
      )}
    </Page>
  );
}
