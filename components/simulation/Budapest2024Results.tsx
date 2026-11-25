'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Flag } from '@/components/ui/Flag';
import { Meter } from '@/components/ui/Meter';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TBody, Td, Th, THead, Tr, type SortDir } from '@/components/ui/Table';
import { sentenceName, shortTeamName } from '@/components/olympiad/teams';
import { formatPct } from '@/lib/format';
import { clearlyAbove } from '@/lib/raceHistory';
import { seriesTone } from '@/lib/theme/tones';
import teamMap from '@/public/olympiadTeamMap.json';
import { OddsByRound, type OddsEntry } from './OddsByRound';

type Medal = 'gold' | 'silver' | 'bronze';
type Chances = { country: string; percentage: string }[];
interface MedalSims { rounds: ({ round: string } & Record<Medal, Chances>)[]; nSims: number; highestRound: number }

const MEDALS: Medal[] = ['gold', 'silver', 'bronze'];
const WORD: Record<Medal, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
/** Countries with a line of their own in the chart; the rest are added up. */
const TOP = 8;

const code = (country: string): string | undefined => (teamMap as Record<string, string>)[country];
const shortName = (country: string) => (country === 'Czech Republic' ? 'Czechia' : shortTeamName(country));
const codeName = (country: string) => (code(country) ?? country) + (country.endsWith(' B') ? ' B' : '');
const inSentence = (country: string) => sentenceName(country).replace(/^The /, 'the ');
/** Less prints as 0.0%. */
const SHOWN = 0.0005;
/** 0..1 */
const chance = (list: Chances | undefined, country: string) => Number(list?.find(c => c.country === country)?.percentage ?? 0) / 100;

