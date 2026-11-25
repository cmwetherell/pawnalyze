import { FaGithub, FaXTwitter } from 'react-icons/fa6';

import { cn } from '@/lib/utils';

/** Stroked on a 24 grid unless listed in FILLED. */
const PATHS = {
  'arrow-right': 'M4 12h16M13.5 5.5 20 12l-6.5 6.5',
  'arrow-left': 'M20 12H4M10.5 5.5 4 12l6.500 6.500',
  external: 'M10 5H5v14h14v-5M14 4h6v6M20 4l-9 9',
  sun: 'M12 16.200a4.200 4.200 0 1 0 0-8.400 4.200 4.200 0 0 0 0 8.400ZM12 2.500v2M12 19.500v2M2.500 12h2M19.500 12h2M5.300 5.300l1.400 1.400M17.300 17.300l1.400 1.400M18.700 5.300l-1.400 1.400M6.700 17.300l-1.400 1.400',
  moon: 'M20 14.500A8.200 8.200 0 0 1 9.500 4 8.200 8.200 0 1 0 20 14.500Z',
  menu: 'M3.500 8h17M3.500 16h17',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-up': 'm6 15 6-6 6 6',
  'chevron-left': 'm15 6-6 6 6 6',
  'chevron-right': 'm9 6 6 6-6 6',
  check: 'm5 12.500 4.500 4.500L19 7.500',
  copy: 'M9 9h11v11H9zM15 9V4H4v11h5',
  link: 'M10 13.500a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10.500a4 4 0 0 0-5.700 0l-3 3A4 4 0 0 0 11 19.200l1-1',
  share: 'M12 15V4M7.500 8 12 3.500 16.500 8M5 12v8h14v-8',
  search: 'M11 17.500a6.500 6.500 0 1 0 0-13 6.500 6.500 0 0 0 0 13ZM20 20l-4.300-4.300',
  reset: 'M4 10a8.200 8.200 0 1 1-.2 4M4 4.500V10h5.500',
  flip: 'M8 4v16M4.500 7.500 8 4l3.500 3.500M16 20V4M12.500 16.500 16 20l3.500-3.500',
  sort: 'M8 9.500 12 5.500l4 4M8 14.500l4 4 4-4',
  clock: 'M12 20.500a8.500 8.500 0 1 0 0-17 8.500 8.500 0 0 0 0 17ZM12 7.500V12l3 2',
  calendar: 'M4.500 6h15v14h-15zM4.500 10.500h15M8.500 3.500V8M15.500 3.500V8',
  info: 'M12 20.500a8.500 8.500 0 1 0 0-17 8.500 8.500 0 0 0 0 17ZM12 11v5.500M12 7.800v.2',
  warning: 'M12 4 2.800 20h18.400L12 4ZM12 10v4.500M12 17.300v.2',
  error: 'M12 20.500a8.500 8.500 0 1 0 0-17 8.500 8.500 0 0 0 0 17ZM12 7.500v5.500M12 16.200v.2',
  medal: 'M12 21a5.500 5.500 0 1 0 0-11 5.500 5.500 0 0 0 0 11ZM8.800 10.700 5.500 3.500h4L12 9M15.200 10.700l3.300-7.200h-4L12 9',
  'half-circle': 'M12 20.500a8.500 8.500 0 1 0 0-17v17Z',
  circle: 'M12 20.500a8.500 8.500 0 1 0 0-17 8.500 8.500 0 0 0 0 17Z',
  list: 'M8.500 6.500h11M8.500 12h11M8.500 17.500h11M4.500 6.500h.1M4.500 12h.1M4.500 17.500h.1',
  first: 'M6 5v14M18.500 5.500 10 12l8.500 6.500z',
  last: 'M18 5v14M5.500 5.500 14 12l-8.500 6.500z',
  prev: 'M16.500 5.500 8 12l8.500 6.500z',
  next: 'M7.500 5.500 16 12l-8.500 6.500z',
  play: 'M7.500 4.500 19 12 7.500 19.500z',
  pause: 'M7 5h3.500v14H7zM13.500 5H17v14h-3.500z',
  up: 'M12 6.500 19.500 17.500h-15z',
  down: 'M12 17.500 4.500 6.500h15z',
  crown: 'M2.300 6.800 7 11l5-7.200L17 11l4.700-4.200L19.800 19.500H4.200z',
  pawn: 'M12 2.500a4 4 0 0 1 2.700 6.900h1.300v2h-1.700c.1 3.400 1 5.800 2.900 8.100H6.800c1.900-2.300 2.800-4.700 2.900-8.100H8v-2h1.300A4 4 0 0 1 12 2.500ZM5.500 20.500h13v1.500h-13z',
} as const;

const FILLED = new Set<string>(['first', 'last', 'prev', 'next', 'play', 'pause', 'up', 'down', 'crown', 'pawn']);
const BRAND = { x: FaXTwitter, github: FaGithub } as const;

export type IconName = keyof typeof PATHS | keyof typeof BRAND;

interface IconProps {
  name: IconName;
  size?: 14 | 16 | 20 | 24;
  className?: string;
}

/** Decorative by default: the control around it carries the name. */
export function Icon({ name, size = 20, className }: IconProps) {
  if (name === 'x' || name === 'github') {
    const Brand = BRAND[name];
    return <Brand size={size} aria-hidden className={cn('shrink-0', className)} />;
  }
  const filled = FILLED.has(name);
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size} aria-hidden focusable="false"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 1 : size <= 16 ? 2 : 1.75}
      strokeLinecap="round" strokeLinejoin="round"
      className={cn('shrink-0', name === 'crown' && 'text-brand-mark', className)}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
