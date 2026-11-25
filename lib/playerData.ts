import { seriesTone, type Tone } from '@/lib/theme/tones';

export type PlayerInfo = {
  tone: Tone;
  shortName: string;
  initials: string;
  federation: string;
  /** Filename for headshot in /public/players/ (e.g. "nakamura.webp" → /players/nakamura.webp); without one the initials stand in */
  photo?: string;
  /** The full name in print, where the stored one cannot simply be turned round. */
  fullName?: string;
};

export const PLAYER_DATA: Record<string, PlayerInfo> = {
  // ── Candidates 2026 (Open) ──
  'Nakamura, Hikaru':    { tone: 'series-2', shortName: 'Nakamura',       initials: 'HN', federation: 'USA', photo: 'nakamura.webp' },
  'Caruana, Fabiano':    { tone: 'series-8', shortName: 'Caruana',        initials: 'FC', federation: 'USA', photo: 'caruana.webp' },
  'Giri, Anish':         { tone: 'series-3', shortName: 'Giri',           initials: 'AG', federation: 'NED', photo: 'giri.webp' },
  'Praggnanandhaa R':    { tone: 'series-4', shortName: 'Pragg',          initials: 'PR', federation: 'IND', photo: 'praggnanandhaa.webp' },
  'Wei, Yi':             { tone: 'series-6', shortName: 'Wei Yi',         initials: 'WY', federation: 'CHN', photo: 'wei-yi.webp' },
  'Esipenko, Andrey':    { tone: 'series-5', shortName: 'Esipenko',       initials: 'AE', federation: 'FID', photo: 'esipenko.webp' },
  'Bluebaum, Matthias':  { tone: 'series-7', shortName: 'Bluebaum',       initials: 'MB', federation: 'GER', photo: 'bluebaum.webp' },
  'Sindarov, Javokhir':  { tone: 'series-1', shortName: 'Sindarov',       initials: 'JS', federation: 'UZB', photo: 'sindarov.webp' },

  // ── Candidates 2026 (Women's) ──
  'Goryachkina, Aleksandra': { tone: 'series-1', shortName: 'Goryachkina', initials: 'AG', federation: 'FID', photo: 'goryachkina.webp' },
  'Muzychuk, Anna':          { tone: 'series-8', shortName: 'Muzychuk',     initials: 'AM', federation: 'UKR' },
  'Tan, Zhongyi':            { tone: 'series-3', shortName: 'Tan',          initials: 'TZ', federation: 'CHN', photo: 'tan-zhongyi.webp' },
  'Lagno, Kateryna':         { tone: 'series-4', shortName: 'Lagno',        initials: 'KL', federation: 'FID', photo: 'lagno.webp' },
  'Rameshbabu, Vaishali':    { tone: 'series-6', shortName: 'Vaishali',     initials: 'RV', federation: 'IND', photo: 'vaishali.webp' },
  'Assaubayeva, Bibisara':   { tone: 'series-5', shortName: 'Assaubayeva',  initials: 'BA', federation: 'KAZ', photo: 'assaubayeva.webp' },
  'Zhu, Jiner':              { tone: 'series-7', shortName: 'Zhu',          initials: 'JZ', federation: 'CHN', photo: 'zhu-jiner.webp' },
  'Deshmukh, Divya':         { tone: 'series-2', shortName: 'Deshmukh',     initials: 'DD', federation: 'IND', photo: 'deshmukh.webp' },

  // ── Candidates 2024 (Open) ──
  'Nepomniachtchi, Ian':  { tone: 'series-1', shortName: 'Nepo',       initials: 'IN', federation: 'FID' },
  'Gukesh D':             { tone: 'series-2', shortName: 'Gukesh',     initials: 'GD', federation: 'IND', photo: 'gukesh.webp' },
  'Firouzja, Alireza':    { tone: 'series-3', shortName: 'Firouzja',   initials: 'AF', federation: 'FRA' },
  'Vidit, Santosh Gujrathi': { tone: 'series-4', shortName: 'Vidit',   initials: 'VG', federation: 'IND', fullName: 'Vidit Gujrathi' },
  'Abasov, Nijat':        { tone: 'series-6', shortName: 'Abasov',     initials: 'NA', federation: 'AZE' },
  'Nakamura, Hikaru_2024': { tone: 'series-2', shortName: 'Nakamura',  initials: 'HN', federation: 'USA', photo: 'nakamura.webp' },

  // ── Candidates 2024 (Women's) ──
  'Zhongyi, Tan':         { tone: 'series-3', shortName: 'Tan',        initials: 'TZ', federation: 'CHN', photo: 'tan-zhongyi.webp' },
  'Koneru, Humpy':        { tone: 'series-2', shortName: 'Koneru',     initials: 'HK', federation: 'IND', photo: 'koneru.jpg' },
  'Lei, Tingjie':         { tone: 'series-1', shortName: 'Lei',        initials: 'TL', federation: 'CHN' },
  'Vaishali, R':          { tone: 'series-6', shortName: 'Vaishali',   initials: 'RV', federation: 'IND', photo: 'vaishali.webp' },
  'Salimova, Nurgyul':    { tone: 'series-5', shortName: 'Salimova',   initials: 'NS', federation: 'BUL' },
};

