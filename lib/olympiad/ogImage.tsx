import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';

import { N_ROUNDS, OLYMPIAD_EVENTS } from './config';
import { fedToIso } from './fedToIso';
import { getOlympiadRun, getOlympiadStatus, getOlympiadSummary, getOlympiadTeams } from './queries';
import { teamsInRun } from './standings';
import type { OlympiadEvent } from './types';

export const OG_SIZE = { width: 1200, height: 630 };

/** Inline a flag from the installed flag-icons package (no network during prerender). */
function flagDataUri(iso: string | null): string | null {
  if (!iso) return null;
  try {
    const svg = readFileSync(path.join(process.cwd(), 'node_modules', 'flag-icons', 'flags', '4x3', `${iso}.svg`), 'utf8');
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  } catch {
    return null;
  }
}

/** Social card: top-5 gold odds with flags. Falls back to a title card before the first run. */
export async function olympiadOgImage(event: OlympiadEvent) {
  const cfg = OLYMPIAD_EVENTS[event];
  const [run, allTeams, status] = await Promise.all([getOlympiadRun(event), getOlympiadTeams(event), getOlympiadStatus(event)]);
  const teams = teamsInRun(allTeams, run);
  const summary = run ? await getOlympiadSummary(event, run.runId) : [];
  const byId = new Map(teams.map(t => [t.teamId, t]));
  const top = [...summary].sort((a, b) => b.pGold - a.pGold).slice(0, 5);
  const stage = status.lastFinalRound >= N_ROUNDS ? 'Final' : status.lastFinalRound > 0 ? `After round ${status.lastFinalRound} of ${N_ROUNDS}` : 'Pre-tournament';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '44px 56px',
          background: 'linear-gradient(135deg, #0F1116 0%, #1a1d23 100%)', color: '#f0f2f5', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#C9A84C' }}>Pawnalyze · Who wins gold?</div>
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, marginTop: 4 }}>{cfg.shortTitle}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', color: '#8b949e', fontSize: 22 }}>
            <div style={{ display: 'flex' }}>{stage}</div>
            {run && <div style={{ display: 'flex' }}>{`${run.nSims.toLocaleString()} simulations`}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22, gap: 10, flex: 1 }}>
          {top.length === 0 ? (
            <div style={{ display: 'flex', fontSize: 30, color: '#c9d1d9' }}>Simulations arrive shortly before round 1.</div>
          ) : (
            top.map((s, i) => {
              const team = byId.get(s.teamId);
              const flag = flagDataUri(fedToIso(team?.fedCode));
              const width = Math.max(2, s.pGold * 100);
              return (
                <div key={s.teamId} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ display: 'flex', width: 36, fontSize: 28, color: '#8b949e', justifyContent: 'flex-end' }}>{i + 1}</div>
                  {flag ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={flag} alt="" width={56} height={42} style={{ borderRadius: 4 }} />
                  ) : (
                    <div style={{ display: 'flex', width: 60, height: 45, borderRadius: 4, background: '#2a2f38', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{team?.fedCode ?? ''}</div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ display: 'flex', fontSize: 28, fontWeight: 600 }}>{team?.name ?? `Team ${s.teamId}`}</div>
                      <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#C9A84C' }}>{`${(s.pGold * 100).toFixed(1)}%`}</div>
                    </div>
                    <div style={{ display: 'flex', height: 10, borderRadius: 5, background: '#2a2f38', marginTop: 5, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', width: `${width}%`, background: '#C9A84C', borderRadius: 6 }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: 18, marginTop: 14 }}>
          <div style={{ display: 'flex' }}>Gold-medal probability · Monte Carlo simulations updated after every round</div>
          <div style={{ display: 'flex' }}>pawnalyze.com</div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
