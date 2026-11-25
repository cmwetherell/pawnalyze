import type { Match, Team, WdlCounts } from '@/lib/olympiad/types';

export function matchesTeam(team: Team, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return team.name.toLowerCase().includes(q) || team.fedCode.toLowerCase().startsWith(q);
}

/** Either team of the match answers to the query. */
export function matchHasTeam(m: Match, teamsById: Map<number, Team>, query: string): boolean {
  if (!query.trim()) return true;
  return [m.team1Id, m.team2Id].some(id => {
    const t = id !== null ? teamsById.get(id) : undefined;
    return t !== undefined && matchesTeam(t, query);
  });
}

export function shortTeamName(name: string): string {
  return name
    .replace('United States of America', 'United States')
    .replace('Bosnia and Herzegovina', 'Bosnia & Herz.')
    .replace('Democratic Republic of the Congo', 'DR Congo')
    .replace('Saint Vincent and the Grenadines', 'St Vincent')
    .replace('Trinidad & Tobago', 'Trinidad')
    .replace('FIDE/UNHCR Refugee Team', 'Refugee Team');
}

/** Federation code, plus the squad number for second and third teams ("UZB 2"). */
export function codeLabel(team: Team): string {
  const squad = /\s(\d)$/.exec(team.name)?.[1];
  return squad ? `${team.fedCode} ${squad}` : team.fedCode;
}

/** The name at the start of a sentence: "The United States". */
export function sentenceName(name: string): string {
  const short = shortTeamName(name);
  return /^(United|Netherlands|Philippines|Bahamas|Maldives|Gambia|Seychelles)|Republic|Islands/.test(short) ? `The ${short}` : short;
}

/** Win, draw and loss as shares of 1, from the first team's side. */
export interface WinProbs { w: number; d: number; l: number }

export function toProbs(c: WdlCounts | undefined): WinProbs | null {
  if (!c) return null;
  const n = Math.max(1, c.w + c.d + c.l);
  return { w: c.w / n, d: c.d / n, l: c.l / n };
}
