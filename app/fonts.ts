import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

import { cn } from '@/lib/utils';

/** Pawnalyze Display: Merriweather (OFL) pinned to width 87, weight 420, optical size kept. One weight, never bold or italic. */
export const display = localFont({ src: '../assets/fonts/PawnalyzeDisplay-opsz.woff2', weight: '420', variable: '--font-display', display: 'swap', adjustFontFallback: 'Times New Roman' });
export const text = Hanken_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-text', display: 'swap' });
export const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap', preload: false });

/** Goes on <html> so every element, portals included, can use the three faces. */
export const fontVariables = cn(display.variable, text.variable, mono.variable);
