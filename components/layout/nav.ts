export interface NavLink { href: string; label: string; external?: boolean }

/** The site's one list of destinations: header, full-screen menu and footer. */
export const MAIN_LINKS: NavLink[] = [
  { href: '/world-chess-championship-2026', label: 'World Championship' },
  { href: '/simulations', label: 'Simulations' },
  { href: '/elocator', label: 'Elocator' },
  { href: '/about', label: 'About' },
  { href: 'https://blog.pawnalyze.com', label: 'Blog', external: true },
];

/** This year's events, newest first: menu and footer. */
export const TOURNAMENT_LINKS: NavLink[] = [
  { href: '/world-chess-championship-2026', label: 'World Championship 2026' },
  { href: '/simulations/chess-olympiad-2026', label: 'Chess Olympiad 2026' },
  { href: '/simulations/womens-chess-olympiad-2026', label: 'Women’s Chess Olympiad 2026' },
  { href: '/simulations/candidates-2026', label: '2026 Candidates' },
  { href: '/simulations/womens-candidates-2026', label: '2026 Women’s Candidates' },
];

export const FOOTER_GROUPS: { title: string; links: NavLink[] }[] = [
  {
    title: 'Tools',
    links: [
      { href: '/simulations', label: 'Simulations' },
      { href: '/elocator', label: 'Elocator' },
      { href: 'https://blog.pawnalyze.com', label: 'Blog', external: true },
    ],
  },
  { title: 'Tournaments', links: TOURNAMENT_LINKS },
];

export const SOCIAL_LINKS = [
  { href: 'https://www.twitter.com/pawnalyze', label: 'X', icon: 'x' },
  { href: 'https://www.github.com/cmwetherell/pawnalyze', label: 'GitHub', icon: 'github' },
] as const;

export const isCurrent = (pathname: string | null, href: string): boolean =>
  href.startsWith('/') && (pathname === href || (pathname?.startsWith(`${href}/`) ?? false));
