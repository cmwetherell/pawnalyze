'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface Group { hover: number | null; setHover: (i: number | null) => void }

const Ctx = createContext<Group | null>(null);
export const useChartGroup = (): Group | null => useContext(Ctx);

/** Charts inside share one x: the crosshair moves through all of them and their plots line up. Give them the same `x.labels`. */
export function ChartGroup({ className, children }: { className?: string; children: ReactNode }) {
  const [hover, setHover] = useState<number | null>(null);
  const value = useMemo(() => ({ hover, setHover }), [hover]);
  return <Ctx.Provider value={value}><div className={className}>{children}</div></Ctx.Provider>;
}
