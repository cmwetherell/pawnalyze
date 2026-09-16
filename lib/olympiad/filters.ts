import { MAX_PICKS, N_ROUNDS } from './config';
import type { Match, Outcome, Pick } from './types';

const TOKEN_RE = /^(\d{1,2}):(\d{1,3}):([wdl])$/;

export const OUTCOME_OP: Record<Outcome, '>' | '=' | '<'> = { w: '>', d: '=', l: '<' };

export const INVERT_OUTCOME: Record<Outcome, Outcome> = { w: 'l', d: 'd', l: 'w' };

export function pickKey(round: number, teamId: number): string {
  return `${round}:${teamId}`;
}

/** Deterministic, deduped encoding: sorted by round then team_id. */
export function encodePicks(picks: Pick[]): string {
  const byKey = new Map<string, Pick>();
  for (const p of picks) byKey.set(pickKey(p.round, p.teamId), p);
  return Array.from(byKey.values())
    .sort((a, b) => a.round - b.round || a.teamId - b.teamId)
    .map(p => `${p.round}:${p.teamId}:${p.outcome}`)
    .join(',');
}

export type ParseResult = { ok: true; picks: Pick[] } | { ok: false; error: string };

export function parseFilters(
  param: string | null | undefined,
  opts: { roundsCompleted: number; nTeams: number; participantIds?: Set<number> },
): ParseResult {
  if (!param) return { ok: true, picks: [] };
  const tokens = param.split(',').filter(Boolean);
  if (tokens.length > MAX_PICKS) return { ok: false, error: `At most ${MAX_PICKS} picks are allowed` };

  const seen = new Set<string>();
  const picks: Pick[] = [];
  for (const token of tokens) {
    const m = TOKEN_RE.exec(token);
    if (!m) return { ok: false, error: `Malformed pick "${token}"` };
    const round = Number(m[1]);
    const teamId = Number(m[2]);
    const outcome = m[3] as Outcome;
    if (round < 1 || round > N_ROUNDS) return { ok: false, error: `Round out of range in "${token}"` };
    if (round <= opts.roundsCompleted) return { ok: false, error: `Round ${round} is already complete` };
    if (teamId < 1 || teamId > opts.nTeams) return { ok: false, error: `Unknown team in "${token}"` };
    if (opts.participantIds && !opts.participantIds.has(teamId)) {
      return { ok: false, error: `Team ${teamId} is not participating` };
    }
    const key = pickKey(round, teamId);
    if (seen.has(key)) return { ok: false, error: `Duplicate pick for ${key}` };
    seen.add(key);
    picks.push({ round, teamId, outcome });
  }
  return { ok: true, picks };
}

/**
 * When a published pairing exists for (round, teamId) and the team is team2 of that match,
 * store the pick from team1's perspective so both builder views share one key.
 */
export function normalizePick(pick: Pick, matches: Match[]): Pick {
  const match = matches.find(
    m => m.round === pick.round && (m.team1Id === pick.teamId || m.team2Id === pick.teamId),
  );
  if (!match || match.team1Id === pick.teamId || match.team2Id === null) return pick;
  return { round: pick.round, teamId: match.team1Id, outcome: INVERT_OUTCOME[pick.outcome] };
}

/** Read the outcome for (round, teamId) from a normalized pick map, inverting for team2 of a pairing. */
export function outcomeFor(
  picks: Map<string, Pick>,
  round: number,
  teamId: number,
  matches: Match[],
): Outcome | null {
  const direct = picks.get(pickKey(round, teamId));
  if (direct) return direct.outcome;
  const match = matches.find(m => m.round === round && m.team2Id === teamId);
  if (!match) return null;
  const viaTeam1 = picks.get(pickKey(round, match.team1Id));
  return viaTeam1 ? INVERT_OUTCOME[viaTeam1.outcome] : null;
}
