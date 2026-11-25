import type { SimulationRow } from './simulations';

/** Chance of winning after each round, 0 to 1, from the stored simulations of an event. */
export interface RaceHistory {
  /** "Pre", "1", "2", ... */
  rounds: string[];
  /** Keyed by the stored name ("Sindarov, Javokhir"), strongest before round 1 first. */
  odds: Map<string, number[]>;
}

const order = (round: string) => (round === 'Pre' ? 0 : Number(round));

export function raceHistory(rows: SimulationRow[]): RaceHistory {
  const rounds = [...new Set(rows.map(r => r.Round))].filter(r => r === 'Pre' || /^\d+$/.test(r)).sort((a, b) => order(a) - order(b));
  const total = new Map(rounds.map(r => [r, 0]));
  for (const r of rows) if (total.has(r.Round)) total.set(r.Round, (total.get(r.Round) ?? 0) + Number(r.win_count));
  const odds = new Map<string, number[]>();
  for (const r of rows) {
    const i = rounds.indexOf(r.Round);
    if (i < 0) continue;
    const line = odds.get(r.winner) ?? rounds.map(() => 0);
    line[i] = Number(r.win_count) / (total.get(r.Round) || 1);
    odds.set(r.winner, line);
  }
  return { rounds, odds: new Map([...odds].sort((a, b) => b[1][0] - a[1][0])) };
}

/** Where a winner took the lead for good: the first such round, and who led in the round before. Null when they led throughout. */
export function tookTheLead(history: RaceHistory, winner: string): { round: string; from: string } | null {
  const mine = history.odds.get(winner);
  if (!mine) return null;
  const leaderAt = (i: number) => [...history.odds].reduce((best, e) => (e[1][i] > best[1][i] ? e : best))[0];
  const last = history.rounds.findLastIndex((_, i) => leaderAt(i) !== winner);
  return last < 0 || last === history.rounds.length - 1 ? null : { round: history.rounds[last + 1], from: leaderAt(last) };
}
