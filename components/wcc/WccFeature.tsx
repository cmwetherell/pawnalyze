import { FaceOff } from '@/components/chess/FaceOff';
import { HeroEnter } from '@/components/layout/HeroEnter';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { PhotoCreditLine } from '@/components/ui/PhotoCredit';
import { EVENT, WCC_HREF, WCC_TITLE } from '@/lib/wcc/config';
import { getWccGames, getWccPlayers, getWccRun, getWccSummary } from '@/lib/wcc/queries';
import { withMatchRatings } from '@/lib/wcc/rebase';
import { currentOdds, matchState, scoreLabel, wonLine, type MatchState } from '@/lib/wcc/status';
import { MatchScore, NextGame } from './MatchNow';
import { FACE_OFF_CHANGES, FACE_OFF_PHOTOS, PAWN_NOTE, faceOffSides, resolvePlayers } from './players';

const LIVE_HREF = `${WCC_HREF}/live`;
const liveName = (g: NonNullable<MatchState['live']>) => (g.stage === 'classical' ? `game ${g.gameNo}` : `tiebreak game ${g.stageGame}`);

/** The match, on the home page (`hero`: no title of its own above it) and the simulations index (`section`). */
export async function WccFeature({ as }: { as: 'hero' | 'section' }) {
  const [rows, games, run] = await Promise.all([getWccPlayers(), getWccGames(), getWccRun()]);
  const stored = run ? await getWccSummary(run.runId, 'wcc') : null;
  const state = matchState(games, run?.params.g1_white ?? null);
  const rebased = run ? await withMatchRatings(run, [stored], state) : null;
  const shownRun = rebased?.run ?? null;
  const summary = rebased?.summaries[0] ?? null;
  const players = resolvePlayers(rows, shownRun);
  const over = state.winner !== null;
  const p1 = !over && shownRun && summary ? currentOdds(summary, shownRun, state).pWin1 : null;
  const hero = as === 'hero';
  const next = over ? null : <NextGame state={state} />;

  const face = (
    <FaceOff
      variant="feature"
      sides={faceOffSides(players)}
      p1={p1}
      score={<MatchScore state={state} players={players} />}
      scoreLabel={scoreLabel(state)}
      heading={hero ? <Heading level={2} style="h3">{WCC_TITLE}, {EVENT.city}</Heading> : undefined}
      next={hero ? next : undefined}
      notes={p1 !== null && run ? [PAWN_NOTE, `Exact odds, confirmed by ${run.nSims.toLocaleString('en-US')} simulations.`] : undefined}
      verdict={!over && p1 === null ? 'Exact match odds, tiebreak paths and a scenario builder, arriving soon.' : undefined}
      actions={
        over ? (
          <>
            <Button variant="primary" href={WCC_HREF}>See how it ended</Button>
            <Button href={LIVE_HREF}>Replay the games</Button>
          </>
        ) : state.live ? (
          <>
            <Button variant="primary" live href={LIVE_HREF}>Watch {liveName(state.live)} live</Button>
            <Button href={WCC_HREF}>See the match odds</Button>
          </>
        ) : (
          <>
            <Button variant="primary" href={WCC_HREF}>See the match odds</Button>
            <Button href={LIVE_HREF}>Watch live</Button>
          </>
        )
      }
      champion={state.winner ? { name: players[state.winner].shortName, line: wonLine(state) } : null}
      credit={<PhotoCreditLine photos={FACE_OFF_PHOTOS} changes={FACE_OFF_CHANGES} />}
    />
  );

  return hero ? (
    <Section layout="plain" rule={false} label={WCC_TITLE}><HeroEnter>{face}</HeroEnter></Section>
  ) : (
    <Section layout="plain" title={WCC_TITLE} actions={next && <p className="type-small text-ink-2">{next}</p>}>{face}</Section>
  );
}
