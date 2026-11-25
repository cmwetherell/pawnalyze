import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const c = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const names = [
  'canvas', 'surface', 'sunken', 'raised', 'overlay', 'ink', 'ink-2', 'ink-3', 'ink-inverse', 'line', 'control', 'rule',
  'action', 'action-hover', 'on-action', 'focus', 'brand', 'brand-mark', 'brand-wash',
  'positive', 'positive-wash', 'negative', 'negative-wash', 'warning', 'warning-wash', 'live', 'live-wash', 'on-live',
  'p1', 'p1-ink', 'p1-field', 'p1-wash', 'on-p1', 'p2', 'p2-ink', 'p2-field', 'p2-wash', 'on-p2', 'draw', 'on-draw', 'on-field',
  'gold', 'silver', 'bronze', 'on-gold', 'on-silver', 'on-bronze',
  'series-1', 'series-2', 'series-3', 'series-4', 'series-5', 'series-6', 'series-7', 'series-8', 'on-mid', 'context', 'grid', 'axis',
  'board-light', 'board-dark', 'board-mark', 'board-ink', 'piece-white', 'piece-black', 'eval-white', 'eval-black',
  'cx-1', 'cx-2', 'cx-3', 'cx-4',
] as const;

const display = { fontFamily: 'var(--font-display)', fontWeight: '420', fontOpticalSizing: 'auto', fontVariantNumeric: 'lining-nums', wordSpacing: '.05em' };
const text = { fontFamily: 'var(--font-text)', fontWeight: '400' };
const D = (size: string, lineHeight: string, letterSpacing: string, extra = {}) => ({ ...display, fontSize: `var(--t-${size})`, lineHeight, letterSpacing, ...extra });
const T = (size: string, lineHeight: string, extra = {}) => ({ ...text, fontSize: `var(--t-${size})`, lineHeight, letterSpacing: '0', ...extra });

const config: Config = {
  darkMode: 'class',
  content: ['./components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    // Replaces Tailwind's palette, type sizes, radii and shadows: bg-red-500, text-white, text-sm, rounded-xl do not exist.
    colors: { transparent: 'transparent', current: 'currentColor', inherit: 'inherit', ...Object.fromEntries(names.map(n => [n, c(n)])) },
    fontSize: {},
    fontFamily: { display: 'var(--font-display)', text: 'var(--font-text)', mono: 'var(--font-mono)' },
    fontWeight: { normal: '400', medium: '500', semibold: '600' },
    borderRadius: { none: '0', sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)', full: 'var(--r-full)' },
    boxShadow: { none: 'none', pop: 'var(--shadow-pop)' },
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
    zIndex: { auto: 'auto', 0: '0', 10: '10', bar: '30', header: '40', tooltip: '50', sheet: '60', skip: '70' },
    extend: {
      borderColor: { DEFAULT: c('line') },
      ringColor: { DEFAULT: c('focus') },
      spacing: { gutter: 'var(--gutter)', section: 'var(--section)', 'section-landing': 'var(--section-landing)', header: 'var(--header)', bar: 'var(--bar)', 'bottom-bar': 'var(--bottom-bar)', tap: 'var(--tap)', safe: 'env(safe-area-inset-bottom)' },
      maxWidth: { page: 'var(--page)', reading: 'var(--reading)' },
      minHeight: { tap: 'var(--tap)', hero: 'calc(100svh - var(--header))', screen: '100svh' },
      scrollMargin: { bar: 'calc(var(--bar) + 24px)' },
      transitionDuration: { press: 'var(--m-press)', out: 'var(--m-out)', in: 'var(--m-in)', slide: 'var(--m-slide)', data: 'var(--m-data)', image: 'var(--m-image)' },
      transitionTimingFunction: { DEFAULT: 'var(--ease)', ease: 'var(--ease)', enter: 'var(--ease-enter)' },
      keyframes: {
        rise: { from: { transform: 'translateY(105%)' } },
        up: { from: { transform: 'translateY(12px)', opacity: '0' } },
        settle: { from: { transform: 'translateY(5%)' } },
        grow: { from: { transform: 'scaleY(.2)' } },
        wipe: { from: { clipPath: 'inset(0 100% 0 0)' }, to: { clipPath: 'inset(0 0 0 0)' } },
        'live-dot': { '0%,100%': { opacity: '1' }, '50%': { opacity: '.35' } },
        sheet: { from: { transform: 'translateY(100%)' } },
        fade: { from: { opacity: '0' } },
        skeleton: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
      },
      animation: {
        rise: 'rise var(--m-enter) var(--ease-enter) both', up: 'up 520ms var(--ease-enter) both', settle: 'settle 1.1s var(--ease-enter) both',
        grow: 'grow .9s var(--ease-enter) both', wipe: 'wipe .9s var(--ease-enter) both', 'live-dot': 'live-dot 2s ease-in-out infinite',
        sheet: 'sheet var(--m-slide) var(--ease-enter) both', fade: 'fade var(--m-in) var(--ease) both', skeleton: 'skeleton 1.6s ease-in-out infinite', spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [plugin(({ addComponents, addUtilities }) => {
    // Components layer, so font-medium / text-ink / tnum on the same element win.
    addComponents({
      '.type-figure': D('figure', '.88', '-.025em', { whiteSpace: 'nowrap' }),
      '.type-mega': D('mega', '1', '-.022em', { textWrap: 'balance' }),
      '.type-h1': D('h1', '1.04', '-.02em', { textWrap: 'balance' }),
      '.type-h2': D('h2', '1.12', '-.016em', { textWrap: 'balance' }),
      '.type-h3': D('h3', '1.25', '-.008em'),
      '.type-stat': D('stat', '1', '-.02em', { whiteSpace: 'nowrap' }),
      '.type-stat-sm': D('stat-sm', '1.1', '-.014em', { whiteSpace: 'nowrap' }),
      '.type-quote': D('quote', '1.24', '-.014em', { textWrap: 'pretty' }),
      '.type-standfirst': D('standfirst', '1.38', '-.006em', { textWrap: 'pretty' }),
      '.type-lead': T('lead', '1.55', { textWrap: 'pretty' }),
      '.type-body': T('body', '1.6', { textWrap: 'pretty' }),
      '.type-button': T('body', '1.2', { fontWeight: '500' }),
      '.type-ui': T('data', '1.3', { fontWeight: '500' }),
      '.type-data': T('data', '1.4', { fontVariantNumeric: 'tabular-nums lining-nums' }),
      '.type-small': T('small', '1.5'),
      '.type-label': T('label', '1.4'),
      '.type-micro': T('micro', '1.45'),
      '.type-mono': { fontFamily: 'var(--font-mono)', fontSize: 'var(--t-small)', lineHeight: '1.55', fontVariantNumeric: 'tabular-nums' },
    });
    addUtilities({
      '.tnum': { fontVariantNumeric: 'tabular-nums lining-nums' },
      '.hatch': { backgroundImage: 'repeating-linear-gradient(135deg, rgb(var(--draw)) 0 1.5px, transparent 1.5px 6px)', boxShadow: 'inset 0 0 0 1px rgb(var(--draw))' },
      '.scrollbar-none': { scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } },
      '.press': { filter: 'var(--press-filter)' },
      '.logo': { filter: 'var(--logo-filter)' },
    });
  })],
};
export default config;
