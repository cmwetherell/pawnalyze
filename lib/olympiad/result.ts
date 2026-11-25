import { N_ROUNDS } from './config';
import { getOlympiadOfficialStandings, getOlympiadStatus, getOlympiadSummary, getOlympiadSummaryHistory, getOlympiadTeams } from './queries';
import { teamsInRun } from './standings';
import type { OlympiadEvent, Team } from './types';

export interface OlympiadResult {
  state: 'upcoming' | 'live' | 'final';
  round: number;
  nSims: number | null;
  nTeams: number;
  /** The medallists once it is over; until then the eight highest seeds. */
  teams: Team[];
  /** The champion, or while it is played the team with the best chance of gold. */
  leader: Team | null;
  /** The leader's chance of gold: before round 1 once it is over, else now. */
  chance: number | null;
}

/** What a list of events says about one Olympiad. */
export async function getOlympiadResult(event: OlympiadEvent): Promise<OlympiadResult> {
  const [status, allTeams, standings] = await Promise.all([getOlympiadStatus(event), getOlympiadTeams(event), getOlympiadOfficialStandings(event)]);
  const teams = teamsInRun(allTeams, status.run);
  const final = status.lastFinalRound >= N_ROUNDS;
  const state = final ? 'final' : status.lastFinalRound > 0 || status.anyLive ? 'live' : 'upcoming';
  const base = { state, round: status.lastFinalRound, nSims: status.run?.nSims ?? null, nTeams: teams.length } as const;

  if (final) {
    const medallists = (standings?.rows ?? []).filter(r => r.rank <= 3).sort((a, b) => a.rank - b.rank).flatMap(r => teams.find(t => t.teamId === r.teamId) ?? []);
    const leader = teams.find(t => t.teamId === standings?.rows.find(r => r.rank === 1)?.teamId) ?? null;
    const history = leader ? await getOlympiadSummaryHistory(event) : [];
    const chance = history.find(h => h.roundsCompleted === 0 && h.teamId === leader?.teamId)?.pGold ?? null;
    return { ...base, teams: medallists.length > 0 ? medallists : teams.slice(0, 8), leader, chance };
  }
  const best = state === 'live' && status.run ? (await getOlympiadSummary(event, status.run.runId)).reduce<{ teamId: number; pGold: number } | null>((a, t) => (a && a.pGold >= t.pGold ? a : t), null) : null;
  return { ...base, teams: teams.slice(0, 8), leader: best ? teams.find(t => t.teamId === best.teamId) ?? null : null, chance: best?.pGold ?? null };
}
