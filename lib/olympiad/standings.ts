import type { DerivedStanding, Match, OfficialStandings, Outcome, Run, Team } from './types';

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
 * Live standings from final matches: MP desc, GP desc, seed asc.
 * A pairing-allocated bye (team2 null) scores 1 MP and 2 GP, as on chess-results; the stored
 * team1_score carries the half-points (default 4).
 * When the official chess-results table covers exactly the rounds that have finished, its rank
 * (which applies the real tiebreaks) replaces the derived order; mid-round the derived order stands.
 */
export function deriveStandings(
  matches: Match[],
  teams: Team[],
  participantIds?: Set<number>,
  official?: OfficialStandings | null,
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
        r1.mp += 1;
        r1.gpHalf += m.team1Score ?? 4;
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

  if (official?.official && official.afterRound === completedRound(matches)) {
    // Only adopt the official table if it agrees with what the matches say, so rank never contradicts MP.
    const agrees = official.rows.every(o => {
      const row = rows.get(o.teamId);
      return !row || (row.mp === o.mp && row.gpHalf === o.gpHalf);
    });
    if (agrees) {
      for (const o of official.rows) {
        const row = rows.get(o.teamId);
        if (row) { row.rank = o.rank; row.official = true; }
      }
    }
  }
  return rows;
}

/** Latest round in which every published pairing has a final result (0 before round 1 finishes). */
export function completedRound(matches: Match[]): number {
  let last = 0;
  for (const m of matches) {
    if (m.projected) continue;
    if (m.status === 'final' && m.round > last) last = m.round;
  }
  while (last > 0 && matches.some(m => !m.projected && m.round === last && m.status !== 'final')) last -= 1;
  return last;
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
  projected: boolean;
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
      outcome: m.team2Id === null ? 'd' : outcomeFromScores(score, oppScore), // a bye is worth a draw
      projected: m.projected === true,
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


/**
 * Teams that exist in the current run's numbering. chess-results renumbers seeds when a team
 * withdraws, and the pipeline upserts by team_id, so rows above run.n_teams are stale leftovers.
 */
export function teamsInRun(teams: Team[], run: Run | null): Team[] {
  if (!run) return teams;
  return teams.filter(t => t.teamId <= run.nTeams);
}
