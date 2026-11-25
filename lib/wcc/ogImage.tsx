import { OgFigure, OgFlag, OgFrame, OgPortrait, OgSplit, OgTitle, ogColor, ogDisplay, ogImage, ogPct, ogPlayerPhoto } from '@/lib/og/kit';
import { PLAYER_DEFAULTS } from './config';
import { WCC_PHOTOS } from './photos';
import { getWccGames, getWccRun, getWccSummary } from './queries';
import { withMatchRatings } from './rebase';
import { currentOdds, fmtScore, matchState } from './status';

/** `live`: the card of the live game page. */
export function wccOgImage({ live = false }: { live?: boolean } = {}) {
  return ogImage('World Chess Championship 2026', () => renderWccOg(live), live ? 'Gukesh vs Sindarov, live board and evaluation' : 'Gukesh vs Sindarov, exact match odds');
}

const PORTRAIT = { width: 248, height: 324 };

async function renderWccOg(live: boolean) {
  const [run, games] = await Promise.all([getWccRun(), getWccGames()]);
  const stored = run ? await getWccSummary(run.runId, run.headlineVariant === 'model' ? 'model' : 'wcc') : null;
  const state = matchState(games, run?.params.g1_white ?? null);
  const rebased = run ? await withMatchRatings(run, [stored], state) : null;
  const summary = rebased?.summaries[0] ?? null;
  const p1 = state.winner ? (state.winner === 1 ? 1 : 0) : rebased && summary ? currentOdds(summary, rebased.run, state).pWin1 : null;
  const { gukesh, sindarov } = WCC_PHOTOS;
  const score = state.winner
    ? `${PLAYER_DEFAULTS[state.winner].shortName} is World Champion`
    : state.lastFinal > 0
      ? `After game ${state.lastFinal} of 14, ${fmtScore(state.score1, state.score2)}`
      : 'Geneva, Nov 22 to Dec 13, 2026';
  const credit = (p: { cutoutOg: typeof gukesh.cutoutOg }) => `${p.cutoutOg.author.split(' (')[0]}, ${p.cutoutOg.license.split(' (')[0]}`;

  return (
    <OgFrame
      // A shared card stays in caches for days, so the live one names the page and not the game of the moment.
      stage={live ? <span style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 12, color: ogColor.ink }}>Live board and evaluation</span> : score}
      stageNote={live ? score : state.winner || state.lastFinal > 0 ? undefined : 'Before the match'}
      footer={<span style={{ fontSize: 16 }}>{`Photos: ${credit(gukesh)}; ${credit(sindarov)}. Backgrounds removed, black and white.`}</span>}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, borderBottom: `2px solid ${ogColor.rule}` }}>
          <OgPortrait src={ogPlayerPhoto(gukesh.cutoutOg.src)} field={ogColor['p1-field']} {...PORTRAIT} />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: PORTRAIT.height, justifyContent: 'space-between', padding: '24px 0 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...ogDisplay(48, { lineHeight: 1.1 }) }}>
              <span>World Chess</span>
              <span>Championship 2026</span>
            </div>
            {p1 !== null ? (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Side name="Gukesh" code="IND" p={p1} />
                <Side name="Sindarov" code="UZB" p={1 - p1} right />
              </div>
            ) : (
              <OgTitle size={46} sub="Match odds arrive shortly">Gukesh vs Sindarov</OgTitle>
            )}
          </div>
          <OgPortrait src={ogPlayerPhoto(sindarov.cutoutOg.src)} field={ogColor['p2-field']} {...PORTRAIT} />
        </div>
        {p1 !== null && <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16 }}><OgSplit share={p1} /></div>}
        {p1 !== null && summary && run && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 22, color: ogColor['ink-2'] }}>
            <span>{`Chance to win the match. ${ogPct(summary.pTb)} go to tiebreaks.`}</span>
            <span>{`Exact odds, confirmed by ${run.nSims.toLocaleString('en-US')} simulations`}</span>
          </div>
        )}
      </div>
    </OgFrame>
  );
}


function Side({ name, code, p, right = false }: { name: string; code: string; p: number; right?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: right ? 'row-reverse' : 'row', alignItems: 'center', gap: 14 }}>
        <OgFlag code={code} height={26} />
        <span style={{ fontSize: 30, fontWeight: 600 }}>{name}</span>
      </div>
      <div style={{ display: 'flex', marginTop: 14 }}><OgFigure value={(p * 100).toFixed(1)} unit="%" size={104} /></div>
    </div>
  );
}
