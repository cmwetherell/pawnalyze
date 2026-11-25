'use client';

import { useEffect, useState } from 'react';

/** True once the element with this id has scrolled off the top of the viewport. */
export function useHeroGone(heroId: string): boolean {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const el = document.getElementById(heroId);
    if (!el) return;
    // The root reaches far below the window, so a jump from above the element to below it still crosses an edge.
    const io = new IntersectionObserver(entries => setGone(!entries[entries.length - 1].isIntersecting), { rootMargin: '0px 0px 1000000px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [heroId]);
  return gone;
}
