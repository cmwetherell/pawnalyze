'use client';

import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { CopyButton } from '@/components/ui/CopyButton';
import { LOW_SAMPLE_THRESHOLD } from '@/lib/olympiad/config';

interface ScenarioSummaryProps {
  pickCount: number;
  matched: number;
  nSims: number;
  sentence: string | null;
  onClear: () => void;
}

/** What the scenario says, and how many simulations it rests on. */
export function ScenarioSummary({ pickCount, matched, nSims, sentence, onClear }: ScenarioSummaryProps) {
  const zero = matched === 0;
  const low = !zero && matched < LOW_SAMPLE_THRESHOLD;
  const share = nSims > 0 ? (matched / nSims) * 100 : 0;
  return (
    <Callout
      tone={zero ? 'negative' : low ? 'warning' : 'neutral'} icon={zero ? 'error' : low ? 'warning' : undefined}
      action={<><CopyButton kind="link" label="Copy scenario link" /><Button size="sm" variant="quiet" icon="reset" onClick={onClear}>Clear</Button></>}
    >
      {sentence && !zero && <p>{sentence}</p>}
      <p className="type-small text-ink-2">
        Scenario with {pickCount} pick{pickCount !== 1 ? 's' : ''}: {matched.toLocaleString('en-US')} of {nSims.toLocaleString('en-US')} simulations match ({share < 0.1 && share > 0 ? '<0.1' : share.toFixed(1)}%).
        {zero && ' No simulation produced this combination; try fewer picks.'}
        {low && ' Small sample, treat these odds as rough.'}
      </p>
    </Callout>
  );
}
