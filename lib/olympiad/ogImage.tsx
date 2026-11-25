import { OgFigure, OgFlag, OgFrame, OgMedal, OgPips, OgRow, OgTitle, clip, ogColor, ogDisplay, ogImage, ogMedalColor, ogPct } from '@/lib/og/kit';
import { BOARD_LABELS, N_ROUNDS, OLYMPIAD_EVENTS, boardLabel } from './config';
import { MEDAL_WORD, contenders, medalPlaces } from './medals';
import { ordinal } from './odds';
import { getOlympiadBoardRace, getOlympiadOfficialStandings, getOlympiadRun, getOlympiadStatus, getOlympiadSummary, getOlympiadSummaryHistory, getOlympiadTeams } from './queries';
import { teamsInRun } from './standings';
import { MIN_GAMES_FOR_PRIZE, displayName, formatScore } from './tpr';
import type { OlympiadEvent, Team } from './types';

export { OG_SIZE } from '../og/kit';

const titleOf = (event: OlympiadEvent) => OLYMPIAD_EVENTS[event].shortTitle;

/** A narrow column: the surname, which is what stands before the comma in the pairings. */
const surname = (raw: string, max: number) => clip(raw.split(',')[0].trim(), max);

const stageOf = (round: number, before: string) => (round >= N_ROUNDS ? 'Final' : round > 0 ? `After round ${round} of ${N_ROUNDS}` : before);

/** Social card: the top five gold odds; once it is over, the podium. Falls back to a title card before the first run. */
export function olympiadOgImage(event: OlympiadEvent) {
  return ogImage(titleOf(event), () => renderOlympiadOg(event));
}

