'use client';

import { memo } from 'react';

import { ButterflyChart } from '@/components/charts/ButterflyChart';
import { ColumnChart } from '@/components/charts/ColumnChart';
import { LadderChart, type LadderRung } from '@/components/charts/LadderChart';
import { Part } from '@/components/layout/Part';
import { Section } from '@/components/layout/Section';
import { Legend } from '@/components/ui/Swatch';
import { formatPct } from '@/lib/format';
import { CLASSICAL_SCHEDULE, LADDER, STAGE_ORDER, TIEBREAK_START } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import { fmtScore } from '@/lib/wcc/status';
import type { MatchOdds } from '@/lib/wcc/types';

interface Props { odds: MatchOdds; players: Players; finished: boolean }

/** Chances under this have no height in the chart; the table has them. */
const SMALLEST = 0.001;

const date = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');

/** When the match is decided, with what score, and at which stage. */
export const MatchEnding = memo(function MatchEnding(props: Props) {
  return (
    <>
      <WhenDecided {...props} />
      <Section layout="split" label="Scores and tiebreaks">
        <Scores {...props} />
        <Ladder {...props} />
      </Section>
    </>
  );
});

function WhenDecided({ odds, players, finished }: Props) {
  const cols = odds.endGame.map(e => {
    const tb = e.g === 'tb';
    const iso = tb ? TIEBREAK_START : CLASSICAL_SCHEDULE[(e.g as number) - 1].startsAt;
    return { key: String(e.g), label: tb ? 'TB' : `G${e.g}`, name: tb ? 'Tiebreaks' : `Game ${e.g}`, date: date(iso), p1: e.p1, p2: e.p2, total: e.p1 + e.p2 };
  });
  const mode = cols.reduce((a, c) => (c.total > a.total ? c : a), cols[0]);
  const byG14 = cols.filter(c => c.key !== 'tb').reduce((a, c) => a + c.total, 0);
  const [p1, p2] = [players[1].shortName, players[2].shortName];
  const was = finished ? 'was' : 'is';
  return (
    <Section
      id="when"
      layout="wide"
      title={mode.key === 'tb' ? `Tiebreaks ${finished ? 'were' : 'are'} the likeliest finish` : `${mode.name} ${was} the likeliest finish`}
      finding={
        <>
          Most likely decided <strong className="font-medium text-ink">{mode.key === 'tb' ? 'in the tiebreaks' : `in game ${mode.key}`}, {mode.date}</strong> ({formatPct(mode.total)}).
          {' '}The match is over before the tiebreak day in {formatPct(byG14)} of cases.
        </>
      }
      actions={<Legend items={[{ tone: 'p1', label: `${p1} clinches` }, { tone: 'p2', label: `${p2} clinches` }]} />}
    >
      <ColumnChart
        columns={cols.map(c => ({
          key: c.key, label: c.label, sub: c.date, title: `${c.name}, ${c.date}`,
          // A share too small to draw would look as large as its neighbour.
          parts: [{ tone: 'p1' as const, value: c.p1, label: p1 }, { tone: 'p2' as const, value: c.p2, label: p2 }].filter(p => p.value > SMALLEST || p.value * 2 >= c.total),
        }))}
        format={v => formatPct(v, v < 0.1 ? 1 : 0)}
        peak
        height={300}
        caption="Chance the match is decided at each game. Games 1 to 7 cannot decide it: 7½ points need at least 8 games."
        ariaLabel={`Chance the match is decided at each game. Most likely ${mode.name.toLowerCase()} (${formatPct(mode.total)}).`}
        table={{ columns: ['Decided at', 'Date', p1, p2, 'Total'], rows: cols.map(c => [c.name, c.date, formatPct(c.p1), formatPct(c.p2), formatPct(c.total)]) }}
      />
    </Section>
  );
}

interface ScoreRow { key: string; label: string; sub: string; p1: number; p2: number }

