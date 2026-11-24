import { PhotoCreditList } from '@/components/ui/PhotoCredit';
import { EVENT, LADDER, PRIZE, STAGE_ORDER } from '@/lib/wcc/config';
import { ALL_WCC_PHOTO_CREDITS } from '@/lib/wcc/photos';
import type { WccRun, WccSummary } from '@/lib/wcc/types';
import { formatPct, type Players } from './ui';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--bg-surface-2)]/70 p-4">
      <h3 className="font-heading text-base text-[var(--text-primary)] mb-1.5">{title}</h3>
      <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function WccMethodology({
  run, summary, rawSummary, players,
}: {
  run: WccRun | null;
  summary: WccSummary | null;
  rawSummary: WccSummary | null;
  players: Players;
}) {
  const theta = run?.params.theta?.classical ?? null;
  const drawCal = summary ? (summary.wdl.classical['1'][1] + summary.wdl.classical['2'][1]) / 2 : null;
  const drawRaw = rawSummary ? (rawSummary.wdl.classical['1'][1] + rawSummary.wdl.classical['2'][1]) / 2 : null;
  const mc = summary?.mc ?? null;
  const [p1, p2] = [players[1], players[2]];

  return (
    <section id="methodology" aria-labelledby="methodology-title" className="surface-card p-4 sm:p-6 scroll-mt-32">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1">How this works</p>
      <h2 id="methodology-title" className="font-heading text-xl sm:text-2xl text-[var(--text-primary)]">Methodology</h2>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <Card title="Game model">
          <p>
            Each game’s win/draw/loss chances come from Pawnalyze’s machine-learned game model (LightGBM), the same one behind our
            Olympiad forecasts. It takes both ratings and who has White.
          </p>
          <p>
            Ratings are the ones in force when the match started: {p1.shortName} {p1.ratings.classical || '—'}, {p2.shortName} {p2.ratings.classical || '—'} classical
            {run?.params.rating_source ? <> (source: {run.params.rating_source})</> : null}. They stay fixed for the whole match.
            {run?.rebasedFrom ? <> The last simulation run used {p1.shortName} {run.rebasedFrom['1'].c}, {p2.shortName} {run.rebasedFrom['2'].c}; its odds are moved onto these ratings with the model’s rating grid until a new run is stored.</> : null}
          </p>
        </Card>

        <Card title="Why title matches are calibrated">
          <p>
            World Championship games are unusually drawish: two elite players, months of preparation, and a long match reward caution. The raw model
            {drawRaw !== null ? <> expects about {formatPct(drawRaw, 0)} draws here</> : null}; recent title matches drew far more often.
          </p>
          <p>
            We scale the odds of a draw by a single factor θ{theta !== null ? <> = {theta.toFixed(2)}</> : null}, fitted by maximum likelihood on the 84 classical
            games of the 2013–2024 World Championship matches, which gives {drawCal !== null ? <>about {formatPct(drawCal, 0)}</> : 'roughly two-thirds'} draws.
            Extra draws come out of both players’ wins, which shrinks the favourite’s edge in each game and makes a 7–7 tiebreak more likely, so
            calibration helps the underdog
            {rawSummary && summary ? <> ({p1.shortName} {formatPct(rawSummary.pWin1)} raw → {formatPct(summary.pWin1)} calibrated)</> : null}.
          </p>
        </Card>

        <Card title="Exact odds, confirmed by simulation">
          <p>
            Because each game depends only on colours and ratings, the whole match can be solved exactly: a small dynamic program over the score,
            game by game, stopping as soon as someone reaches 7½, then a closed form for the tiebreak ladder.
          </p>
          <p>
            As a cross-check we also play {run ? run.nSims.toLocaleString('en-US') : '10,000'} full simulated matches. Every number must agree with the
            exact answer within sampling error (4 standard errors) before a run goes live
            {mc ? <> — this run’s largest deviation is {mc.max_z.toFixed(2)} standard errors</> : null}.
            The page recomputes the same exact odds in your browser whenever you pick a result.
          </p>
        </Card>

        <Card title="Tiebreaks and prize money">
          <ul className="space-y-1 list-none">
            {STAGE_ORDER.map((s, i) => (
              <li key={s}><strong>{i + 1}. {LADDER[s].label}.</strong> {LADDER[s].rule}</li>
            ))}
          </ul>
          <p>
            Rapid games use rapid ratings; blitz and sudden death use blitz ratings. The draw calibration is applied to classical games only —
            faster games use the raw model. {PRIZE.rule} {PRIZE.exception}
          </p>
        </Card>
      </div>

      <p className="mt-4 text-xs text-[var(--text-muted)]">
        Rules: <a className="underline hover:text-gold-ink" href={EVENT.regulationsUrl} target="_blank" rel="noopener noreferrer">FIDE World Championship Match 2026 regulations (PDF)</a>.
        {run ? <> Model {run.modelVersion} · run {run.runId}{run.source === 'synthetic' ? ' (synthetic test data)' : ''}.</> : null}
      </p>

      <div id="photo-credits" className="mt-6 pt-5 border-t border-[var(--border)]">
        <h3 className="font-heading text-base text-[var(--text-primary)] mb-3">Photo credits</h3>
        <PhotoCreditList credits={ALL_WCC_PHOTO_CREDITS} />
      </div>
    </section>
  );
}
