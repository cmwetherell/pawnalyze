export type PlayerInfo = {
  color: string;
  shortName: string;
  initials: string;
  federation: string;
};

// Tailwind 500-level inspired palette — 8 highly distinguishable colors
export const PLAYER_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
] as const;

export const PLAYER_DATA: Record<string, PlayerInfo> = {
  // ── Candidates 2026 (Open) ──
  'Nakamura, Hikaru':    { color: PLAYER_COLORS[0], shortName: 'Nakamura',       initials: 'HN', federation: 'USA' },
  'Caruana, Fabiano':    { color: PLAYER_COLORS[1], shortName: 'Caruana',        initials: 'FC', federation: 'USA' },
  'Giri, Anish':         { color: PLAYER_COLORS[2], shortName: 'Giri',           initials: 'AG', federation: 'NED' },
  'Praggnanandhaa R':    { color: PLAYER_COLORS[3], shortName: 'Pragg',          initials: 'PR', federation: 'IND' },
  'Wei, Yi':             { color: PLAYER_COLORS[4], shortName: 'Wei Yi',         initials: 'WY', federation: 'CHN' },
  'Esipenko, Andrey':    { color: PLAYER_COLORS[5], shortName: 'Esipenko',       initials: 'AE', federation: 'FID' },
  'Bluebaum, Matthias':  { color: PLAYER_COLORS[6], shortName: 'Bluebaum',       initials: 'MB', federation: 'GER' },
  'Sindarov, Javokhir':  { color: PLAYER_COLORS[7], shortName: 'Sindarov',       initials: 'JS', federation: 'UZB' },

  // ── Candidates 2026 (Women's) ──
  'Goryachkina, Aleksandra': { color: PLAYER_COLORS[0], shortName: 'Goryachkina', initials: 'AG', federation: 'FID' },
  'Koneru, Humpy':           { color: PLAYER_COLORS[1], shortName: 'Koneru',       initials: 'HK', federation: 'IND' },
  'Tan, Zhongyi':            { color: PLAYER_COLORS[2], shortName: 'Tan',          initials: 'TZ', federation: 'CHN' },
  'Lagno, Kateryna':         { color: PLAYER_COLORS[3], shortName: 'Lagno',        initials: 'KL', federation: 'FID' },
  'Rameshbabu, Vaishali':    { color: PLAYER_COLORS[4], shortName: 'Vaishali',     initials: 'RV', federation: 'IND' },
  'Assaubayeva, Bibisara':   { color: PLAYER_COLORS[5], shortName: 'Assaubayeva',  initials: 'BA', federation: 'KAZ' },
  'Zhu, Jiner':              { color: PLAYER_COLORS[6], shortName: 'Zhu',          initials: 'JZ', federation: 'CHN' },
  'Deshmukh, Divya':         { color: PLAYER_COLORS[7], shortName: 'Deshmukh',     initials: 'DD', federation: 'IND' },

  // ── Candidates 2024 (Open) ──
  'Nepomniachtchi, Ian':  { color: PLAYER_COLORS[0], shortName: 'Nepo',       initials: 'IN', federation: 'FID' },
  'Gukesh D':             { color: PLAYER_COLORS[1], shortName: 'Gukesh',     initials: 'GD', federation: 'IND' },
  'Firouzja, Alireza':    { color: PLAYER_COLORS[2], shortName: 'Firouzja',   initials: 'AF', federation: 'FRA' },
  'Vidit, Santosh Gujrathi': { color: PLAYER_COLORS[3], shortName: 'Vidit',   initials: 'VG', federation: 'IND' },
  'Abasov, Nijat':        { color: PLAYER_COLORS[4], shortName: 'Abasov',     initials: 'NA', federation: 'AZE' },
  'Nakamura, Hikaru_2024': { color: PLAYER_COLORS[0], shortName: 'Nakamura',  initials: 'HN', federation: 'USA' }, // fallback key, actual name same
  // These will fall through to getPlayerColor() for any not matched

  // ── Candidates 2024 (Women's) ──
  'Zhongyi, Tan':         { color: PLAYER_COLORS[2], shortName: 'Tan',        initials: 'TZ', federation: 'CHN' },
  'Lei, Tingjie':         { color: PLAYER_COLORS[0], shortName: 'Lei',        initials: 'TL', federation: 'CHN' },
  'Vaishali, R':          { color: PLAYER_COLORS[4], shortName: 'Vaishali',   initials: 'RV', federation: 'IND' },
  'Salimova, Nurgyul':    { color: PLAYER_COLORS[5], shortName: 'Salimova',   initials: 'NS', federation: 'BUL' },
};

/** Get player color from PLAYER_DATA, with a stable fallback for unknown players */
export function getPlayerColor(name: string, index: number): string {
  return PLAYER_DATA[name]?.color ?? PLAYER_COLORS[index % PLAYER_COLORS.length];
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

/** Build a color map from player names array (preserves order-based assignment) */
export function buildPlayerColorMap(playerNames: string[]): Record<string, string> {
  return playerNames.reduce<Record<string, string>>((acc, name, i) => {
    acc[name] = getPlayerColor(name, i);
    return acc;
  }, {});
}
