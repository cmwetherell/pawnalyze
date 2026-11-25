'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { useHeroGone } from '@/hooks/useHeroGone';
import { cn } from '@/lib/utils';

interface BottomBarProps {
  label: string;
  heroId: string;
  /** Up to which width it stands in for an aside: 1024, or 1280 when the page has no room for one before. */
  until?: 'lg' | 'xl';
  className?: string;
  children: ReactNode;
}

const isTextField = (el: EventTarget | null) =>
  el instanceof HTMLElement && el.matches('textarea, select, [contenteditable="true"], input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"])');

/** Phones and tablets only: the live number, fixed to the bottom once the hero has scrolled away. */
export function BottomBar({ label, heroId, until = 'lg', className, children }: BottomBarProps) {
  const gone = useHeroGone(heroId);
  const [typing, setTyping] = useState(false);
  const hidden = !gone || typing;

  useEffect(() => {
    const onIn = (e: FocusEvent) => setTyping(isTextField(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    document.body.style.setProperty('--bottom-bar', 'calc(64px + env(safe-area-inset-bottom))');
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
      document.body.style.removeProperty('--bottom-bar');
    };
  }, []);

  return (
    <div
      role="region"
      data-bottom-bar={until}
      aria-label={label}
      inert={hidden}
      className={cn('fixed inset-x-0 bottom-0 z-bar border-t border-control bg-raised pb-safe transition-transform duration-slide ease-enter', until === 'xl' ? 'xl:hidden' : 'lg:hidden', hidden && 'translate-y-full')}
    >
      <div className={cn('flex h-16 items-center gap-2 px-gutter', className)}>{children}</div>
    </div>
  );
}
