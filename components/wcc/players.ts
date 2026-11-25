import type { FaceOffSide } from '@/components/chess/FaceOff';
import type { OddsSide } from '@/components/chess/OddsChip';
import { MATCH_RATINGS, PLAYER_DEFAULTS } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import { WCC_PHOTOS } from '@/lib/wcc/photos';
import type { PlayerId, WccPlayer, WccRun } from '@/lib/wcc/types';

/** Display data for both players: DB rows, falling back to config; ratings from the run the odds use, else the match-start ratings. */
export function resolvePlayers(rows: WccPlayer[], run: WccRun | null): Players {
  const out = {} as Players;
  for (const id of [1, 2] as PlayerId[]) {
    const d = PLAYER_DEFAULTS[id];
    const row = rows.find(r => r.playerId === id);
    const key = String(id) as '1' | '2';
    const r = run?.params.ratings?.[key];
    const isChampion = row?.isChampion ?? id === 1;
    out[id] = {
      id,
      name: row?.name ?? d.name,
      shortName: row?.shortName ?? d.shortName,
      fedCode: row?.fedCode ?? d.fedCode,
      country: d.country,
      role: isChampion ? 'World Champion' : 'Challenger',
      isChampion,
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

const PHOTOS = { 1: WCC_PHOTOS.gukesh, 2: WCC_PHOTOS.sindarov } as const;

/** Both sides of the face-off: hero, home and index. */
export function faceOffSides(players: Players): [FaceOffSide, FaceOffSide] {
  const side = (id: PlayerId): FaceOffSide => {
    const p = players[id];
    const { src, alt } = PHOTOS[id].cutout;
    return {
      id, name: p.shortName, role: p.role, isChampion: p.isChampion, rating: p.ratings.classical || null,
      flag: p.fedCode, country: p.country, portrait: { src, alt, cutout: true },
    };
  };
  return [side(1), side(2)];
}

/** What the pawns under every face-off mean. */
export const PAWN_NOTE = 'Chance to win the match. Each pawn is 1\u00a0in\u00a0100.';

/** The credit line under every face-off. */
export const FACE_OFF_PHOTOS = [WCC_PHOTOS.gukesh.cutout, WCC_PHOTOS.sindarov.cutout];
export const FACE_OFF_CHANGES = 'Backgrounds removed, black and white';

export const oddsSides = (players: Players, pWin1: number): [OddsSide, OddsSide] => [
  { name: players[1].shortName, p: pWin1, tone: 'p1' },
  { name: players[2].shortName, p: 1 - pWin1, tone: 'p2' },
];
