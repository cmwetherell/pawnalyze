'use client';

import { useState } from 'react';

import { BarRows } from '@/components/charts/BarRows';
import { ButterflyChart } from '@/components/charts/ButterflyChart';
import { ChartGroup } from '@/components/charts/ChartGroup';
import { ColumnChart } from '@/components/charts/ColumnChart';
import { LadderChart } from '@/components/charts/LadderChart';
import { LineChart } from '@/components/charts/LineChart';
import { PawnBar } from '@/components/charts/PawnBar';
import { RaceRows } from '@/components/charts/RaceRows';
import { Sparkline } from '@/components/charts/Sparkline';
import { SplitRows } from '@/components/charts/SplitRows';
import { Section } from '@/components/layout/Section';
import { Delta } from '@/components/ui/Delta';
import { Legend } from '@/components/ui/Legend';
import goc from '@/lib/elocator/game-of-the-century.json';
import { formatPct } from '@/lib/format';
import { complexityTone, seriesTone } from '@/lib/theme/tones';
import { CAND_ROUNDS, CAND_SERIES, CAND_TABLE, CLINCH, P1, RACE, RUNGS, SCORES } from './fixtures';
import { Specimen, Variant } from './Specimen';

const HISTORY_X = ['Pre', ...Array.from({ length: 14 }, (_, i) => `G${i + 1}`), 'TB'];
const blank = (values: number[], n: number) => [...values, ...Array<null>(n - values.length).fill(null)];
const COLUMNS = CLINCH.map(([label, sub, p1, p2]) => ({ key: label, label, sub, parts: [{ tone: 'p1' as const, value: p1, label: 'Gukesh clinches' }, { tone: 'p2' as const, value: p2, label: 'Sindarov clinches' }] }));
const MOVES = goc as { ply: number; san?: string; c: number }[];
const WHITE = MOVES.filter(m => m.ply % 2 === 0).map(m => m.c);
const BLACK = MOVES.filter(m => m.ply % 2 === 1).map(m => m.c);

