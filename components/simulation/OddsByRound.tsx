'use client';

import { useState, type ReactNode } from 'react';

import { BarRows } from '@/components/charts/BarRows';
import { LineChart, type LineSeries } from '@/components/charts/LineChart';
import { Flag } from '@/components/ui/Flag';
import { Heading } from '@/components/ui/Heading';
import { IconButton } from '@/components/ui/IconButton';
import { formatPct } from '@/lib/format';
import type { Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

export interface OddsEntry {
  id: string;
  name: string;
  short?: string;
  /** Federation code. */
  flag?: string | null;
  tone: Tone;
  /** 0..1, one per round. */
  values: number[];
  /** strong: the leader. normal: an equal rival. context (default): one of the field. */
  emphasis?: LineSeries['emphasis'];
}

export interface OddsRound { label: string; title: string }

interface OddsByRoundProps {
  entries: OddsEntry[];
  rounds: OddsRound[];
  /** What the values are, over the chart. */
  caption: string;
  /** States the finding, for assistive tech. */
  ariaLabel: string;
  /** Head of the first table column: "Player". */
  noun: string;
  y?: { max?: number };
  /** Under the chart: how many simulations. */
  note?: ReactNode;
  /** The same chances as bars, one round at a time. Always there when there is only one round. */
  readout?: boolean;
  /** The round the bars open on: the first for an event that is over, to step through it. */
  start?: 'first' | 'last';
  /** Of the line chart. */
  height?: { desktop: number; phone: number };
  /** Results being recalculated. */
  busy?: boolean;
}

/** The highest few of the field are named over their highest points; the rest are left to the tooltip and the table. */
const NAMED = 3;
const NAMED_FROM = 0.1;
const peak = (values: number[]) => values.reduce((best, v, i) => (v > values[best] ? i : best), 0);

/** Chances after every round as lines, and one round at a time as bars. */
export function OddsByRound({ entries, rounds, caption, ariaLabel, noun, y, note, readout = true, start = 'last', height, busy = false }: OddsByRoundProps) {
  const last = rounds.length - 1;
  const [picked, setPicked] = useState<number | null>(null);
  const at = picked === null || picked > last ? (start === 'first' ? 0 : last) : picked;
  const lines = rounds.length > 1;

  const named = new Set(
    entries
      .filter(e => (e.emphasis ?? 'context') === 'context' && e.values[peak(e.values)] >= NAMED_FROM)
      .sort((a, b) => b.values[peak(b.values)] - a.values[peak(a.values)])
      .slice(0, NAMED)
      .map(e => e.id),
  );
  const series = entries.map((e): LineSeries => {
    const emphasis = e.emphasis ?? 'context';
    const top = peak(e.values);
    return {
      id: e.id, label: e.name, short: e.short, values: e.values, tone: e.tone, emphasis,
      labelAt: emphasis !== 'context' ? 'end' : !named.has(e.id) ? 'none' : top === last ? 'end' : top,
    };
  });
  const rows = [...entries].sort((a, b) => b.values[at] - a.values[at]);

  return (
    <div aria-busy={busy} className={cn('flex flex-col gap-12 transition-opacity duration-in', busy && 'opacity-50')}>
      {lines && (
        <div className="min-w-0">
          <LineChart
            series={series}
            x={{ labels: rounds.map(r => r.label), titles: rounds.map(r => r.title) }}
            y={{ min: 0, max: y?.max, format: 'pct' }}
            height={height}
            selected={readout && picked !== null ? at : undefined}
            onSelect={readout ? setPicked : undefined}
            caption={caption}
            ariaLabel={ariaLabel}
            table={{ columns: [noun, ...rounds.map(r => r.label)], rows: entries.map(e => [e.name, ...e.values.map(v => formatPct(v))]) }}
          />
          {note && <p className="mt-2 type-small text-ink-3">{note}</p>}
        </div>
      )}
      {(readout || !lines) && (
        <div className="min-w-0">
          <div className="mb-2 flex min-h-tap items-center justify-between gap-4">
            <Heading level={3} style="h3"><span aria-live="polite">{rounds[at].title}</span></Heading>
            {lines && (
              <div className="-mr-3 flex items-center">
                <IconButton icon="chevron-left" label="One round back" disabled={at === 0} onClick={() => setPicked(at - 1)} />
                <IconButton icon="chevron-right" label="One round on" disabled={at === last} onClick={() => setPicked(at + 1)} />
              </div>
            )}
          </div>
          <BarRows
            ariaLabel={`${caption}. ${rounds[at].title}.`}
            max={1}
            format="pct"
            rows={rows.map(e => ({ key: e.id, label: e.name, short: e.short, value: e.values[at], tone: e.tone, lead: e.flag ? <Flag code={e.flag} size="sm" decorative /> : undefined }))}
          />
          {!lines && note && <p className="mt-3 type-small text-ink-3">{note}</p>}
        </div>
      )}
    </div>
  );
}
