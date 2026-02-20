export type PlayerInfo = {
  color: string;
  shortName: string;
  initials: string;
  federation: string;
  /** Filename slug for headshot in /public/players/ (e.g. "nakamura" → /players/nakamura.jpg) */
  photo: string;
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
  'Nakamura, Hikaru':    { color: PLAYER_COLORS[0], shortName: 'Nakamura',       initials: 'HN', federation: 'USA', photo: 'nakamura' },
  'Caruana, Fabiano':    { color: PLAYER_COLORS[1], shortName: 'Caruana',        initials: 'FC', federation: 'USA', photo: 'caruana' },
  'Giri, Anish':         { color: PLAYER_COLORS[2], shortName: 'Giri',           initials: 'AG', federation: 'NED', photo: 'giri' },
  'Praggnanandhaa R':    { color: PLAYER_COLORS[3], shortName: 'Pragg',          initials: 'PR', federation: 'IND', photo: 'praggnanandhaa' },
  'Wei, Yi':             { color: PLAYER_COLORS[4], shortName: 'Wei Yi',         initials: 'WY', federation: 'CHN', photo: 'wei-yi' },
  'Esipenko, Andrey':    { color: PLAYER_COLORS[5], shortName: 'Esipenko',       initials: 'AE', federation: 'FID', photo: 'esipenko' },
  'Bluebaum, Matthias':  { color: PLAYER_COLORS[6], shortName: 'Bluebaum',       initials: 'MB', federation: 'GER', photo: 'bluebaum' },
  'Sindarov, Javokhir':  { color: PLAYER_COLORS[7], shortName: 'Sindarov',       initials: 'JS', federation: 'UZB', photo: 'sindarov' },

  // ── Candidates 2026 (Women's) ──
  'Goryachkina, Aleksandra': { color: PLAYER_COLORS[0], shortName: 'Goryachkina', initials: 'AG', federation: 'FID', photo: 'goryachkina' },
  'Koneru, Humpy':           { color: PLAYER_COLORS[1], shortName: 'Koneru',       initials: 'HK', federation: 'IND', photo: 'koneru' },
  'Tan, Zhongyi':            { color: PLAYER_COLORS[2], shortName: 'Tan',          initials: 'TZ', federation: 'CHN', photo: 'tan-zhongyi' },
  'Lagno, Kateryna':         { color: PLAYER_COLORS[3], shortName: 'Lagno',        initials: 'KL', federation: 'FID', photo: 'lagno' },
  'Rameshbabu, Vaishali':    { color: PLAYER_COLORS[4], shortName: 'Vaishali',     initials: 'RV', federation: 'IND', photo: 'vaishali' },
  'Assaubayeva, Bibisara':   { color: PLAYER_COLORS[5], shortName: 'Assaubayeva',  initials: 'BA', federation: 'KAZ', photo: 'assaubayeva' },
  'Zhu, Jiner':              { color: PLAYER_COLORS[6], shortName: 'Zhu',          initials: 'JZ', federation: 'CHN', photo: 'zhu-jiner' },
  'Deshmukh, Divya':         { color: PLAYER_COLORS[7], shortName: 'Deshmukh',     initials: 'DD', federation: 'IND', photo: 'deshmukh' },

  // ── Candidates 2024 (Open) ──
  'Nepomniachtchi, Ian':  { color: PLAYER_COLORS[0], shortName: 'Nepo',       initials: 'IN', federation: 'FID', photo: 'nepomniachtchi' },
  'Gukesh D':             { color: PLAYER_COLORS[1], shortName: 'Gukesh',     initials: 'GD', federation: 'IND', photo: 'gukesh' },
  'Firouzja, Alireza':    { color: PLAYER_COLORS[2], shortName: 'Firouzja',   initials: 'AF', federation: 'FRA', photo: 'firouzja' },
  'Vidit, Santosh Gujrathi': { color: PLAYER_COLORS[3], shortName: 'Vidit',   initials: 'VG', federation: 'IND', photo: 'vidit' },
  'Abasov, Nijat':        { color: PLAYER_COLORS[4], shortName: 'Abasov',     initials: 'NA', federation: 'AZE', photo: 'abasov' },
  'Nakamura, Hikaru_2024': { color: PLAYER_COLORS[0], shortName: 'Nakamura',  initials: 'HN', federation: 'USA', photo: 'nakamura' },
  // These will fall through to getPlayerColor() for any not matched

  // ── Candidates 2024 (Women's) ──
  'Zhongyi, Tan':         { color: PLAYER_COLORS[2], shortName: 'Tan',        initials: 'TZ', federation: 'CHN', photo: 'tan-zhongyi' },
  'Lei, Tingjie':         { color: PLAYER_COLORS[0], shortName: 'Lei',        initials: 'TL', federation: 'CHN', photo: 'lei-tingjie' },
  'Vaishali, R':          { color: PLAYER_COLORS[4], shortName: 'Vaishali',   initials: 'RV', federation: 'IND', photo: 'vaishali' },
  'Salimova, Nurgyul':    { color: PLAYER_COLORS[5], shortName: 'Salimova',   initials: 'NS', federation: 'BUL', photo: 'salimova' },
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

/** Get the photo path for a player, or null if not in PLAYER_DATA */
export function getPlayerPhoto(name: string): string | null {
  const slug = PLAYER_DATA[name]?.photo;
  return slug ? `/players/${slug}.jpg` : null;
}

/** Build a color map from player names array (preserves order-based assignment) */
export function buildPlayerColorMap(playerNames: string[]): Record<string, string> {
  return playerNames.reduce<Record<string, string>>((acc, name, i) => {
    acc[name] = getPlayerColor(name, i);
    return acc;
  }, {});
}
