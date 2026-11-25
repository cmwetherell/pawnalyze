'use client';

import { useId, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { IconButton } from '@/components/ui/IconButton';
import { LiveDot } from '@/components/ui/LiveDot';
import { Panel } from '@/components/ui/Panel';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ScrollRow } from '@/components/ui/ScrollRow';
import { cn } from '@/lib/utils';

export interface ScenarioRound {
  key: string;
  label: string;
  /** Words shown on hover and read out. */
  state?: 'simulated' | 'pairings' | 'projected' | 'played' | 'unpaired';
  dot?: 'live' | 'pick' | null;
}

interface ScenarioPanelProps {
  title: string;
  rounds: ScenarioRound[];
  round: string;
  onRound: (key: string) => void;
  /** Search, sort, view switch. */
  tools?: ReactNode;
  summary?: ReactNode;
  /** The Simulate button, or its label and handler. */
  primary: ReactNode | { label: string; onClick: () => void; disabled?: boolean; loading?: boolean };
  onReset?: () => void;
  /** Under 1024 the panel can be folded to its title; it starts open. */
  collapsible?: boolean;
  /** A line over the buttons: how many picks, how many simulations. */
  note?: ReactNode;
  /** From 1024 no taller than the window under the section bar, so the buttons stay in sight beside a long figure. */
  fit?: boolean;
  /** In a Sheet, which has the title, the buttons and the scrolling: only the rounds, the tools and the games. */
  bare?: boolean;
  className?: string;
  children: ReactNode;
}

const STATE_WORD = { simulated: 'simulated', pairings: 'pairings out', projected: 'projected', played: 'played', unpaired: 'not paired yet' } as const;

/** The footer's line closes the list: the last row, alone or in a list, drops its own. */
const LAST_PLAIN = '[&>:last-child]:border-b-0 [&>:last-child>li:last-child]:border-b-0 [&>:last-child>li:last-child>*]:border-b-0';

/** On a window too short for the head, a few games and the buttons, the panel keeps its own height. */
const FIT = {
  panel: '[@media(min-width:1024px)_and_(min-height:736px)]:flex [@media(min-width:1024px)_and_(min-height:736px)]:max-h-[calc(100dvh-6rem)] [@media(min-width:1024px)_and_(min-height:736px)]:flex-col',
  body: '[@media(min-width:1024px)_and_(min-height:736px)]:flex [@media(min-width:1024px)_and_(min-height:736px)]:min-h-0 [@media(min-width:1024px)_and_(min-height:736px)]:flex-col',
};

const roundName = (label: string) => (/^\d+$/.test(label) ? `Round ${label}` : label);

const isAction = (p: ScenarioPanelProps['primary']): p is { label: string; onClick: () => void; disabled?: boolean; loading?: boolean } =>
  typeof p === 'object' && p !== null && 'onClick' in p && 'label' in p;

/** The instrument both scenario builders share. */
export function ScenarioPanel({ title, rounds, round, onRound, tools, summary, primary, onReset, collapsible = false, note, fit = false, bare = false, className, children }: ScenarioPanelProps) {
  const id = useId();
  const [folded, setFolded] = useState(false);
  const current = rounds.find(r => r.key === round);
  const hidden = folded ? 'hidden lg:block' : '';

  const head = (
    <>
      {summary && <div className="mt-1 type-small text-ink-2">{summary}</div>}
      {rounds.length > 0 && (
        <div className="mt-3">
          {/* The scroller reaches 4px past its box for focus rings; chips keep theirs inside, so cut them on the panel's edge. */}
          <div className="overflow-x-clip">
            <ScrollRow label="Rounds" arrows drag follow='[aria-pressed="true"]' followKey={round}>
              {rounds.map(r => {
                const on = r.key === round;
                return (
                  <button
                    key={r.key} type="button" aria-pressed={on} title={r.state ? `${roundName(r.label)}: ${STATE_WORD[r.state]}` : undefined} onClick={() => onRound(r.key)}
                    className={cn(
                      'inline-flex min-h-tap min-w-tap shrink-0 items-center justify-center gap-1.5 rounded-sm border px-3 type-ui transition-colors duration-in focus-visible:outline-offset-[-2px]',
                      on ? 'border-action bg-action text-on-action' : cn('border-control bg-raised hover:bg-sunken hover:text-ink', r.state === 'played' || r.state === 'simulated' ? 'text-ink-3' : 'text-ink-2'),
                    )}
                  >
                    {r.dot === 'live' && <LiveDot inherit={on} />}
                    {r.label}
                    {r.state && <span className="sr-only">, {STATE_WORD[r.state]}</span>}
                    {r.dot === 'pick' && <span className="h-1.5 w-1.5 rounded-full bg-current"><span className="sr-only">, has picks</span></span>}
                  </button>
                );
              })}
            </ScrollRow>
          </div>
          {current?.state && <p className="mt-2 type-label text-ink-3">{roundName(current.label)}: {STATE_WORD[current.state]}</p>}
        </div>
      )}
      {tools && <div className="mt-3 flex flex-col gap-3">{tools}</div>}
    </>
  );

  if (bare) {
    return (
      <div className={cn('py-4', className)}>
        {head}
        <div className={cn('mt-3', LAST_PLAIN)}>{children}</div>
      </div>
    );
  }

  return (
    <Panel as="section" aria-labelledby={id} className={cn(fit && FIT.panel, className)}>
      <Panel.Head className={cn('shrink-0', folded && 'border-b-0 lg:border-b')}>
        <div className="flex items-center justify-between gap-3">
          <Heading id={id} level={3} style="h3">{title}</Heading>
          {collapsible && (
            <IconButton
              icon={folded ? 'chevron-down' : 'chevron-up'} label={folded ? `Show ${title}` : `Hide ${title}`} aria-expanded={!folded} aria-controls={`${id}-body`}
              onClick={() => setFolded(f => !f)} className="-my-2 -mr-2 lg:hidden"
            />
          )}
        </div>
        <div className={hidden}>
          {head}
        </div>
      </Panel.Head>
      <div id={`${id}-body`} className={cn(hidden, fit && FIT.body)}>
        <ScrollArea label={`${title}: games`} maxHeight="min(60dvh, 640px)" className={cn('px-4 py-2 md:px-6', LAST_PLAIN)}>{children}</ScrollArea>
        <Panel.Foot>
          {note && <div className="w-full type-label text-ink-2">{note}</div>}
          {isAction(primary) ? <Button variant="primary" onClick={primary.onClick} disabled={primary.disabled} loading={primary.loading} className="flex-1">{primary.label}</Button> : primary}
          {onReset && <Button variant="quiet" icon="reset" onClick={onReset}>Reset</Button>}
        </Panel.Foot>
      </div>
    </Panel>
  );
}
