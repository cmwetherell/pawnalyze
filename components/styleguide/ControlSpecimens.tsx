'use client';

import { useCallback, useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { Combobox } from '@/components/ui/Combobox';
import { CopyButton } from '@/components/ui/CopyButton';
import { Disclosure } from '@/components/ui/Disclosure';
import { Field } from '@/components/ui/Field';
import { Flag } from '@/components/ui/Flag';
import { IconButton } from '@/components/ui/IconButton';
import { Input, SearchInput, Select, Textarea } from '@/components/ui/Input';
import { PickToggle, type PickOption } from '@/components/ui/PickToggle';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ScrollRow } from '@/components/ui/ScrollRow';
import { Segmented } from '@/components/ui/Segmented';
import { Sheet } from '@/components/ui/Sheet';
import { Slider } from '@/components/ui/Slider';
import { Tabs } from '@/components/ui/Tabs';
import { TextLink } from '@/components/ui/TextLink';
import { RACE } from './fixtures';
import { Specimen, Variant, Variants } from './Specimen';

type Outcome = '1' | 'd' | '2';
const AVATARS = { g: '/players/gukesh.webp', s: '/players/sindarov.webp' };
const OUTCOMES: PickOption<Outcome>[] = [
  { value: '1', label: 'Gukesh wins', face: { src: AVATARS.g, name: 'Gukesh' }, pct: 0.11, tone: 'p1', preview: 'Gukesh then 34.3% to win the match' },
  { value: 'd', label: 'Draw', glyph: '½', pct: 0.72, tone: 'draw', preview: 'Gukesh then 14.7% to win the match' },
  { value: '2', label: 'Sindarov wins', face: { src: AVATARS.s, name: 'Sindarov' }, pct: 0.17, tone: 'p2', preview: 'Gukesh then 4.6% to win the match' },
];
const SCORES: PickOption<Outcome>[] = [
  { value: '1', label: 'White wins', glyph: '1', tone: 'ink' },
  { value: 'd', label: 'Draw', glyph: '=', tone: 'draw' },
  { value: '2', label: 'Black wins', glyph: '0', tone: 'ink' },
];
const TEAMS = RACE.map(([name, code]) => ({ name, code }));

export function ButtonSpecimens() {
  return (
    <Section id="buttons" title="Buttons and links" layout="rail" finding="Two button looks and a quiet one. Links are ink on a gold hairline. A hero has at most two buttons.">
      <Specimen name="Button" from="ui/Button" note="Primary, secondary, quiet. 48px, or 44px as sm. Rises 1px on hover, presses on click.">
        <Variants>
          <Button variant="primary">See the match odds</Button>
          <Button>Watch live</Button>
          <Button variant="quiet">Reset</Button>
          <Button variant="primary" live>Watch game 2 live</Button>
          <Button live>Watch game 2 live</Button>
        </Variants>
        <Variants className="mt-4">
          <Button variant="primary" icon="share">Share scenario</Button>
          <Button iconEnd="arrow-right">Open the board</Button>
          <Button variant="primary" loading>Simulating</Button>
          <Button variant="primary" disabled>Simulate</Button>
          <Button disabled>Reset</Button>
          <Button href="https://blog.pawnalyze.com">Visit the blog</Button>
        </Variants>
        <Variants className="mt-4">
          <Button size="sm" variant="primary">Simulate</Button>
          <Button size="sm" icon="reset">Reset</Button>
          <Button size="sm" variant="quiet">Clear</Button>
        </Variants>
        <div className="mt-4 sm:w-80"><Button full variant="primary">Full width</Button></div>
      </Specimen>
      <Specimen name="IconButton" from="ui/IconButton" note="44px. The label is its name and its tooltip.">
        <Variants>
          <IconButton icon="menu" label="Menu" />
          <IconButton icon="close" label="Close" />
          <IconButton icon="chevron-left" label="Previous team" />
          <IconButton icon="flip" label="Flip the board" pressed />
          <IconButton icon="next" label="Next move" disabled />
          <IconButton icon="external" label="Simulations" href="/simulations" />
        </Variants>
      </Specimen>
      <Specimen name="TextLink" from="ui/TextLink">
        <Variants className="gap-x-8 type-body">
          <TextLink href="/simulations/candidates-2026">Replay the Candidates</TextLink>
          <TextLink href="https://handbook.fide.com">FIDE regulations</TextLink>
          <TextLink href="/simulations" quiet>Quiet, for dense rows</TextLink>
        </Variants>
      </Specimen>
      <Specimen name="CopyButton" from="ui/CopyButton">
        <Variants>
          <CopyButton kind="link" label="Share scenario" variant="secondary" />
          <CopyButton kind="text" text="Pawnalyze" label="Copy" />
          <CopyButton kind="link" label="Copy link" variant="icon" />
        </Variants>
      </Specimen>
      <Specimen name="Chip" from="ui/Chip">
        <Variants>
          <Chip onClick={() => {}}>Try: start position</Chip>
          <Chip onClick={() => {}} pressed>Pressed</Chip>
          <Chip onClick={() => {}} icon="reset">Restore 3 picks</Chip>
          <Chip onClick={() => {}} icon={<Flag code="UZB" decorative size="xs" />} tone="positive">Uzbekistan +4.2</Chip>
          <Chip onClick={() => {}} icon={<Flag code="IND" decorative size="xs" />} tone="negative">India −3.1</Chip>
          <Chip onClear={() => {}}>Team: Germany</Chip>
          <Chip href="/simulations">Link</Chip>
        </Variants>
      </Specimen>
    </Section>
  );
}

