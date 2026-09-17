/** Layout-matching placeholders (pulse) for the spotlight panels. */
export function SkeletonBars({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="space-y-1.5 animate-pulse" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="w-[18px] h-[13px] rounded-[3px] bg-[var(--bg-surface-3)]" />
          <span className="h-3 rounded bg-[var(--bg-surface-3)]" style={{ width: `${40 + ((i * 37) % 50)}px` }} />
          <span className="flex-1 h-1.5 rounded-full bg-[var(--bg-surface-3)]" />
          <span className="w-10 h-3 rounded bg-[var(--bg-surface-3)]" />
        </li>
      ))}
    </ul>
  );
}

export function SkeletonHistogram({ bars = 16 }: { bars?: number }) {
  const heights = [88, 62, 44, 32, 22, 16, 12, 10, 8, 6, 5, 4, 4, 3, 3, 8];
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="flex items-end gap-[3px] h-28">
        {Array.from({ length: bars }, (_, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-[var(--bg-surface-3)]" style={{ height: `${heights[i % heights.length]}%` }} />
        ))}
      </div>
      <div className="mt-2 h-3 w-40 rounded bg-[var(--bg-surface-3)]" />
    </div>
  );
}

export function SkeletonRounds({ rows = 9 }: { rows?: number }) {
  return (
    <ul className="space-y-2 animate-pulse" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="w-6 h-3 rounded bg-[var(--bg-surface-3)]" />
          <span className="flex-1 h-2 rounded-full bg-[var(--bg-surface-3)]" />
          <span className="w-20 h-3 rounded bg-[var(--bg-surface-3)]" />
        </li>
      ))}
    </ul>
  );
}
