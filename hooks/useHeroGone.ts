'use client';

import { useEffect, useState } from 'react';

/** True once the element with this id has scrolled off the top of the viewport. */
export function useHeroGone(heroId: string): boolean {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const el = document.getElementById(heroId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setGone(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [heroId]);
  return gone;
}
