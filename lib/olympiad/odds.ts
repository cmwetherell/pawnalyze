import type { HistoryPoint, Mover, ScenarioResult, TeamOdds, TeamSummary } from './types';

export function baselineOdds(summary: TeamSummary[]): Map<number, TeamOdds> {
  const map = new Map<number, TeamOdds>();
  for (const s of summary) {
    map.set(s.teamId, {
      teamId: s.teamId,
      pGold: s.pGold,
      pSilver: s.pSilver,
      pBronze: s.pBronze,
      pMedal: s.pMedal,
      pTop10: s.pTop10,
      expRank: s.expRank,
      expMp: s.expMp,
    });
  }
  return map;
}

/** Turn the API's rank counts into per-team odds; teams absent from the counts are 0. */
export function scenarioOdds(result: ScenarioResult, participantIds: Iterable<number>): Map<number, TeamOdds> {
  const map = new Map<number, TeamOdds>();
  const n = Math.max(result.matched, 1);
  for (const id of participantIds) {
    map.set(id, { teamId: id, pGold: 0, pSilver: 0, pBronze: 0, pMedal: 0, pTop10: 0, expRank: null, expMp: null });
  }
  for (const r of result.ranks) {
    const row = map.get(r.teamId);
    if (!row) continue;
    const p = r.n / n;
    if (r.rank === 1) row.pGold += p;
    else if (r.rank === 2) row.pSilver += p;
    else if (r.rank === 3) row.pBronze += p;
    if (r.rank <= 3) row.pMedal += p;
    if (r.rank <= 10) row.pTop10 += p;
  }
  for (const t of result.teams) {
    const row = map.get(t.teamId);
    if (!row) continue;
    row.expRank = t.expRank;
    row.expMp = t.expMp;
  }
  return map;
}

export function formatRank(rank: number | null): string {
  if (rank === null || !Number.isFinite(rank)) return '—';
  return rank.toFixed(1);
}

export function formatMp(mp: number | null): string {
  if (mp === null || !Number.isFinite(mp)) return '—';
  return mp.toFixed(1);
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** Gold-odds change between the two most recent runs in the history (same numbering only, by construction). */
export function movers(history: HistoryPoint[], limit = 5): { up: Mover[]; down: Mover[] } {
  const rounds = Array.from(new Set(history.map(h => h.roundsCompleted))).sort((a, b) => a - b);
  if (rounds.length < 2) return { up: [], down: [] };
  const latest = rounds[rounds.length - 1];
  const previous = rounds[rounds.length - 2];
  const prev = new Map(history.filter(h => h.roundsCompleted === previous).map(h => [h.teamId, h.pGold]));
  const all: Mover[] = [];
  for (const h of history) {
    if (h.roundsCompleted !== latest) continue;
    const from = prev.get(h.teamId);
    if (from === undefined) continue;
    const delta = h.pGold - from;
    if (Math.abs(delta) >= 0.005) all.push({ teamId: h.teamId, from, to: h.pGold, delta });
  }
  const up = all.filter(m => m.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, limit);
  const down = all.filter(m => m.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, limit);
  return { up, down };
}
