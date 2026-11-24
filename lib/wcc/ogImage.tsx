import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';

import { OG_SIZE, safeOg } from '../og';
import { PLAYER_DEFAULTS } from './config';
import { WCC_PHOTOS } from './photos';
import { getWccGames, getWccRun, getWccSummary } from './queries';
import { currentOdds, fmtScore, matchState } from './status';

function fileDataUri(rel: string, mime: string): string | null {
  try {
    const buf = readFileSync(path.join(process.cwd(), rel));
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

const P1 = '#eb6834';
const P2 = '#3987e5';

export function wccOgImage() {
  return safeOg('World Chess Championship 2026', renderWccOg, 'Gukesh vs Sindarov · exact match odds');
}

async function renderWccOg() {
  const [run, games] = await Promise.all([getWccRun(), getWccGames()]);
  const summary = run ? await getWccSummary(run.runId, run.headlineVariant === 'model' ? 'model' : 'wcc') : null;
  const state = matchState(games, run?.params.g1_white ?? null);
  const p1 = run && summary ? currentOdds(summary, run, state).pWin1 : null;
  const g = fileDataUri(`public${WCC_PHOTOS.gukesh.og.src}`, 'image/jpeg');
  const s = fileDataUri(`public${WCC_PHOTOS.sindarov.og.src}`, 'image/jpeg');
  const flagIn = fileDataUri('node_modules/flag-icons/flags/4x3/in.svg', 'image/svg+xml');
  const flagUz = fileDataUri('node_modules/flag-icons/flags/4x3/uz.svg', 'image/svg+xml');
  const stage = state.winner
    ? `${PLAYER_DEFAULTS[state.winner].shortName} is World Champion`
    : state.lastFinal > 0
      ? `After game ${state.lastFinal} of 14 · ${fmtScore(state.score1, state.score2)}`
      : 'Before the match · Geneva, 22 Nov – 13 Dec 2026';
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  const portrait = (src: string | null, side: 'left' | 'right', color: string) => (
    <div style={{ display: 'flex', position: 'relative', width: 300, height: 630 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={300} height={630} style={{ width: 300, height: 630, objectFit: 'cover', objectPosition: '50% 30%' }} />
      ) : (
        <div style={{ display: 'flex', width: 300, height: 630, background: '#1a1d23' }} />
      )}
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: side === 'left' ? 'linear-gradient(90deg, rgba(11,13,18,0) 55%, #0B0D12 100%)' : 'linear-gradient(270deg, rgba(11,13,18,0) 55%, #0B0D12 100%)' }} />
      <div style={{ display: 'flex', position: 'absolute', left: 0, right: 0, bottom: 0, height: 8, background: color }} />
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0B0D12', color: '#f0f2f5', fontFamily: 'sans-serif' }}>
        {portrait(g, 'left', P1)}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '44px 36px 36px', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', color: '#C9A84C' }}>Pawnalyze · World Championship 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 18, fontSize: 54, fontWeight: 700 }}>
            <span>Gukesh</span><span style={{ fontSize: 30, color: '#8b949e' }}>vs</span><span>Sindarov</span>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#8b949e', marginTop: 6 }}>{stage}</div>

          {p1 !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: '#c9d1d9' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {flagIn && <img src={flagIn} alt="" width={32} height={24} style={{ borderRadius: 3 }} />}
                    Gukesh
                  </div>
                  <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1 }}>{pct(p1)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: '#c9d1d9' }}>
                    Sindarov
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {flagUz && <img src={flagUz} alt="" width={32} height={24} style={{ borderRadius: 3 }} />}
                  </div>
                  <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1 }}>{pct(1 - p1)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', height: 22, borderRadius: 11, overflow: 'hidden', marginTop: 20, background: '#2a2f38' }}>
                <div style={{ display: 'flex', width: `${Math.max(1, p1 * 100)}%`, background: P1 }} />
                <div style={{ display: 'flex', width: 3, background: '#0B0D12' }} />
                <div style={{ display: 'flex', flex: 1, background: P2 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, fontSize: 20, color: '#8b949e' }}>
                {`Chance to win the match · ${pct(summary!.pTb)} go to tiebreaks`}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', fontSize: 30, color: '#c9d1d9', marginTop: 60 }}>Match odds arrive shortly</div>
          )}

          <div style={{ display: 'flex', marginTop: 'auto', fontSize: 18, color: '#8b949e' }}>
            {run ? `Exact odds, confirmed by ${run.nSims.toLocaleString('en-US')} simulations · pawnalyze.com` : 'pawnalyze.com'}
          </div>
        </div>
        {portrait(s, 'right', P2)}
      </div>
    ),
    { ...OG_SIZE },
  );
}
