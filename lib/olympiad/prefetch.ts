'use client';

import { cachedJson } from './clientCache';
import type { OlympiadEvent, TeamDetail, TeamOpponents } from './types';

/** Warm both spotlight requests for a team so opening it is instant. Safe to call repeatedly. */
export function prefetchTeam(event: OlympiadEvent, runId: number, teamId: number, filtersKey: string): void {
  const params = new URLSearchParams({ event, run: String(runId), teamId: String(teamId) });
  if (filtersKey) params.set('filters', filtersKey);
  const qs = params.toString();
  cachedJson<TeamDetail>(`detail|${event}|${runId}|${teamId}|${filtersKey}`, `/api/sims/olympiad-2026/team?${qs}`).catch(() => {});
  cachedJson<TeamOpponents>(`opp|${event}|${runId}|${teamId}|${filtersKey}`, `/api/sims/olympiad-2026/opponents?${qs}`).catch(() => {});
}
