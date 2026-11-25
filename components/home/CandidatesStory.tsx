import { LineChart, type LineSeries } from '@/components/charts/LineChart';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { formatPct } from '@/lib/format';
import { getPlayerName, getPlayerShortName as shortName, getPlayerTone } from '@/lib/playerData';
import { raceHistory, tookTheLead } from '@/lib/raceHistory';
import { getBaseSimulationData } from '@/lib/simulations';
import { CANDIDATES_2026 as EVENT } from '@/lib/tournaments';

/** A player is named on the chart if the model ever gave them more than this. */
const NAMED_ABOVE = 0.1;

export async function CandidatesStory() {
  const history = raceHistory(await getBaseSimulationData(EVENT.table!));
  const winner = EVENT.winner.key!;
  const line = history.odds.get(winner);
  if (!line) return null;

  const lead = tookTheLead(history, winner);
  const start = formatPct(line[0]);
  const players = [...history.odds.keys()];
  const series = players.map((name, i): LineSeries => {
    const values = history.odds.get(name)!;
    const peak = Math.max(...values);
    return {
      id: name, label: shortName(name), values: values.map(v => v * 100), tone: getPlayerTone(name, i),
      emphasis: name === winner ? 'strong' : 'context',
      labelAt: name === winner ? 'end' : peak > NAMED_ABOVE ? values.indexOf(peak) : 'none',
    };
  });

  return (
    <Section
      title={EVENT.name}
      finding={<>{EVENT.winner.name} won from a starting chance of {start}.{lead && ` ${EVENT.winner.name.split(' ').at(-1)} took the lead for good after round ${lead.round}.`}</>}
      actions={<TextLink standalone href={EVENT.href}>Replay the Candidates</TextLink>}
    >
      <LineChart
        caption="Chance to win the tournament after each round"
        ariaLabel={`${EVENT.winner.name} rose from ${start} before round 1 to ${formatPct(line[line.length - 1])} after round ${history.rounds[history.rounds.length - 1]}`}
        series={series}
        x={{ labels: history.rounds, titles: history.rounds.map(r => (r === 'Pre' ? 'Before round 1' : `After round ${r}`)), every: { desktop: 1, phone: 3 } }}
        y={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], format: 'percent0' }}
        table={{ columns: ['Round', ...players.map(shortName)], rows: history.rounds.map((r, i) => [r, ...players.map(p => formatPct(history.odds.get(p)![i]))]) }}
      />
    </Section>
  );
}