async function renderOlympiadOg(event: OlympiadEvent) {
  const title = titleOf(event);
  const [run, allTeams, status] = await Promise.all([getOlympiadRun(event), getOlympiadTeams(event), getOlympiadStatus(event)]);
  const byId = new Map(teamsInRun(allTeams, run).map(t => [t.teamId, t]));
  const stage = stageOf(status.lastFinalRound, 'Pre-tournament');
  const sims = run ? `${run.nSims.toLocaleString('en-US')} simulations` : undefined;

  if (status.lastFinalRound >= N_ROUNDS) {
    const places = await podium(event, byId);
    if (places.length === 3) {
      return (
        <OgFrame stage={stage} stageNote={sims} footer="Gold odds before round 1, from Monte Carlo simulations updated after every round">
          <OgTitle>{title}</OgTitle>
          <div style={{ display: 'flex', gap: 24, marginTop: 36 }}>
            {places.map(p => (
              <div key={p.rank} style={{ display: 'flex', flexDirection: 'column', flex: 1, borderTop: `4px solid ${ogMedalColor(p.rank)}`, paddingTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <OgFlag code={p.team.fedCode} height={66} />
                  <OgMedal rank={p.rank} size={40} />
                </div>
                <div style={{ display: 'flex', height: 64, alignItems: 'flex-end', ...ogDisplay(p.team.name.length > 16 ? 30 : 46) }}>{clip(p.team.name, 26)}</div>
                <div style={{ display: 'flex', marginTop: 14, fontSize: 21, color: ogColor['ink-2'] }}>{`${p.mp} match points, ${p.gpHalf / 2} game points`}</div>
                {p.pre !== null && <div style={{ display: 'flex', marginTop: 4, fontSize: 21, color: ogColor['ink-3'] }}>{`${ogPct(p.pre)} before round 1`}</div>}
              </div>
            ))}
          </div>
        </OgFrame>
      );
    }
  }

  const summary = run ? await getOlympiadSummary(event, run.runId) : [];
  const top = [...summary].sort((a, b) => b.pGold - a.pGold).slice(0, 5);
  return (
    <OgFrame stage={stage} stageNote={sims} footer="Gold-medal probability, from Monte Carlo simulations updated after every round">
      {top.length === 0 ? (
        <OgTitle size={72} sub="Simulations arrive shortly before round 1.">{title}</OgTitle>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', marginBottom: 14, ...ogDisplay(46) }}>{`${title}: who wins gold?`}</div>
          {top.map((s, i) => {
            const team = byId.get(s.teamId);
            return <OgRow key={s.teamId} rank={i + 1} code={team?.fedCode} name={team?.name ?? `Team ${s.teamId}`} share={s.pGold} value={ogPct(s.pGold)} color={ogColor.gold} />;
          })}
        </div>
      )}
    </OgFrame>
  );
}

async function podium(event: OlympiadEvent, byId: Map<number, Team>) {
  const [standings, history] = await Promise.all([getOlympiadOfficialStandings(event), getOlympiadSummaryHistory(event)]);
  return (standings?.rows ?? []).filter(r => r.rank <= 3).sort((a, b) => a.rank - b.rank).flatMap(r => {
    const team = byId.get(r.teamId);
    return team ? [{ rank: r.rank as 1 | 2 | 3, team, mp: r.mp, gpHalf: r.gpHalf, pre: history.find(h => h.roundsCompleted === 0 && h.teamId === r.teamId)?.pGold ?? null }] : [];
  });
}

/** Social card for the board prizes: gold, silver and bronze on each of the five boards. */
export function boardRaceOgImage(event: OlympiadEvent) {
  return ogImage(`${titleOf(event)} board prizes`, () => renderBoardRaceOg(event));
}

async function renderBoardRaceOg(event: OlympiadEvent) {
  const race = await getOlympiadBoardRace(event);
  const finished = race.lastRound >= N_ROUNDS;

  return (
    <OgFrame stage={stageOf(race.lastRound, 'Before round 1')} footer={`Individual board medals: highest performance rating with at least ${MIN_GAMES_FOR_PRIZE} games`}>
      <OgTitle size={54}>{`${titleOf(event)}: board ${finished ? 'prizes' : 'prize race'}`}</OgTitle>
      <div style={{ display: 'flex', marginTop: 26, borderTop: `2px solid ${ogColor.rule}`, borderBottom: `1px solid ${ogColor.line}` }}>
        {race.boards.map((rows, i) => {
          const podium = contenders(rows).slice(0, 3);
          return (
            <div
              key={i}
              style={{
                display: 'flex', flexDirection: 'column', width: 1088 / 5, padding: i === 0 ? '14px 8px 0 0' : '14px 8px 0 18px',
                borderLeft: i === 0 ? `0px solid ${ogColor.line}` : `1px solid ${ogColor.line}`,
              }}
            >
              <div style={{ display: 'flex', marginBottom: 12, ...ogDisplay(26) }}>{BOARD_LABELS[i]}</div>
              {([1, 2, 3] as const).map(rank => {
                const r = podium[rank - 1];
                const first = rank === 1;
                return (
                  <div key={rank} style={{ display: 'flex', height: first ? 92 : 72 }}>
                    <div style={{ display: 'flex', width: 36, paddingTop: first ? 7 : 1 }}><OgMedal rank={rank} size={26} /></div>
                    {r ? (
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <OgFlag code={r.fedCode} height={first ? 26 : 20} />
                          {first ? <span style={ogDisplay(38)}>{r.tpr}</span> : <span style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}>{r.tpr}</span>}
                        </div>
                        <div style={{ display: 'flex', marginTop: 3, fontSize: 21, lineHeight: 1.25, fontWeight: first ? 600 : 400, color: first ? ogColor.ink : ogColor['ink-2'], whiteSpace: 'nowrap' }}>{surname(r.name, 15)}</div>
                      </div>
                    ) : <span style={{ fontSize: 20, color: ogColor['ink-3'] }}>Open</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </OgFrame>
  );
}

/** Social card for one player in the board-prize race. */
export function playerOgImage(event: OlympiadEvent, fideId: number) {
  return ogImage(`${titleOf(event)} board prizes`, () => renderPlayerOg(event, fideId));
}

async function renderPlayerOg(event: OlympiadEvent, fideId: number) {
  const race = await getOlympiadBoardRace(event);
  const p = race.boards.flat().find(r => r.fideId === fideId);
  if (!p) return renderBoardRaceOg(event);
  const name = displayName(p.name);
  const board = boardLabel(p.board);
  const rankText = p.rank !== null ? `${ordinal(p.rank)} of ${race.ranked[p.board - 1]}` : 'Not yet ranked';
  const eligible = p.eligible ? 'Eligible for a medal' : p.canReach ? `Needs ${p.needed} more of ${MIN_GAMES_FOR_PRIZE} games` : `Cannot reach ${MIN_GAMES_FOR_PRIZE} games`;
  const medal = medalPlaces(race.boards[p.board - 1]).get(fideId);
  // Once it is over a medal is won; before that it is a place among those who can still win one.
  const verdict = !medal ? eligible
    : race.lastFinalRound >= N_ROUNDS ? `Won the ${board.toLowerCase()} ${MEDAL_WORD[medal]} medal`
    : medal !== p.rank ? `In ${MEDAL_WORD[medal]} among players who can reach ${MIN_GAMES_FOR_PRIZE} games` : eligible;
  const results = Array.from({ length: N_ROUNDS }, (_, i) => p.form.find(f => f.round === i + 1)?.score ?? null);

  return (
    <OgFrame stage={stageOf(race.lastRound, 'Before round 1')} stageNote={`${titleOf(event)}, board prizes`} footer={`Board medals go to the best performance rating with at least ${MIN_GAMES_FOR_PRIZE} games`}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <OgFlag code={p.fedCode} height={90} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', ...ogDisplay(name.length > 24 ? 46 : 64) }}>{clip(name, 34)}</div>
            <div style={{ display: 'flex', marginTop: 8, fontSize: 26, color: ogColor['ink-2'] }}>
              {p.title && <span style={{ color: ogColor.brand, fontWeight: 600, marginRight: 12 }}>{p.title}</span>}
              {`${p.teamName}, ${board.toLowerCase()}${p.rating ? `, rating ${p.rating}` : ''}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40, paddingTop: 28, borderTop: `1px solid ${ogColor.line}` }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {medal && <OgMedal rank={medal} size={40} />}
              <span style={ogDisplay(40)}>{`${rankText} on ${board.toLowerCase()}`}</span>
            </div>
            <div style={{ display: 'flex', margin: '18px 0', fontSize: 24, color: ogColor['ink-2'] }}>{`${formatScore(p.score, p.games)}. ${verdict}`}</div>
            <OgPips results={results} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 24, color: ogColor['ink-2'], marginBottom: 14 }}>Performance rating</span>
            <OgFigure value={p.tpr === null ? '–' : String(p.tpr)} size={150} />
          </div>
        </div>
      </div>
    </OgFrame>
  );
}