export function ChoiceSpecimens() {
  const [metric, setMetric] = useState('gold');
  const [view, setView] = useState('round');
  const [tab, setTab] = useState('race');
  const [pick, setPick] = useState<Outcome | null>('1');
  const [draw, setDraw] = useState<Outcome | null>(null);
  const [two, setTwo] = useState<Outcome | null>('2');
  const [small, setSmall] = useState<Outcome | null>('d');
  return (
    <Section id="choices" title="Choices" layout="rail" finding="One segmented control, one set of tabs, one pick control. State changes without a sliding pill.">
      <Specimen name="Segmented" from="ui/Segmented" note="Arrow keys move. Radio group, tab list or a nav of links.">
        <Variants>
          <Segmented ariaLabel="Metric" value={metric} onChange={setMetric} items={[{ value: 'gold', label: 'Gold' }, { value: 'medal', label: 'Medal' }, { value: 'top10', label: 'Top 10' }]} />
          <Segmented ariaLabel="View" size="sm" value={view} onChange={setView} items={[{ value: 'round', label: 'By round', icon: 'list' }, { value: 'path', label: 'Team path' }, { value: 'off', label: 'Unavailable', disabled: true }]} />
          <Segmented ariaLabel="Games" role="nav" size="sm" value="2" items={[{ value: '1', label: '1 ½', href: '/world-chess-championship-2026/live?game=1' }, { value: '2', label: '2', dot: true, href: '/world-chess-championship-2026/live?game=2' }, { value: '3', label: '3', href: '/world-chess-championship-2026/live?game=3' }]} />
        </Variants>
        <Segmented className="mt-4" full ariaLabel="Full width" value={metric} onChange={setMetric} items={[{ value: 'gold', label: 'Gold' }, { value: 'medal', label: 'Medal' }, { value: 'top10', label: 'Top 10' }]} />
      </Specimen>
      <Specimen name="Tabs" from="ui/Tabs">
        <Tabs ariaLabel="Race" value={tab} onChange={setTab} items={[{ key: 'race', label: 'Gold race' }, { key: 'round', label: 'Round 10', live: true }, { key: 'trend', label: 'Trend' }]} />
        <Tabs className="mt-6" ariaLabel="Event pages" items={[{ label: 'Medal odds', href: '/simulations/chess-olympiad-2026', active: true }, { label: 'Board prizes', href: '/simulations/chess-olympiad-2026/boards', active: false }]} />
      </Specimen>
      <Specimen name="PickToggle" from="ui/PickToggle" note="Holds the percentage of each outcome. Press again to clear.">
        <div className="grid gap-6 sm:grid-cols-3">
          <Variant label="lg, picked"><PickToggle legend="Game 2" options={OUTCOMES} value={pick} onChange={v => setPick(v)} /></Variant>
          <Variant label="lg, empty"><PickToggle legend="Game 3" options={OUTCOMES} value={draw} onChange={v => setDraw(v)} /></Variant>
          <Variant label="lg, side two"><PickToggle legend="Game 4" options={OUTCOMES} value={two} onChange={v => setTwo(v)} /></Variant>
          <Variant label="sm"><PickToggle size="sm" legend="Board 1" options={SCORES} value={small} onChange={v => setSmall(v)} /></Variant>
          <Variant label="lg, disabled"><PickToggle disabled legend="Game 14" options={OUTCOMES} value={null} onChange={() => {}} /></Variant>
        </div>
      </Specimen>
    </Section>
  );
}

