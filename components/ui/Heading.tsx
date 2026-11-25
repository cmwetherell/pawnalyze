import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type HeadingStyle = 'mega' | 'h1' | 'h2' | 'h3';

const STYLE: Record<HeadingStyle, string> = { mega: 'type-mega', h1: 'type-h1', h2: 'type-h2', h3: 'type-h3' };
const DOWN: Record<HeadingStyle, HeadingStyle> = { mega: 'h1', h1: 'h2', h2: 'h3', h3: 'h3' };

/** A title over 22 characters ("United States of America" in the podium) drops one style. */
export const fitTitle = (title: string, style: HeadingStyle): HeadingStyle => (title.length > 22 ? DOWN[style] : style);

interface HeadingProps {
  level: 1 | 2 | 3 | 4;
  style: HeadingStyle;
  fit?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Heading({ level, style, fit = false, id, className, children }: HeadingProps) {
  const As = `h${level}` as const;
  const s = fit && typeof children === 'string' ? fitTitle(children, style) : style;
  return <As id={id} className={cn(STYLE[s], 'text-ink', className)}>{children}</As>;
}
