'use client';

import { useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Delta } from '@/components/ui/Delta';
import { Flag } from '@/components/ui/Flag';
import { Medal } from '@/components/ui/Medal';
import { Meter } from '@/components/ui/Meter';
import { Panel } from '@/components/ui/Panel';
import { Pips } from '@/components/ui/Pips';
import { Podium } from '@/components/ui/Podium';
import { PodiumStrip } from '@/components/ui/PodiumStrip';
import { Row, Rows } from '@/components/ui/Rows';
import { SplitBar } from '@/components/ui/SplitBar';
import { Stat } from '@/components/ui/Stat';
import { StatStrip } from '@/components/ui/StatStrip';
import { Legend, Swatch } from '@/components/ui/Swatch';
import { Table, TBody, Td, Th, THead, Tr, type SortDir } from '@/components/ui/Table';
import { TableFallback } from '@/components/ui/TableFallback';
import { formatPct } from '@/lib/format';
import type { Tone } from '@/lib/theme/tones';
import { BOARD_RACES, CAND_TABLE, GAMES, P1, PODIUM, RACE } from './fixtures';
import { Specimen, Variant, Variants } from './Specimen';

const FORM = 'WDWWWDWDWWL'.split('');
const FORM_TONE: Record<string, Tone> = { W: 'win', D: 'draw', L: 'loss' };
const DEAL = '½½½S½½½½½½½S½ '.split('');
const SEGMENTS = [
  { key: 'w', value: 0.11, tone: 'p1' as const, label: 'Gukesh wins' },
  { key: 'd', value: 0.72, tone: 'draw' as const, label: 'Draw' },
  { key: 'l', value: 0.17, tone: 'p2' as const, label: 'Sindarov wins' },
];
const MEDALS = (g: number, s: number, b: number) => [
  { key: 'g', value: g, tone: 'gold' as const, label: 'Gold' }, { key: 's', value: s, tone: 'silver' as const, label: 'Silver' }, { key: 'b', value: b, tone: 'bronze' as const, label: 'Bronze' },
];

