import { MATCH_RATINGS, PLAYER_DEFAULTS } from '@/lib/wcc/config';
import type { PlayerId, WccPlayer, WccRun } from '@/lib/wcc/types';
import type { Players } from './ui';

/** Display data for both players: DB rows, falling back to config; ratings from the run the odds use, else the match-start ratings. */
export function resolvePlayers(rows: WccPlayer[], run: WccRun | null): Players {
  const out = {} as Players;
  for (const id of [1, 2] as PlayerId[]) {
    const d = PLAYER_DEFAULTS[id];
    const row = rows.find(r => r.playerId === id);
    const key = String(id) as '1' | '2';
    const r = run?.params.ratings?.[key];
    out[id] = {
      id,
      name: row?.name ?? d.name,
      shortName: row?.shortName ?? d.shortName,
      fedCode: row?.fedCode ?? d.fedCode,
      country: d.country,
      role: (row?.isChampion ?? id === 1) ? 'World Champion' : 'Challenger · Candidates winner',
      isChampion: row?.isChampion ?? id === 1,
      fideId: row?.fideId ?? d.fideId,
      // The run's ratings are the ones the odds were computed from; the table may be newer.
      ratings: {
        classical: r?.c ?? MATCH_RATINGS[key].c,
        rapid: r?.r ?? MATCH_RATINGS[key].r,
        blitz: r?.b ?? MATCH_RATINGS[key].b,
      },
    };
  }
  return out;
}