/** A player's own tone, with a stable one for players who are not listed. */
export function getPlayerTone(name: string, index: number): Tone {
  return PLAYER_DATA[name]?.tone ?? seriesTone(index % 8);
}

/** Written family name first in print too. */
const FAMILY_FIRST = new Set(['CHN']);

/** "Javokhir Sindarov", "Tan Zhongyi" */
export function getPlayerName(name: string): string {
  const info = PLAYER_DATA[name];
  if (info?.fullName) return info.fullName;
  const [family, given] = name.split(',').map(s => s.trim());
  if (!given) return family;
  return info && FAMILY_FIRST.has(info.federation) ? `${family} ${given}` : `${given} ${family}`;
}

export function getPlayerShortName(name: string): string {
  return PLAYER_DATA[name]?.shortName ?? name.split(',')[0].trim();
}

/** FIDE federation code. */
export function getPlayerFederation(name: string): string | null {
  return PLAYER_DATA[name]?.federation ?? null;
}

/** Get player initials from PLAYER_DATA, with auto-generation fallback */
export function getPlayerInitials(name: string): string {
  if (PLAYER_DATA[name]?.initials) return PLAYER_DATA[name].initials;
  // Auto-generate: "Last, First" → "FL" or "First Last" → "FL"
  const parts = name.includes(',')
    ? name.split(',').map(s => s.trim()).reverse()
    : name.split(' ');
  return parts
    .filter(Boolean)
    .map(p => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
}

/** Get the photo path for a player, or null if not in PLAYER_DATA */
export function getPlayerPhoto(name: string): string | null {
  const filename = PLAYER_DATA[name]?.photo;
  return filename ? `/players/${filename}` : null;
}

/**
 * One tone for each player of an event. A player keeps their own tone unless someone before them in the list has it already
 * (players of different years share tones); then they get the first free one.
 */
export function buildPlayerToneMap(playerNames: string[]): Record<string, Tone> {
  const map: Record<string, Tone> = {};
  const used = new Set<Tone>();
  const free = () => Array.from({ length: 8 }, (_, i) => seriesTone(i)).find(t => !used.has(t)) ?? 'context';
  const waiting: string[] = [];
  playerNames.forEach((name, i) => {
    const own = getPlayerTone(name, i);
    if (!PLAYER_DATA[name] || used.has(own)) { waiting.push(name); return; }
    map[name] = own;
    used.add(own);
  });
  for (const name of waiting) {
    map[name] = free();
    used.add(map[name]);
  }
  return map;
}