export function StatSpecimens() {
  return (
    <Section id="stats" title="Figures and bars" layout="rail" finding="The serif is for a figure that stands alone. Every bar names its parts to a screen reader.">
      <Specimen name="Stat, Delta" from="ui/Stat, ui/Delta" note="A delta has an arrow, a sign and a unit, and disappears at zero.">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat size="lg" label="Gukesh wins the match" value="15.5%" delta={<Delta value={P1} base={0.151} />} />
          <Stat label="Goes to tiebreaks" value="13.6%" sub="Level after 14 games" />
          <Stat label="Expected finish" value="2.1" delta={<Delta value={2} base={5} unit="places" better="down" />} hint="Lower is better" />
          <Stat size="sm" label="Draw rate" value="67%" delta={<Delta value={67} base={72} unit="pct" quiet />} />
          <Stat label="Podium" value="100%" visual={<SplitBar ariaLabel="Gold 92.8%, silver 7.2%" segments={MEDALS(0.928, 0.072, 0)} height={8} />} />
        </div>
      </Specimen>
      <Specimen name="StatStrip" from="ui/StatStrip">
        <StatStrip columns={6} items={[
          { label: 'Classical', value: '2710 / 2782' }, { label: 'Rapid', value: '2686 / 2755' }, { label: 'Blitz', value: '2659 / 2725' },
          { label: 'Goes to tiebreaks', value: '13.6%' }, { label: 'Last game', value: 'Draw, ½–½' }, { label: 'Draw rate', value: '67%' },
        ]} />
        <StatStrip columns={4} className="mt-6" items={[
          { label: 'Winner', lead: <Flag code="UZB" size="sm" decorative />, value: 'Sindarov', sub: '10 of 14 points' }, { label: 'Chance before round 1', value: '8%', sub: 'Behind four others' },
          { label: 'Favorite before round 1', lead: <Flag code="USA" size="sm" decorative />, value: 'Nakamura', sub: '32%' }, { label: 'Ahead for good', value: 'After round 5' },
        ]} />
      </Specimen>
      <Specimen name="Meter" from="ui/Meter" note="At zero there is no bar and no track.">
        <div className="grid gap-4 sm:max-w-reading">
          <Meter value={0.18} label="right" ruled /><Meter value={0.9282} tone="gold" label="right" baseline={0.18} /><Meter value={0.651} tone="gold" label="right" baseline={0.475} delta={<Delta value={0.651} base={0.475} short />} /><Meter value={P1} tone="p1" label="right" /><Meter value={0} label="right" /><Meter value={0.5} />
        </div>
      </Specimen>
      <Specimen name="SplitBar" from="ui/SplitBar">
        <div className="grid gap-6">
          {([8, 12, 20] as const).map(h => <SplitBar key={h} height={h} ariaLabel="Gukesh 11%, draw 72%, Sindarov 17%" segments={SEGMENTS} />)}
          <SplitBar height={32} labels="inside" ariaLabel="Gukesh 11%, draw 72%, Sindarov 17%" segments={SEGMENTS} tick={0.155} />
          <SplitBar height={12} labels="ends" ariaLabel="Gukesh 15.5%, Sindarov 84.5%" segments={[{ key: '1', value: P1, tone: 'p1', label: 'Gukesh' }, { key: '2', value: 1 - P1, tone: 'p2', label: 'Sindarov' }]} />
          <SplitBar height={32} labels="inside" ariaLabel="Win 60%, draw 30%, loss 10%" segments={[{ key: 'w', value: 0.6, tone: 'win', label: 'Win' }, { key: 'd', value: 0.3, tone: 'draw', label: 'Draw' }, { key: 'l', value: 0.1, tone: 'loss', label: 'Loss' }]} />
          <SplitBar height={32} labels="inside" ariaLabel="Gukesh 17%, Sindarov 59%, still level 24%" segments={[{ key: '1', value: 0.17, tone: 'p1', label: 'Gukesh' }, { key: '2', value: 0.59, tone: 'p2', label: 'Sindarov' }, { key: 'x', value: 0.24, tone: 'level', label: 'Still level' }]} />
        </div>
      </Specimen>
      <Specimen name="Pips" from="ui/Pips" note="Win filled, draw gray, loss outlined. Letters inside from 20px.">
        <div className="grid gap-4">
          {([12, 20, 32] as const).map(s => <Pips key={s} kind="form" size={s} ariaLabel="Gukesh at the Olympiad" items={FORM.map((f, i) => ({ label: `Round ${i + 1}: ${f}`, letter: f, tone: FORM_TONE[f] }))} />)}
          <Pips kind="result" size={32} fill ariaLabel="Simulated match" items={DEAL.map((f, i) => ({ label: `Game ${i + 1}`, letter: f === ' ' ? '–' : f, tone: f === 'S' ? 'p2' : f === ' ' ? 'none' : 'draw' }))} />
          <Pips kind="games" size={20} ariaLabel="Games of the match, each a link" items={GAMES.map(g => ({ label: `Game ${g.gameNo}${g.result ? ': draw' : ', not played'}`, letter: g.result ? '½' : String(g.gameNo), tone: g.result ? 'draw' : 'none', href: `/world-chess-championship-2026/live?game=${g.gameNo}` }))} />
          <Pips kind="eligibility" size={12} ariaLabel="7 of 8 games" items={Array.from({ length: 8 }, (_, i) => ({ label: `Game ${i + 1}`, tone: i < 7 ? 'ink' : 'none' }))} />
        </div>
      </Specimen>
      <Specimen name="Swatch and Legend" from="ui/Swatch">
        <Legend items={[{ tone: 'p1', label: 'Gukesh wins the game' }, { tone: 'draw', label: 'Draw' }, { tone: 'p2', label: 'Sindarov wins the game' }, { tone: 'level', label: 'Still level' }, { tone: 'loss', label: 'Loss' }]} />
        <Variants className="mt-4">{(['square', 'line', 'circle', 'triangle', 'diamond'] as const).map(s => <span key={s} className="inline-flex items-center gap-2 type-label text-ink-3"><Swatch tone="p1" shape={s} />{s}</span>)}</Variants>
      </Specimen>
    </Section>
  );
}

