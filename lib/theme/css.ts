import type { TokenName } from './tokens.generated';

export type { TokenName };

/** CSS colour string for a token, for SVG attributes and dynamic tones. The only place that writes this function. */
export const token = (name: TokenName, alpha = 1): string =>
  alpha === 1 ? `rgb(var(--${name}))` : `rgb(var(--${name}) / ${alpha})`;
