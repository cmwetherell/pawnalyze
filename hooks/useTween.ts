'use client';

import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Tween a number toward its target (ease-out); jumps straight there under reduced motion. */
export function useTween(target: number, ms = 450): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const current = useRef(target);
  useEffect(() => {
    if (reduced) {
      current.current = target;
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    from.current = current.current;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const v = from.current + (target - from.current) * (1 - Math.pow(1 - t, 3));
      current.current = v;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);
  return value;
}
