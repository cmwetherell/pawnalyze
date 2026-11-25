import { Section } from '@/components/layout/Section';
import { Disclosure } from '@/components/ui/Disclosure';
import { Explainer } from '@/components/ui/Explainer';
import { PhotoCreditList } from '@/components/ui/PhotoCredit';
import { TextLink } from '@/components/ui/TextLink';
import { formatPct } from '@/lib/format';
import { EVENT, LADDER, PRIZE, STAGE_ORDER } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import { ALL_WCC_PHOTO_CREDITS } from '@/lib/wcc/photos';
import type { WccRun, WccSummary } from '@/lib/wcc/types';

interface Props { run: WccRun | null; summary: WccSummary | null; rawSummary: WccSummary | null; players: Players }

export default function WccMethodology({ run, summary, rawSummary, players }: Props) {
  const theta = run?.params.theta?.classical ?? null;
  const drawCal = summary ? (summary.wdl.classical['1'][1] + summary.wdl.classical['2'][1]) / 2 : null;
  const drawRaw = rawSummary ? (rawSummary.wdl.classical['1'][1] + rawSummary.wdl.classical['2'][1]) / 2 : null;
  const mc = summary?.mc ?? null;
  const [p1, p2] = [players[1], players[2]];

  const items = [
    {
      title: 'Game model',
      body: (
        <>
          <p>
            Each game’s win/draw/loss chances come from Pawnalyze’s machine-learned game model (LightGBM), the same one behind our
            Olympiad forecasts. It takes both ratings and who has White.
          </p>
          <p>
            Ratings are the ones in force when the match started: {p1.shortName} {p1.ratings.classical || '–'}, {p2.shortName} {p2.ratings.classical || '–'} classical.{' '}
            {run?.params.rating_source ? <>Source: {run.params.rating_source}. </> : null}They stay fixed for the whole match.
            {run?.rebasedFrom ? <> The last simulation run used {p1.shortName} {run.rebasedFrom['1'].c}, {p2.shortName} {run.rebasedFrom['2'].c}; its odds are moved onto these ratings with the model’s rating grid until a new run is stored.</> : null}
          </p>
        </>
      ),
    },
    {
      title: 'Why title matches are calibrated',
      body: (
        <>
          <p>
            World Championship games are unusually drawish: two elite players, months of preparation, and a long match reward caution. The raw model
            {drawRaw !== null ? <> expects about {formatPct(drawRaw, 0)} draws here</> : null}; recent title matches drew far more often.
          </p>
          <p>
            We scale the odds of a draw by a single factor θ{theta !== null ? <>{'\u00a0'}={'\u00a0'}{theta.toFixed(2)}</> : null}, fitted by maximum likelihood on the 84 classical
            games of the 2013–2024 World Championship matches, which gives {drawCal !== null ? <>about {formatPct(drawCal, 0)}</> : 'roughly two-thirds'} draws.
            Extra draws come out of both players’ wins, which shrinks the favorite’s edge in each game and makes a 7–7 tiebreak more likely, so
            calibration helps the underdog
            {rawSummary && summary ? <> ({p1.shortName} {formatPct(rawSummary.pWin1)} raw, {formatPct(summary.pWin1)} calibrated)</> : null}.
          </p>
        </>
      ),
    },
    {
      title: 'Exact odds, confirmed by simulation',
      body: (
        <>
          <p>
            Because each game depends only on colors and ratings, the whole match can be solved exactly: a small dynamic program over the score,
            game by game, stopping as soon as someone reaches 7½, then a closed form for the tiebreak ladder.
          </p>
          <p>
            As a cross-check we also play {run ? run.nSims.toLocaleString('en-US') : '10,000'} full simulated matches. Every number must agree with the
            exact answer within sampling error (4 standard errors) before a run goes live{mc ? <>; this run’s largest deviation is {mc.max_z.toFixed(2)} standard errors</> : null}.
            The page recomputes the same exact odds in your browser whenever you pick a result.
          </p>
        </>
      ),
    },
    {
      title: 'Tiebreaks and prize money',
      body: (
        <>
          <ol>{STAGE_ORDER.map(s => <li key={s}><strong>{LADDER[s].label}.</strong> {LADDER[s].rule}</li>)}</ol>
          <p>
            Rapid games use rapid ratings; blitz and sudden death use blitz ratings. The draw calibration is applied to classical games only:
            faster games use the raw model. {PRIZE.rule} {PRIZE.exception}
          </p>
        </>
      ),
    },
  ];

  return (
    <Section
      id="methodology"
      title="Methodology"
      finding={
        <>
          Rules: <TextLink href={EVENT.regulationsUrl}>FIDE World Championship Match 2026 regulations (PDF)</TextLink>.
          {run ? <> Model {run.modelVersion}, run {run.runId}{run.source === 'synthetic' ? ' (synthetic test data)' : ''}.</> : null}
        </>
      }
    >
      <Explainer columns={2} items={items} />
      <Disclosure id="photo-credits" variant="row" open summary="Photo credits" className="mt-12 border-t">
        <PhotoCreditList credits={ALL_WCC_PHOTO_CREDITS} />
      </Disclosure>
    </Section>
  );
}
