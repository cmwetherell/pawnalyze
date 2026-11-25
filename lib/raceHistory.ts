import type { SimulationRow } from './simulations';

/** Chance of winning after each round, 0 to 1, from the stored simulations of an event. */
export interface RaceHistory {
  /** "Pre", "1", "2", ... */
  rounds: string[];
  /** Keyed by the stored name ("Sindarov, Javokhir"), strongest before round 1 first. */
  odds: Map<string, number[]>;
  /** How many simulations each round is read from. */
  sims: number[];
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
  return { rounds, odds: new Map([...odds].sort((a, b) => b[1][0] - a[1][0])), sims: rounds.map(r => total.get(r) ?? 0) };
}

/** The gap between two chances is larger than a random sample of the simulations can make it (three standard errors). */
export function clearlyAbove(a: number, b: number, sims: number): boolean {
  return a - b > 3 * Math.sqrt(Math.max(0, a + b - (a - b) ** 2) / Math.max(1, sims));
}

const at = (history: RaceHistory, i: number) => [...history.odds].map(([name, v]): [string, number] => [name, v[i]]).sort((a, b) => b[1] - a[1]);

/** Who stood highest at a point, with everyone the sample cannot tell apart from them. */
export function leadersAt(history: RaceHistory, i: number): [string, number][] {
  const all = at(history, i);
  return all.filter(e => !clearlyAbove(all[0][1], e[1], history.sims[i]));
}

/** How many stood clearly higher than a player at a point. */
export function playersAbove(history: RaceHistory, name: string, i: number): number {
  const own = history.odds.get(name)?.[i] ?? 0;
  return at(history, i).filter(e => clearlyAbove(e[1], own, history.sims[i])).length;
}

/** How many others the sample cannot tell apart from a player at a point. */
export function playersBeside(history: RaceHistory, name: string, i: number): number {
  const own = history.odds.get(name)?.[i] ?? 0;
  return at(history, i).filter(e => e[0] !== name && !clearlyAbove(e[1], own, history.sims[i]) && !clearlyAbove(own, e[1], history.sims[i])).length;
}

/**
 * Where a winner took the lead for good: the first such round, who stood highest in the round before, and whether the two
 * were too close to call there. Null when they led throughout, or do not lead at the end.
 */
export function tookTheLead(history: RaceHistory, winner: string): { round: string; from: string; before: string; level: boolean } | null {
  const mine = history.odds.get(winner);
  if (!mine) return null;
  const leaderAt = (i: number) => [...history.odds].reduce((best, e) => (e[1][i] > best[1][i] ? e : best))[0];
  const last = history.rounds.findLastIndex((_, i) => leaderAt(i) !== winner);
  if (last < 0 || last === history.rounds.length - 1) return null;
  const from = leaderAt(last);
  return { round: history.rounds[last + 1], from, before: history.rounds[last], level: !clearlyAbove(history.odds.get(from)![last], mine[last], history.sims[last]) };
}

/** The highest chance anyone but the winner had. Null when the sample cannot tell whose it was; no round when it cannot tell which. */
export function bestOfTheRest(history: RaceHistory, winner: string): { name: string; chance: number; round: string | null } | null {
  const all = [...history.odds]
    .filter(([name]) => name !== winner)
    .flatMap(([name, v]) => v.map((chance, i) => ({ name, chance, i })))
    .sort((a, b) => b.chance - a.chance);
  const best = all[0];
  if (!best) return null;
  const close = all.slice(1).filter(e => !clearlyAbove(best.chance, e.chance, Math.min(history.sims[best.i], history.sims[e.i])));
  if (close.some(e => e.name !== best.name)) return null;
  return { name: best.name, chance: best.chance, round: close.length > 0 ? null : history.rounds[best.i] };
}
