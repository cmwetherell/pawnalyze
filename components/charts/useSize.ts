'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/** Width and height of an element in whole pixels; 0 until measured. The element must get its height from CSS, so measuring never moves the page. */
export function useSize<T extends HTMLElement>(): [RefObject<T | null>, number, number] {
  const ref = useRef<T>(null);
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width: w, height: h } = entries[0].contentRect;
      setSize(s => (s.width === Math.floor(w) && s.height === Math.floor(h) ? s : { width: Math.floor(w), height: Math.floor(h) }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width, height];
}
