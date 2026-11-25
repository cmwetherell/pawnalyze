import { Section } from '@/components/layout/Section';
import { Flag } from '@/components/ui/Flag';
import { Meter } from '@/components/ui/Meter';
import { Row, Rows } from '@/components/ui/Rows';
import { Tag } from '@/components/ui/Tag';
import { TextLink } from '@/components/ui/TextLink';
import { formatPct } from '@/lib/format';
import { N_ROUNDS, OLYMPIAD_EVENTS, eventHref } from '@/lib/olympiad/config';
import { getOlympiadResult } from '@/lib/olympiad/result';
import type { OlympiadEvent } from '@/lib/olympiad/types';
import { raceHistory } from '@/lib/raceHistory';
import { getBaseSimulationData } from '@/lib/simulations';
import { CANDIDATES_2026, WOMENS_CANDIDATES_2026, type Tournament } from '@/lib/tournaments';

interface ResultRowProps { href: string; flag?: string; name: string; event: string; status?: string; description: string; format: string; chance: number | null }

function ResultRow({ href, flag, name, event, status, description, format, chance }: ResultRowProps) {
  return (
    <Row
      href={href}
      lead={flag && <Flag code={flag} size="xl" decorative />}
      title={name}
      meta={<>{status && <><Tag tone="live" className="mb-1">{status}</Tag><br /></>}<span className="font-medium text-ink">{event}.</span> {format}<br />{description}</>}
      value={chance !== null ? <><span className="sr-only">Chance before round 1: </span>{formatPct(chance)}</> : undefined}
      figure={chance !== null ? <Meter value={chance} ruled /> : undefined}
    />
  );
}

async function OlympiadRow({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const r = await getOlympiadResult(event);
  return (
    <ResultRow
      href={eventHref(event)} flag={r.leader?.fedCode} name={r.leader?.name ?? cfg.shortTitle} event={cfg.shortTitle} description={cfg.description}
      status={r.state === 'live' ? `Leads after round ${r.round} of ${N_ROUNDS}` : undefined}
      format={`${cfg.format.replaceAll(' · ', ', ')}, ${r.nTeams} teams`} chance={r.chance}
    />
  );
}

async function EventRow({ event: e }: { event: Tournament }) {
  const before = e.table && e.winner.key ? raceHistory(await getBaseSimulationData(e.table)).odds.get(e.winner.key)?.[0] : undefined;
  return <ResultRow href={e.href} flag={e.winner.flag} name={e.winner.name} event={e.name} description={e.description} format={e.format} chance={before ?? null} />;
}

export function RecentResults() {
  return (
    <Section title="Recent results" finding="The chance our model gave each winner before round 1." actions={<TextLink standalone href="/simulations">See every simulation</TextLink>}>
      <Rows label="Recent results">
        <OlympiadRow event="open" />
        <OlympiadRow event="women" />
        <EventRow event={CANDIDATES_2026} />
        <EventRow event={WOMENS_CANDIDATES_2026} />
      </Rows>
    </Section>
  );
}