/** Budapest 2024: medal chances after each round, and the table of every country that won one in a simulation. `notice` stands under the chart. */
export function Budapest2024Results({ notice }: { notice?: ReactNode }) {
  const [sims, setSims] = useState<MedalSims | null>(null);
  const [failed, setFailed] = useState(false);
  const [sort, setSort] = useState<{ by: Medal; dir: SortDir }>({ by: 'gold', dir: 'desc' });
  const [all, setAll] = useState(false);

  const load = useCallback(() => fetch('/api/sims/olympiad', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    .then(res => { if (!res.ok) throw new Error(`Server responded with an error: ${res.status}`); return res.json(); })
    .then(
      (data: MedalSims) => setSims(data),
      error => { console.error('Failed to fetch:', error); setFailed(true); },
    ), []);
  useEffect(() => { void load(); }, [load]);

  const round = sims?.highestRound ?? 0;
  const title = `Medal chances by country after round ${round}`;
  if (!sims) {
    return (
      <Section id="results" title="The race for gold">
        {failed
          ? <Callout tone="negative" icon="error" action={<Button size="sm" onClick={() => { setFailed(false); void load(); }}>Try again</Button>}>The simulations could not be loaded.</Callout>
          : <div aria-busy="true" className="flex flex-col gap-12"><Skeleton kind="chart" height={420} label="Loading the simulations" /><Skeleton kind="bars" rows={10} /></div>}
      </Section>
    );
  }

  const now = sims.rounds[round];
  const ranked = [...now.gold].sort((a, b) => Number(b.percentage) - Number(a.percentage)).map(c => c.country);
  const named = ranked.slice(0, TOP);
  const entries: OddsEntry[] = named.map((country, i) => ({
    id: country, name: shortName(country), short: code(country), flag: code(country), tone: seriesTone(i), emphasis: i === 0 ? 'strong' : 'context',
    values: sims.rounds.map(r => chance(r.gold, country)),
  }));
  if (ranked.length > TOP) {
    entries.push({
      id: 'Other', name: 'Other', tone: 'context', emphasis: 'context',
      values: sims.rounds.map(r => r.gold.filter(c => !named.includes(c.country)).reduce((sum, c) => sum + Number(c.percentage), 0) / 100),
    });
  }
  const leader = entries[0];
  // Every load draws another sample, so the finding is in words that hold for all of them.
  const clear = (a: OddsEntry, b: OddsEntry, i: number) => clearlyAbove(a.values[i], b.values[i], sims.nSims);
  const rivals = entries.filter(e => e !== leader && e.id !== 'Other');
  const level = leader ? rivals.filter(e => !clear(leader, e, 0) && !clear(e, leader, 0)) : [];
  const finding = leader && round > 0 && rivals.every(e => clear(leader, e, round))
    ? `${sentenceName(leader.name)} ${level.length > 0 ? `started level with ${new Intl.ListFormat('en-US').format(level.map(e => inSentence(e.name)))}` : rivals.every(e => clear(leader, e, 0)) ? 'started as the favorite' : 'started behind'} and was the clear favorite after round ${round}.`
    : undefined;

  const countries = [...new Set(sims.rounds.flatMap(r => MEDALS.flatMap(m => r[m].map(c => c.country))))];
  const rows = countries
    .map(country => ({ country, gold: chance(now.gold, country), silver: chance(now.silver, country), bronze: chance(now.bronze, country) }))
    .sort((a, b) => (sort.dir === 'asc' ? a[sort.by] - b[sort.by] : b[sort.by] - a[sort.by]) || b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || a.country.localeCompare(b.country));
  const likely = rows.filter(r => MEDALS.some(m => r[m] >= SHOWN));
  const visible = all ? rows : likely;
  const sortBy = (by: Medal) => setSort(s => ({ by, dir: s.by === by && s.dir === 'desc' ? 'asc' : 'desc' }));

  return (
    <>
      <Section
        id="results"
        title="The race for gold"
        finding={finding}
        findingFrom="lg"
      >
        <OddsByRound
          entries={entries}
          rounds={sims.rounds.map(r => (r.round === '0' ? { label: 'Pre', title: 'Before round 1' } : { label: r.round, title: `After round ${r.round}` }))}
          noun="Country"
          caption="Chance to win gold after each round"
          ariaLabel={`Chance to win gold after each round. ${leader ? `${leader.name}: ${formatPct(leader.values[0])} before round 1, ${formatPct(leader.values[round])} after round ${round}.` : ''}`}
          note={`Total simulations after round ${round}: ${sims.nSims.toLocaleString('en-US')}, a random sample drawn anew on each load.`}
          readout={false}
        />
        {finding && <p className="mt-6 type-body text-ink-2 lg:hidden">{finding}</p>}
        {notice && <div className="mt-8">{notice}</div>}
      </Section>
      <Section id="medals" title={title} finding="Every country in the table won at least one medal in at least one simulation, even if the percentage shows 0.0%.">
        <Table label={title}>
          <THead>
            <tr>
              <Th>Country</Th>
              {MEDALS.map(m => <Th key={m} align="right" sort={sort.by === m ? sort.dir : null} onSort={() => sortBy(m)}>{WORD[m]}</Th>)}
            </tr>
          </THead>
          <TBody>
            {visible.map(r => (
              <Tr key={r.country}>
                <Td header lead={<Flag code={code(r.country) ?? r.country} size="sm" decorative />}>
                  {/* Under 390 only the code fits beside three figures. */}
                  <span className="max-sm:hidden">{r.country}</span>
                  <span className="hidden max-sm:inline max-[389px]:hidden">{shortName(r.country)}</span>
                  <span className="min-[390px]:hidden" title={r.country}>{codeName(r.country)}</span>
                </Td>
                <Td align="right" muted={r.gold === 0}>
                  <span className="sm:hidden">{formatPct(r.gold)}</span>
                  <Meter value={r.gold} tone="gold" label="right" className="max-sm:hidden" />
                </Td>
                <Td align="right" muted={r.silver === 0}>{formatPct(r.silver)}</Td>
                <Td align="right" muted={r.bronze === 0}>{formatPct(r.bronze)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        {likely.length < rows.length && (
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => setAll(v => !v)}>{all ? 'Hide the rest' : `Show all ${rows.length}`}</Button>
          </div>
        )}
      </Section>
    </>
  );
}