export function ChartSpecimens() {
  const [ply, setPly] = useState(33);
  const [team, setTeam] = useState<string | null>('UZB');
  const [player, setPlayer] = useState('Sindarov');
  return (
    <>
      <Section id="charts" title="Line charts" layout="rail" finding="One strong line, the rest context, labels beside the marks. Pointer, touch and arrow keys move the crosshair. Every chart has a table.">
        <Specimen name="LineChart" from="charts/LineChart">
          <LineChart caption="Chance to win the tournament after each round" ariaLabel="Sindarov rose from 8.2% before round 1 to 100% after round 13" series={CAND_SERIES} x={{ labels: CAND_ROUNDS, every: { desktop: 1, phone: 3 } }} y={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], format: 'percent0' }} table={CAND_TABLE} />
        </Specimen>
        <Specimen name="LineChart with markers and now" from="charts/LineChart" note="Empty ground for games not played.">
          <LineChart
            caption="Gukesh’s chance to win the match after each game" ariaLabel="Gukesh 15.1% before the match, 15.5% after game 1" height={{ desktop: 320, phone: 260 }}
            series={[{ id: 'g', label: 'Gukesh', values: blank([15.1, 15.5], 16), tone: 'p1', emphasis: 'strong' }]} x={{ labels: HISTORY_X, every: { desktop: 1, phone: 3 } }} y={{ min: 0, max: 50, ticks: [0, 25, 50], format: 'percent0' }} now={1}
            markers={[{ x: 0, y: 31.3, shape: 'triangle', label: 'bet365', group: 'bet365' }, { x: 1, y: 27.4, shape: 'circle', label: 'Kalshi', group: 'Kalshi' }, { x: 1, y: 26.5, shape: 'square', label: 'Polymarket', group: 'Polymarket' }]}
            table={{ columns: ['Game', 'Gukesh'], rows: [['Pre', '15.1%'], ['G1', '15.5%']] }}
          />
        </Specimen>
        <Specimen name="LineChart, selected point and area" from="charts/LineChart" note="Click or arrow to choose a position.">
          <LineChart
            caption="Complexity of each position, Byrne against Fischer, 1956" ariaLabel="Complexity peaks at 94 after 17. Kf1" height={{ desktop: 300, phone: 240 }}
            series={[{ id: 'w', label: 'Complexity', short: 'Score', values: MOVES.map(m => m.c), tone: 'ink', emphasis: 'strong' }]} area={{ series: 'w', mode: 'zero' }}
            x={{ labels: MOVES.map(m => (m.ply === 0 ? '0' : String(Math.ceil(m.ply / 2)))), every: { desktop: 10, phone: 20 } }} y={{ min: 0, max: 100, ticks: [0, 50, 100], format: 'int' }} selected={ply} onSelect={setPly}
            table={{ columns: ['Ply', 'Complexity'], rows: MOVES.map(m => [m.ply, m.c]) }}
          />
        </Specimen>
        <Specimen name="LineChart, all points and a reference" from="charts/LineChart">
          <LineChart
            caption="Complexity of the first 12 positions with White to move" ariaLabel={`Complexity of the first 12 positions with White to move, highest ${Math.max(...WHITE.slice(0, 12))}`} height={{ desktop: 240, phone: 220 }} points="all" refs={[{ y: 50, label: 'Moderate below 50' }]}
            series={[{ id: 'w', label: 'White', values: WHITE.slice(0, 12), tone: 'series-3', emphasis: 'normal' }]}
            x={{ labels: Array.from({ length: 12 }, (_, i) => String(i + 1)) }} y={{ min: 0, max: 100, ticks: [0, 50, 100], format: 'int' }} table={{ columns: ['Move', 'Score'], rows: WHITE.slice(0, 12).map((v, i) => [i + 1, v]) }}
          />
        </Specimen>
        <Specimen name="LineChart with onSeries" from="charts/LineChart" note="Each label is a button; so is each line.">
          <LineChart
            caption="Chance to win the tournament after each of the first six rounds" ariaLabel="Sindarov led with 70.8% after round 6" height={{ desktop: 360, phone: 320 }} onSeries={setPlayer} seriesAction="choose"
            series={CAND_SERIES.map((s, i) => ({ ...s, values: s.values.slice(0, 7), tone: seriesTone(i), emphasis: s.id === player ? 'strong' : 'context', labelAt: 'end' }))} x={{ labels: CAND_ROUNDS.slice(0, 7) }} y={{ min: 0, max: 75, ticks: [0, 25, 50, 75], format: 'percent0' }}
            table={{ columns: CAND_TABLE.columns, rows: CAND_TABLE.rows.slice(0, 7) }}
          />
          <p aria-live="polite" className="mt-2 type-small text-ink-2">Chosen: {player}</p>
        </Specimen>
        <Specimen name="ChartGroup" from="charts/ChartGroup" note="Two charts on one x. The crosshair and the plot edges are shared.">
          <ChartGroup className="grid gap-6">
            {([['Byrne', 'White', WHITE, 'series-1'], ['Fischer', 'Black', BLACK, 'series-2']] as const).map(([name, side, values, tone]) => (
              <LineChart
                key={name} caption={`Complexity with ${side}, ${name}, to move`} ariaLabel={`Complexity with ${name} to move, highest ${Math.max(...values)}`} height={{ desktop: 220, phone: 180 }}
                series={[{ id: name, label: name, values: [...values, ...Array<null>(WHITE.length - values.length).fill(null)], tone }]}
                x={{ labels: WHITE.map((_, i) => String(i + 1)), every: { desktop: 5, phone: 10 } }} y={{ min: 0, max: 100, ticks: [0, 50, 100], format: 'int' }}
                table={{ columns: ['Move', 'Score'], rows: values.map((v, i) => [i + 1, v]) }}
              />
            ))}
          </ChartGroup>
        </Specimen>
        <Specimen name="Sparkline" from="charts/Sparkline"><div className="w-48"><Sparkline values={CAND_SERIES[0].values} tone="series-1" label="Sindarov" /></div></Specimen>
      </Section>

      <Section id="bars" title="Columns and rows" layout="rail" finding="Bars start at zero. The largest column is set large. Zero draws no bar." legend={<Legend items={[{ tone: 'p1', label: 'Gukesh' }, { tone: 'p2', label: 'Sindarov' }]} />}>
        <Specimen name="ColumnChart" from="charts/ColumnChart">
          <ColumnChart columns={COLUMNS} format="pct0" ariaLabel="The match most often ends in game 13, 28.9%" table={{ columns: ['Game', 'Gukesh', 'Sindarov'], rows: CLINCH.map(([g, , a, b]) => [g, formatPct(a), formatPct(b)]) }} />
        </Specimen>
        <Specimen name="ColumnChart, dense" from="charts/ColumnChart" note="83 positions, no printed values.">
          <ColumnChart values={false} peak={false} height={160} selected={String(ply)} onSelect={k => setPly(Number(k))} format="int" ariaLabel="Complexity by position" columns={MOVES.map(m => ({ key: String(m.ply), label: m.ply % 20 === 0 ? String(m.ply / 2) : '', parts: [{ tone: complexityTone(m.c), value: m.c, label: 'Complexity' }] }))} />
        </Specimen>
        <Specimen name="ButterflyChart" from="charts/ButterflyChart">
          <ButterflyChart leftTone="p1" rightTone="p2" names={['Gukesh', 'Sindarov']} format="pct" ariaLabel="Final classical score" rows={SCORES.map(([label, sub, left, right], i) => ({ key: label, label, sub, left, right, divider: i === 0 }))} />
        </Specimen>
        <Specimen name="LadderChart" from="charts/LadderChart"><LadderChart rungs={RUNGS} /></Specimen>
        <Specimen name="SplitRows" from="charts/SplitRows" note="The same split from several sources, bars aligned. Our own row is the one gold wash on the page.">
          <SplitRows
            label="Match odds by source" head="Source" names={['Gukesh', 'Sindarov']} tones={['p1', 'p2']} columns={['Traded', 'Updated']}
            rows={[
              { key: 'own', title: 'Pawnalyze model', meta: 'Exact match odds from ratings', left: P1, own: true },
              { key: 'kalshi', title: 'Kalshi', href: 'https://kalshi.com', meta: 'Mid-price', left: 0.274, cells: ['995k contracts', '2 min ago'] },
              { key: 'bet365', title: 'bet365', meta: 'Bookmaker reference, margin removed', left: 0.313, cells: [null, 'Sept 27, 2026'] },
              { key: 'none', title: 'Polymarket', meta: 'Prices are unavailable right now.', left: null },
            ]}
          />
        </Specimen>
        <Specimen name="RaceRows" from="charts/RaceRows" note="Tick: the value before the scenario.">
          <RaceRows
            ruled ariaLabel="Gold race"
            rows={RACE.map(([name, flag, g, s, b, pre, seed], i) => ({
              key: flag, rank: i + 1, flag, name, seed: `#${seed} seed`, value: formatPct(g), sub: `podium ${formatPct(g + s + b)}`, baseline: i < 2 ? pre : undefined, delta: i < 2 ? <Delta value={g} base={pre} /> : undefined,
              segments: [{ key: 'g', value: g, tone: 'gold' as const, label: 'Gold' }, { key: 's', value: s, tone: 'silver' as const, label: 'Silver' }, { key: 'b', value: b, tone: 'bronze' as const, label: 'Bronze' }],
              selected: team === flag, onSelect: () => setTeam(t => (t === flag ? null : flag)),
            }))}
          />
        </Specimen>
        <Specimen name="BarRows" from="charts/BarRows">
          <BarRows format="percent" rows={CAND_SERIES.slice(0, 5).map((s, i) => ({ key: s.id, label: s.label, value: s.values[0] ?? 0, tone: seriesTone(i) }))} />
          <Variant label="size sm"><BarRows className="w-72" size="sm" format="percent" rows={CAND_SERIES.slice(0, 3).map((x, i) => ({ key: x.id, label: x.label, value: x.values[0] ?? 0, tone: seriesTone(i) }))} /></Variant>
        </Specimen>
        <Specimen name="PawnBar" from="charts/PawnBar" note="A hundred pawns, dealt once.">
          <div className="grid gap-8"><PawnBar p1={P1} names={['Gukesh', 'Sindarov']} deal /><Variant label="Champion"><PawnBar p1={0} names={['Gukesh', 'Sindarov']} /></Variant></div>
        </Specimen>
      </Section>
    </>
  );
}
