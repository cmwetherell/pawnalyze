'use client';

import { useTheme } from '@/components/layout/ThemeProvider';
import { TOKENS, type TokenName } from '@/lib/theme/tokens.generated';

/** Resolved token strings for a canvas library, which cannot read CSS variables. Follows the theme toggle. Only adapters.ts uses it. */
export function useChartTheme(): Record<TokenName, string> {
  const { theme } = useTheme();
  return TOKENS[theme];
}
