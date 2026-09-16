'use client';

import { LOW_SAMPLE_THRESHOLD } from '@/lib/olympiad/config';

interface ScenarioSummaryProps {
  pickCount: number;
  matched: number;
  nSims: number;
  onClear: () => void;
}

export default function ScenarioSummary({ pickCount, matched, nSims, onClear }: ScenarioSummaryProps) {
  const zero = matched === 0;
  const low = !zero && matched < LOW_SAMPLE_THRESHOLD;
  const tone = zero
    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
    : low
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
      : 'bg-chess-gold/10 border-chess-gold/20 text-chess-gold';
  const share = nSims > 0 ? (matched / nSims) * 100 : 0;

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-xs ${tone}`}>
      <span className="font-semibold">
        Scenario · {pickCount} pick{pickCount !== 1 ? 's' : ''}
      </span>
      <span className="tabular-nums">
        {matched.toLocaleString()} of {nSims.toLocaleString()} simulations match ({share < 0.1 && share > 0 ? '<0.1' : share.toFixed(1)}%)
      </span>
      {zero && <span>— no simulation produced this combination; try fewer picks.</span>}
      {low && <span>— small sample, treat these odds as rough.</span>}
      <button
        type="button"
        onClick={onClear}
        className="ml-auto underline decoration-current/40 hover:decoration-current"
      >
        Clear
      </button>
    </div>
  );
}
