'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/** Width of an element in whole pixels; 0 until measured. The element must get its height from CSS, so measuring never moves the page. */
export function useSize<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setWidth(Math.floor(entries[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}