export function ListSpecimens() {
  const [sel, setSel] = useState<string | null>('IND');
  const [sort, setSort] = useState<SortDir>('desc');
  const rows = [...RACE].sort((a, b) => (sort === 'desc' ? b[2] - a[2] : a[2] - b[2]));
  return (
    <Section id="lists" title="Lists and tables" layout="rail" finding="Ruled, never boxed. The name column takes the remaining width; columns drop by priority on small screens.">
      <Specimen name="Rows" from="ui/Rows">
        <Rows label="Recent results">
          <Row href="/simulations/chess-olympiad-2026" lead={<Flag code="UZB" size="lg" decorative />} title="Uzbekistan" meta="Chess Olympiad 2026. Samarkand, 206 teams, 11 rounds" value="18.0%" figure={<Meter value={0.18} ruled />} />
          <Row href="/simulations/candidates-2026" lead={<Avatar size={40} name="Sindarov" src="/players/sindarov.webp" decorative />} title="Javokhir Sindarov" meta="2026 Candidates Tournament. 8-player double round-robin" value="8.2%" figure={<Meter value={0.0819} ruled />} />
          <Row onClick={() => setSel(s => (s === 'IND' ? null : 'IND'))} selected={sel === 'IND'} lead={<Flag code="IND" size="lg" decorative />} title="India" meta="A button row, selected" value="23.4%" />
          <Row href="/simulations/candidates-2026" lead={<Flag code="UZB" size="lg" decorative />} title="2026 Candidates Tournament" meta="8-player double round-robin" aside={<span>Javokhir Sindarov</span>} />
          <Row title="Plain row" meta="Not interactive" value="2710" />
        </Rows>
      </Specimen>
      <Specimen name="Table" from="ui/Table" note="Click a head to sort, a row to select.">
        <Table label="Teams" stickyHead>
          <THead><tr><Th width={48} priority={2}>Pos</Th><Th>Team</Th><Th align="right" priority={4}>Before round 1</Th><Th sort={sort} onSort={() => setSort(s => (s === 'desc' ? 'asc' : 'desc'))}>Gold</Th><Th priority={2}>Podium</Th></tr></THead>
          <TBody>
            {rows.map(([name, code, g, s, b, pre, seed], i) => (
              <Tr key={code} onSelect={() => setSel(code)} selected={sel === code} tint={code === 'UZB' ? 'brand' : undefined}>
                <Td priority={2} muted>{i < 3 && sort === 'desc' ? <Medal rank={(i + 1) as 1 | 2 | 3} /> : i + 1}</Td>
                <Td header press={{ onPress: () => setSel(code), label: name, expanded: sel === code }} lead={<Flag code={code} decorative />} meta={`#${seed}`}><span className="font-medium">{name}</span></Td>
                <Td align="right" priority={4}>{formatPct(pre)}</Td>
                <Td><Meter value={g} tone="gold" label="right" /></Td>
                <Td priority={2}><Meter value={g + s + b} label="right" /></Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Specimen>
      <Specimen name="Table, compact" from="ui/Table">
        <Table label="Roster" density="compact">
          <THead><tr><Th>Team</Th><Th align="right">Gold</Th><Th align="right">Silver</Th></tr></THead>
          <TBody>{RACE.slice(0, 3).map(([n, c, g, s]) => <Tr key={c}><Td header>{n}</Td><Td align="right">{formatPct(g)}</Td><Td align="right" muted>{formatPct(s)}</Td></Tr>)}</TBody>
        </Table>
      </Specimen>
      <Specimen name="TableFallback" from="ui/TableFallback" note="Under every chart. The one table that may scroll sideways."><TableFallback columns={CAND_TABLE.columns} rows={CAND_TABLE.rows} /></Specimen>
      <Specimen name="Podium" from="ui/Podium">
        <div className="grid gap-12">
          <Variant label="row"><Podium layout="row" places={PODIUM} /></Variant>
          <Variant label="stack" className="lg:max-w-reading"><Podium places={PODIUM} /></Variant>
        </div>
      </Specimen>
    </Section>
  );
}

export function StripSpecimens() {
  const [race, setRace] = useState('1');
  return (
    <Section id="strip" title="Podium strip" layout="wide" finding="Five podiums side by side, each a button. It takes the full width; phones swipe, one column at a time.">
      <Specimen name="PodiumStrip" from="ui/PodiumStrip" note="Board prizes of the Chess Olympiad 2026 after round 11.">
        <PodiumStrip label="Board prizes" columns={BOARD_RACES} selected={race} onSelect={setRace} />
      </Specimen>
    </Section>
  );
}

const panel = (
  <Panel>
    <Panel.Head><p className="type-h3 text-ink">An instrument</p></Panel.Head>
    <Panel.Body><p className="type-body text-ink-2">Panels are for things people operate: the scenario builder, the what-if lab, the Elocator input.</p></Panel.Body>
    <Panel.Foot><Button variant="primary" size="sm">Simulate</Button><Button size="sm" variant="quiet">Reset</Button></Panel.Foot>
  </Panel>
);

export function PanelSpecimens() {
  return (
    <Section id="panels" title="Panel" layout="split" finding="The only box on the site. On a surface band it rises to the raised ground.">
      {panel}
      <Panel padding="md"><p className="type-body text-ink-2">With plain padding.</p></Panel>
    </Section>
  );
}

/** For a surface SectionGroup. */
export function SurfaceSpecimens() {
  return (
    <Section id="surface" title="On a surface band" layout="split">
      {panel}
      <Rows label="Rows on surface"><Row href="/simulations" title="Row on surface" meta="Hover steps to sunken" /></Rows>
    </Section>
  );
}
