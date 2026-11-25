import { extendTailwindMerge, twJoin, type ClassNameValue } from 'tailwind-merge';

const space = ['gutter', 'section', 'section-landing', 'header', 'bar', 'bottom-bar', 'tap', 'safe'];

/**
 * Teaches tailwind-merge the names in tailwind.config.ts. The type styles get their own group, so `type-data text-ink`
 * keeps both and `type-data type-small` keeps the last; color names need no entry (its color groups accept any name).
 */
const merge = extendTailwindMerge<'type'>({
  extend: {
    theme: { spacing: space },
    classGroups: {
      type: [{ type: [() => true] }],
      shadow: [{ shadow: ['pop'] }],
      z: [{ z: ['bar', 'header', 'tooltip', 'sheet', 'skip'] }],
      'max-w': [{ 'max-w': ['page', 'reading'] }],
      'min-h': [{ 'min-h': ['hero', 'screen'] }],
      duration: [{ duration: ['press', 'out', 'in', 'slide', 'data', 'image'] }],
      ease: [{ ease: ['ease', 'enter'] }],
      animate: [{ animate: ['rise', 'up', 'settle', 'grow', 'wipe', 'live-dot', 'sheet', 'fade', 'skeleton'] }],
    },
  },
});

export const cn = (...inputs: ClassNameValue[]): string => merge(twJoin(...inputs));
