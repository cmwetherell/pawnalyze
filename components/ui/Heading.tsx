import type { ReactNode, Ref } from 'react';

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
  /** -1 and a ref: code moves focus here when something opens. */
  tabIndex?: -1;
  ref?: Ref<HTMLHeadingElement>;
  className?: string;
  children: ReactNode;
}

export function Heading({ level, style, fit = false, id, tabIndex, ref, className, children }: HeadingProps) {
  const As = `h${level}` as const;
  const s = fit && typeof children === 'string' ? fitTitle(children, style) : style;
  return <As id={id} ref={ref} tabIndex={tabIndex} className={cn(STYLE[s], 'text-ink', tabIndex === -1 && 'outline-none', className)}>{children}</As>;
}
