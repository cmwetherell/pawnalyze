'use client';

import { useEffect, type RefObject } from 'react';

/** While `active`, a press anywhere outside the element calls `onOutside`: a tooltip a touch left up goes with the next touch. */
export function useOutsidePress(ref: RefObject<HTMLElement | null>, active: boolean, onOutside: () => void): void {
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onOutside(); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [ref, active, onOutside]);
}