export function FormSpecimens() {
  const [rating, setRating] = useState(2710);
  const [theta, setTheta] = useState(1.97);
  const [only, setOnly] = useState(true);
  const [team, setTeam] = useState('Uzbekistan');
  return (
    <Section id="forms" title="Forms" layout="rail" finding="48px controls, 16px text so phones do not zoom, a label on every one.">
      <Specimen name="Field with Input, Select, SearchInput, Textarea" from="ui/Field, ui/Input">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Team name" hint="Type at least two letters"><Input placeholder="Uzbekistan" /></Field>
          <Field label="Rating" error="Use a number from 2000 to 3000"><Input defaultValue="27l0" /></Field>
          <Field label="Round"><Select defaultValue="11">{['9', '10', '11'].map(r => <option key={r} value={r}>Round {r}</option>)}</Select></Field>
          <Field label="Find a team"><SearchInput placeholder="Search 206 teams" /></Field>
          <Field label="Disabled"><Input disabled value="Not available" readOnly /></Field>
          <Field label="Hidden label" hideLabel><Input placeholder="Label is for screen readers" /></Field>
          <Field label="FEN or PGN" className="sm:col-span-2"><Textarea mono rows={3} defaultValue="r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 3 9" /></Field>
        </div>
      </Specimen>
      <Specimen name="Combobox" from="ui/Combobox" note="Type to filter, arrow keys, Enter, Escape.">
        <div className="sm:w-96">
          <Combobox
            items={TEAMS} getKey={t => t.code} match={(t, q) => t.name.toLowerCase().includes(q.toLowerCase())} ariaLabel="Find a team" placeholder="Find a team"
            renderOption={t => <span className="flex items-center gap-3"><Flag code={t.code} decorative />{t.name}</span>} onSelect={t => setTeam(t.name)}
          />
        </div>
        <p className="mt-2 type-small text-ink-2">Chosen: {team}</p>
      </Specimen>
      <Specimen name="Checkbox" from="ui/Checkbox">
        <Variants><Checkbox label="Only players who can still reach 8 games" checked={only} onChange={e => setOnly(e.target.checked)} /><Checkbox label="Disabled" disabled /></Variants>
      </Specimen>
      <Specimen name="Slider" from="ui/Slider">
        <div className="grid gap-6 sm:max-w-reading">
          <Slider label="Gukesh rating" tone="p1" value={rating} min={2610} max={2810} step={1} onChange={setRating} format={v => `${v} (${v - 2710 >= 0 ? '+' : '−'}${Math.abs(v - 2710)})`} marker={2710} />
          <Slider label="Draw propensity (classical)" value={theta} min={0.5} max={5} step={0.01} onChange={setTheta} format={v => v.toFixed(2)} marker={1.97} />
          <Slider label="Disabled" tone="p2" value={2782} min={2682} max={2882} step={1} onChange={() => {}} format={v => String(v)} disabled />
        </div>
      </Specimen>
    </Section>
  );
}

export function OverlaySpecimens() {
  const [sheet, setSheet] = useState<'bottom' | 'full' | null>(null);
  const close = useCallback(() => setSheet(null), []);
  return (
    <Section id="containers" title="Disclosure, sheet, scrollers" layout="rail" finding="What opens and what scrolls. Nothing else on the site scrolls sideways.">
      <Specimen name="Disclosure" from="ui/Disclosure">
        <Disclosure summary="Show as a table"><p className="type-small text-ink-2">Plain: a line of text.</p></Disclosure>
        <div className="mt-4 border-t border-line">
          <Disclosure variant="row" summary="Round 10" meta="4 games"><p className="type-small text-ink-2">Row: ruled, chevron at the right end.</p></Disclosure>
          <Disclosure variant="row" summary="Round 9" meta="4 games" open><p className="type-small text-ink-2">Open by default.</p></Disclosure>
        </div>
      </Specimen>
      <Specimen name="Sheet" from="ui/Sheet" note="Focus trap, Escape, backdrop, scroll lock, safe area. Sets the side edges of its title, body and footer.">
        <Variants>
          <Button onClick={() => setSheet('bottom')}>Open bottom sheet</Button>
          <Button onClick={() => setSheet('full')}>Open full sheet</Button>
        </Variants>
        <Sheet open={sheet !== null} onClose={close} title="Build a scenario" side={sheet ?? 'bottom'} footer={<><Button variant="primary" onClick={close}>Simulate</Button><Button onClick={close}>Reset</Button></>}>
          <div className="space-y-4 py-4">{RACE.map(([n, c]) => <p key={c} className="flex items-center gap-3 type-body text-ink"><Flag code={c} decorative />{n}</p>)}</div>
        </Sheet>
      </Specimen>
      <Specimen name="ScrollRow" from="ui/ScrollRow">
        <ScrollRow label="Rounds" arrows drag snap>
          {Array.from({ length: 24 }, (_, i) => <Chip key={i} onClick={() => {}} pressed={i === 2} className="shrink-0">Round {i + 1}</Chip>)}
        </ScrollRow>
      </Specimen>
      <Specimen name="ScrollArea" from="ui/ScrollArea">
        <ScrollArea label="A long list" maxHeight={160} className="border-y border-line">
          <ul>{Array.from({ length: 16 }, (_, i) => <li key={i} className="border-b border-line py-2 type-data text-ink-2 last:border-b-0">Row {i + 1}</li>)}</ul>
        </ScrollArea>
      </Specimen>
    </Section>
  );
}
