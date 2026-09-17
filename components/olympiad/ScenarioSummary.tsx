'use client';

import CopyLink from '@/components/ui/CopyLink';
import { LOW_SAMPLE_THRESHOLD } from '@/lib/olympiad/config';

interface ScenarioSummaryProps {
  pickCount: number;
  matched: number;
  nSims: number;
  sentence?: string | null;
  onClear: () => void;
}

export default function ScenarioSummary({ pickCount, matched, nSims, sentence, onClear }: ScenarioSummaryProps) {
  const zero = matched === 0;
  const low = !zero && matched < LOW_SAMPLE_THRESHOLD;
  const tone = zero
    ? 'bg-rose-500/10 border-rose-500/30'
    : low
      ? 'bg-amber-500/10 border-amber-500/30'
      : 'bg-chess-gold/10 border-chess-gold/25';
  const accent = zero ? 'text-rose-400' : low ? 'text-amber-500' : 'text-chess-gold';
  const share = nSims > 0 ? (matched / nSims) * 100 : 0;

  return (
    <div className={`rounded-lg border px-3 py-2.5 text-xs ${tone}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`font-semibold ${accent}`}>
          Scenario · {pickCount} pick{pickCount !== 1 ? 's' : ''}
        </span>
        <span className="tabular-nums text-[var(--text-secondary)]">
          {matched.toLocaleString()} of {nSims.toLocaleString()} simulations match ({share < 0.1 && share > 0 ? '<0.1' : share.toFixed(1)}%)
        </span>
        {zero && <span className={accent}>No simulation produced this combination; try fewer picks.</span>}
        {low && <span className={accent}>Small sample, treat these odds as rough.</span>}
        <span className="ml-auto flex items-center gap-1">
          <CopyLink label="Copy scenario link" />
          <button
            type="button"
            onClick={onClear}
            className="h-8 px-2.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]"
          >
            Clear
          </button>
        </span>
      </div>
      {sentence && !zero && (
        <p className="mt-1.5 text-[var(--text-primary)] text-sm leading-snug">{sentence}</p>
      )}
    </div>
  );
}
