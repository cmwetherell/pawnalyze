import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { goldLine, isExternal, linkLine } from './styles';

interface TextLinkProps {
  href: string;
  external?: boolean;
  /** No hairline until hover: for links inside dense rows. */
  quiet?: boolean;
  /** On a line of its own rather than in running text: 44px tall. */
  standalone?: boolean;
  /** Inline to the eye, 44px tall to a finger: for a link alone on its line where the line height must not grow. */
  tap?: boolean;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
  title?: string;
  rel?: string;
}

/** Ink text on a gold hairline that thickens on hover. */
export function TextLink({ href, external, quiet = false, standalone = false, tap = false, className, children, rel, ...aria }: TextLinkProps) {
  const out = external ?? isExternal(href);
  const line = quiet
    ? cn(goldLine, 'transition-colors duration-in hover:underline')
    : cn('text-ink', linkLine);
  const cls = cn(standalone ? 'group/link inline-flex min-h-tap items-center type-ui' : line, tap && 'relative before:absolute before:inset-x-0 before:top-1/2 before:h-tap before:-translate-y-1/2', className);
  // The word joiner keeps the icon on the line of the last word.
  const words = out ? <>{children}<span className="whitespace-nowrap">{'⁠'}<Icon name="external" size={14} className="ml-1 inline-block align-[-2px]" /></span></> : children;
  const inner = standalone
    ? <span className={cn('text-ink transition-[text-decoration-thickness] duration-in group-hover/link:decoration-2', goldLine, quiet ? 'group-hover/link:underline' : 'underline')}>{words}</span>
    : words;
  return out
    ? <a href={href} target="_blank" rel={rel ?? 'noopener noreferrer'} className={cls} {...aria}>{inner}</a>
    : <Link href={href} rel={rel} className={cls} {...aria}>{inner}</Link>;
}
