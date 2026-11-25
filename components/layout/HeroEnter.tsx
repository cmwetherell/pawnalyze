'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Longer than the last part: animate-settle 1.1s, or animate-up 520ms after its 460ms delay. */
const DONE_MS = 1800;
let played = false;

/**
 * Plays the hero entrance once per load: parts inside opt in with `group-data-[enter]/enter:animate-*`.
 * The animation is CSS on server-rendered markup, so nothing waits for JavaScript and reduced motion shows the end state.
 */
export function HeroEnter({ className, children }: { className?: string; children: ReactNode }) {
  // A later client-side navigation mounts a new hero: it starts settled.
  const [enter, setEnter] = useState(() => !played);
  useEffect(() => {
    if (!enter) return;
    // Dropped once it has played, so a part that changes display at a breakpoint does not play again.
    const id = setTimeout(() => { played = true; setEnter(false); }, DONE_MS);
    return () => clearTimeout(id);
  }, [enter]);
  return <div data-enter={enter ? '' : undefined} suppressHydrationWarning className={cn('group/enter', className)}>{children}</div>;
}
