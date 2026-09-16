import type { DerivedStanding, Match, Outcome, Team } from './types';

export function matchPointsFor(score: number | null, oppScore: number | null): number {
  if (score === null || oppScore === null) return 0;
  if (score > oppScore) return 2;
  if (score === oppScore) return 1;
  return 0;
}

export function outcomeFromScores(score: number | null, oppScore: number | null): Outcome | null {
  if (score === null || oppScore === null) return null;
  if (score > oppScore) return 'w';
  if (score === oppScore) return 'd';
  return 'l';
}

/** Format half-points as "2½". */
export function formatHalf(hp: number | null): string {
  if (hp === null) return '–';
  const whole = Math.floor(hp / 2);
  const half = hp % 2 === 1;
  if (whole === 0 && half) return '½';
  return `${whole}${half ? '½' : ''}`;
}

export function formatMatchScore(a: number | null, b: number | null): string {
  if (a === null || b === null) return '–';
  return `${formatHalf(a)}–${formatHalf(b)}`;
}

/**
 * Unofficial live standings from final matches: MP desc, GP desc, seed asc.
 * Byes (team2 null) count as a match win worth 2 MP and whatever score is stored (default 8 half-points).
 */
export function deriveStandings(
  matches: Match[],
  teams: Team[],
  participantIds?: Set<number>,
): Map<number, DerivedStanding> {
  const rows = new Map<number, DerivedStanding>();
  for (const t of teams) {
    if (participantIds && !participantIds.has(t.teamId)) continue;
    rows.set(t.teamId, { teamId: t.teamId, mp: 0, gpHalf: 0, played: 0, rank: 0 });
  }

  for (const m of matches) {
    if (m.status !== 'final') continue;
    const r1 = rows.get(m.team1Id);
    if (m.team2Id === null) {
      if (r1) {
        r1.mp += 2;
        r1.gpHalf += m.team1Score ?? 8;
        r1.played += 1;
      }
      continue;
    }
    const r2 = rows.get(m.team2Id);
    if (m.team1Score === null || m.team2Score === null) continue;
    if (r1) {
      r1.mp += matchPointsFor(m.team1Score, m.team2Score);
      r1.gpHalf += m.team1Score;
      r1.played += 1;
    }
    if (r2) {
      r2.mp += matchPointsFor(m.team2Score, m.team1Score);
      r2.gpHalf += m.team2Score;
      r2.played += 1;
    }
  }

  const sorted = Array.from(rows.values()).sort(
    (a, b) => b.mp - a.mp || b.gpHalf - a.gpHalf || a.teamId - b.teamId,
  );
  sorted.forEach((row, i) => { row.rank = i + 1; });
  return rows;
}

export interface TeamRoundEntry {
  round: number;
  boardNo: number;
  opponentId: number | null;
  /** Team is team1 (white on board 1) */
  isTeam1: boolean;
  score: number | null;
  oppScore: number | null;
  status: Match['status'];
  outcome: Outcome | null;
}

export function teamRoundHistory(matches: Match[], teamId: number): TeamRoundEntry[] {
  const entries: TeamRoundEntry[] = [];
  for (const m of matches) {
    if (m.team1Id !== teamId && m.team2Id !== teamId) continue;
    const isTeam1 = m.team1Id === teamId;
    const score = isTeam1 ? m.team1Score : m.team2Score;
    const oppScore = isTeam1 ? m.team2Score : m.team1Score;
    entries.push({
      round: m.round,
      boardNo: m.boardNo,
      opponentId: isTeam1 ? m.team2Id : m.team1Id,
      isTeam1,
      score,
      oppScore,
      status: m.status,
      outcome: m.team2Id === null ? 'w' : outcomeFromScores(score, oppScore),
    });
  }
  return entries.sort((a, b) => a.round - b.round);
}

/**
 * Match picker order: combined match points desc, then combined average rating desc, then board number.
 * Pre-tournament every team has 0 MP, so this is pure rating order.
 */
export function sortMatchesForPicker(
  matches: Match[],
  standings: Map<number, DerivedStanding>,
  teamsById: Map<number, Team>,
): Match[] {
  const key = (m: Match) => {
    const t1 = teamsById.get(m.team1Id);
    const t2 = m.team2Id !== null ? teamsById.get(m.team2Id) : undefined;
    const mp = (standings.get(m.team1Id)?.mp ?? 0) + (m.team2Id !== null ? standings.get(m.team2Id)?.mp ?? 0 : 0);
    const rating = (t1?.avgRating ?? 0) + (t2?.avgRating ?? 0);
    return { mp, rating };
  };
  return [...matches].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    return kb.mp - ka.mp || kb.rating - ka.rating || a.boardNo - b.boardNo;
  });
}

export function roundsWithPairings(matches: Match[]): Set<number> {
  return new Set(matches.map(m => m.round));
}

export function roundIsFinal(matches: Match[], round: number): boolean {
  const inRound = matches.filter(m => m.round === round);
  return inRound.length > 0 && inRound.every(m => m.status === 'final');
}