/** Every finish in a fixed order, so the shape stays stable as scenarios change. */
function scoreRows(odds: MatchOdds): ScoreRow[] {
  const cells = new Map<string, ScoreRow>();
  const get = (win: number, lose: number, games: number) => {
    const key = `${win}-${lose}-${games}`;
    const row = cells.get(key) ?? { key, label: fmtScore(win, lose), sub: `after G${games}`, p1: 0, p2: 0 };
    cells.set(key, row);
    return row;
  };
  // 7½–x (a draw or win from 7) and 8–x (a win from 7) are the only ways to reach the clinch.
  for (let g = 14; g >= 8; g--) {
    get(15, 2 * g - 15, g);
    get(16, 2 * g - 16, g);
  }
  for (const r of odds.scoreDist) {
    if (r.p1_hp === r.p2_hp) continue;
    const row = get(Math.max(r.p1_hp, r.p2_hp), Math.min(r.p1_hp, r.p2_hp), r.games);
    if (r.p1_hp > r.p2_hp) row.p1 += r.p; else row.p2 += r.p;
  }
  const tb = odds.endGame.find(e => e.g === 'tb');
  return [{ key: 'tb', label: '7–7', sub: 'tiebreak', p1: tb?.p1 ?? 0, p2: tb?.p2 ?? 0 }, ...cells.values()];
}

function Scores({ odds, players, finished }: Props) {
  const rows = scoreRows(odds);
  const best = rows.reduce((a, r) => (Math.max(r.p1, r.p2) > Math.max(a.p1, a.p2) ? r : a), rows[0]);
  const bestP = Math.max(best.p1, best.p2);
  const who = players[best.p1 >= best.p2 ? 1 : 2].shortName;
  const [p1, p2] = [players[1].shortName, players[2].shortName];
  return (
    <Part
      id="scores"
      title={`${best.label}${best.key === 'tb' ? '' : ` to ${who}`} ${finished ? 'was' : 'is'} the likeliest score`}
      finding={<>The single most likely finish is <strong className="font-medium text-ink">{best.key === 'tb' ? `7–7 and a tiebreak won by ${who}` : `${who} ${best.label} ${best.sub}`}</strong> ({formatPct(bestP)}). Matches stop the moment someone reaches 7½.</>}
      legend={<Legend items={[{ tone: 'p1', label: `${p1} wins` }, { tone: 'p2', label: `${p2} wins` }]} />}
    >
      <ButterflyChart
        rows={rows.map(r => ({ key: r.key, label: r.label, sub: r.sub, left: r.p1, right: r.p2, divider: r.key === 'tb' }))}
        leftTone="p1" rightTone="p2" names={[p1, p2]} format="pct"
        ariaLabel={`Final score probabilities. Most likely: ${best.label} ${best.sub}.`}
        table={{ columns: ['Score', 'Finish', `${p1} wins`, `${p2} wins`], rows: rows.map(r => [r.label, r.sub, formatPct(r.p1), formatPct(r.p2)]) }}
      />
    </Part>
  );
}

function Ladder({ odds, players }: Props) {
  const [p1, p2] = [players[1].shortName, players[2].shortName];
  const rungs: LadderRung[] = STAGE_ORDER.map(s => {
    const { reach, p1: w1, p2: w2 } = odds.stages[s];
    const share = (v: number) => (reach > 0 ? v / reach : 0);
    const level = Math.max(0, reach - w1 - w2);
    return {
      label: LADDER[s].label, sub: LADDER[s].short, rule: LADDER[s].rule, reach,
      segments: [
        { key: 'p1', tone: 'p1', value: share(w1), label: `${p1} wins` },
        { key: 'p2', tone: 'p2', value: share(w2), label: `${p2} wins` },
        ...(s === 'sd' ? [] : [{ key: 'level', tone: 'level' as const, value: share(level), label: 'still level' }]),
      ],
    };
  });
  return (
    <Part
      id="how-it-ends"
      title="The tiebreak ladder"
      finding={<><strong className="font-medium text-ink">{formatPct(odds.pTb)}</strong> of matches reach the tiebreaks. Each stage is only played if the match is still level. Bars show who wins among matches that reach that stage.</>}
      legend={<Legend items={[{ tone: 'p1', label: `${p1} wins here` }, { tone: 'p2', label: `${p2} wins here` }, { tone: 'level', label: 'Still level, next stage' }]} />}
    >
      <LadderChart
        rungs={rungs}
        ariaLabel={`Match reaches a tiebreak in ${formatPct(odds.pTb)} of cases`}
        table={{
          columns: ['Stage', 'Reached', `${p1} wins (all matches)`, `${p2} wins (all matches)`],
          rows: STAGE_ORDER.map(s => [LADDER[s].label, formatPct(odds.stages[s].reach), formatPct(odds.stages[s].p1), formatPct(odds.stages[s].p2)]),
        }}
      />
    </Part>
  );
}
