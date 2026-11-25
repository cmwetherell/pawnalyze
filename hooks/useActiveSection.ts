'use client';

import { useEffect, useState } from 'react';

/** The reading band runs from 20% to 30% of the way down the window. */
const BAND_END = 0.3;

/** Id of the section currently being read, null above the first. `ids` joined with a space by the caller, to stay stable. */
export function useActiveSection(ids: string): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const list = ids.split(' ').filter(id => id && document.getElementById(id));
    const seen = new Set<string>();
    const atEnd = () => {
      const { scrollHeight } = document.documentElement;
      return scrollHeight > innerHeight && scrollY + innerHeight >= scrollHeight - 2;
    };
    /** Nothing is in the band (a jump, a gap, the hero): the last section that starts above its end. */
    const passed = () => {
      let hit: string | null = null;
      let best = -Infinity;
      for (const id of list) {
        const el = document.getElementById(id);
        // A section inside a closed tab has no box.
        const top = el?.getClientRects().length ? el.getBoundingClientRect().top : Infinity;
        if (top <= innerHeight * BAND_END && top >= best) { best = top; hit = id; }
      }
      return hit;
    };
    let ended = false;
    const update = () => {
      // The last section can be too short to reach the reading band: the end of the page is its own.
      ended = atEnd();
      setActive(ended ? list[list.length - 1] ?? null : list.filter(id => seen.has(id)).pop() ?? passed());
    };
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target.id);
        else seen.delete(e.target.id);
      }
      update();
    }, { rootMargin: '-20% 0px -70% 0px' });
    for (const id of list) io.observe(document.getElementById(id)!);
    // The observer is silent between sections and at the end of the page.
    const onScroll = () => { if (seen.size === 0 || ended || atEnd()) update(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [ids]);
  return active;
}
