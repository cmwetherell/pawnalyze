import type { HistoryPoint, OfficialStandings } from '@/lib/olympiad/types';

export interface GoldStory {
  favouriteId: number;
  favouriteP: number;
  /** Rounds completed when the champion went ahead for good; 0 is before round 1. */
  ledFrom: number;
  lastRound: number;
}

/** Who started as favourite, and after which round the champion led for good. Null without a run from before round 1. */
export function goldStory(history: HistoryPoint[], championId: number): GoldStory | null {
  const leaders = new Map<number, HistoryPoint>();
  for (const h of history) {
    const best = leaders.get(h.roundsCompleted);
    if (!best || h.pGold > best.pGold) leaders.set(h.roundsCompleted, h);
  }
  const rounds = [...leaders.keys()].sort((a, b) => b - a);
  const start = leaders.get(0);
  if (!start || leaders.get(rounds[0])?.teamId !== championId) return null;
  let ledFrom = rounds[0];
  for (const r of rounds) {
    if (leaders.get(r)?.teamId !== championId) break;
    ledFrom = r;
  }
  return { favouriteId: start.teamId, favouriteP: start.pGold, ledFrom, lastRound: rounds[0] };
}

/** Places 1 to 3, when the official table has all of them. */
export const podiumRows = (standings: OfficialStandings) => {
  const rows = standings.rows.filter(r => r.rank <= 3).sort((a, b) => a.rank - b.rank);
  return rows.length >= 3 ? rows : [];
};
