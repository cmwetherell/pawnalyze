'use client';

import { Countdown } from '@/components/ui/Countdown';
import { LiveDot } from '@/components/ui/LiveDot';
import { LocalTime } from '@/components/ui/LocalTime';
import { useNow } from '@/hooks/useNow';
import { CLASSICAL_SCHEDULE, OPENING_CEREMONY, TIEBREAK_START } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import { fmtPoints, type MatchState } from '@/lib/wcc/status';

const HOUR = 3_600_000;
const G1 = CLASSICAL_SCHEDULE[0].startsAt;

const startedByResult = (state: MatchState) => state.lastFinal > 0 || state.anyLive || state.winner !== null;

/** The score slot of the face-off: the running score, or the countdown to game 1. */
export function MatchScore({ state, players }: { state: MatchState; players: Players }) {
  const now = useNow(60_000);
  if (!startedByResult(state) && (now === null || now < new Date(G1).getTime())) return <Countdown iso={G1} />;
  return (
    <>
      <span className="sr-only">Score: {players[1].shortName} {fmtPoints(state.score1)}, {players[2].shortName} {fmtPoints(state.score2)}</span>
      <span aria-hidden>{fmtPoints(state.score1)}–{fmtPoints(state.score2)}</span>
    </>
  );
}

export { scoreLabel } from '@/lib/wcc/status';

/** What happens next, in the reader's own time: the live game, the next game, the tiebreaks, or a result that is not in yet. */
export function NextGame({ state }: { state: MatchState }) {
  const now = useNow(60_000);
  if (state.live) {
    const { stage, gameNo, stageGame } = state.live;
    return <LiveDot label={`${stage === 'classical' ? `Game ${gameNo}` : `Tiebreak game ${stageGame}`} is live`} />;
  }
  if (state.lastFinal === 14 && state.score1 === state.score2 && state.winner === null) {
    return <>Level at 7–7. Tiebreaks: <LocalTime iso={TIEBREAK_START} /></>;
  }
  const next = state.classical.find(g => g.status === 'scheduled' && g.startsAt && (now === null || new Date(g.startsAt).getTime() > now - 6 * HOUR));
  if (!next?.startsAt) return <>Awaiting results</>;
  const at = new Date(next.startsAt).getTime();
  const when = now !== null && new Date(at).toDateString() === new Date(now).toDateString() ? 'Today' : <LocalTime iso={next.startsAt} format="day" />;
  const first = next.gameNo === 1 && !startedByResult(state);
  const beforeDraw = now !== null && now < new Date(`${OPENING_CEREMONY}T17:00:00Z`).getTime();
  return (
    <>
      {when}: game {next.gameNo} at <LocalTime iso={next.startsAt} format="time" />
      {first ? beforeDraw && '. Colors drawn Nov 22' : now !== null && at - now > 30 * HOUR && ', after a rest day'}
    </>
  );
}
