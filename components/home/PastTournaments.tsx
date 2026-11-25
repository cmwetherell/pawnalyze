import { Section } from '@/components/layout/Section';
import { Flag } from '@/components/ui/Flag';
import { FlagStack } from '@/components/ui/FlagStack';
import { Heading } from '@/components/ui/Heading';
import { Medal } from '@/components/ui/Medal';
import { Row, Rows } from '@/components/ui/Rows';
import { Tag } from '@/components/ui/Tag';
import { N_ROUNDS, OLYMPIAD_EVENTS, eventHref } from '@/lib/olympiad/config';
import { getOlympiadResult } from '@/lib/olympiad/result';
import type { OlympiadEvent } from '@/lib/olympiad/types';
import { TOURNAMENT_YEARS, type Tournament } from '@/lib/tournaments';

const Meta = ({ description, facts }: { description: string; facts: string }) => <>{description}<br /><span className="text-ink-3">{facts}</span></>;

const Winner = ({ name }: { name: string }) => (
  <span className="inline-flex items-center gap-2"><Medal rank={1} decorative /><span className="sr-only">Winner: </span>{name}</span>
);

async function OlympiadRow({ event }: { event: OlympiadEvent }) {
  const cfg = OLYMPIAD_EVENTS[event];
  const r = await getOlympiadResult(event);
  const stage = r.state === 'final'
    ? `${r.nTeams} teams`
    : r.nSims === null ? 'sims coming soon' : `${r.round > 0 ? `round ${r.round} of ${N_ROUNDS}` : 'pre-tournament'}, ${r.nSims.toLocaleString('en-US')} sims`;
  return (
    <Row
      href={eventHref(event)}
      lead={r.leader && <Flag code={r.leader.fedCode} size="xl" decorative />}
      title={cfg.shortTitle}
      meta={<Meta description={cfg.description} facts={`${cfg.format.replaceAll(' · ', ', ')}, ${stage}`} />}
      aside={
        <>
          {r.state === 'final' ? r.leader && <Winner name={r.leader.name} /> : <Tag tone={r.state === 'live' ? 'live' : 'neutral'}>{r.state === 'live' ? 'Live' : 'Upcoming'}</Tag>}
          {r.teams.length > 0 && <FlagStack size="sm" items={r.teams.map(t => ({ code: t.fedCode, name: t.name }))} more={Math.max(0, r.nTeams - r.teams.length)} label={r.state === 'final' ? 'Medallists' : 'Top seeds'} />}
        </>
      }
    />
  );
}

const EventRow = ({ event: e }: { event: Tournament }) => (
  <Row
    href={e.href}
    lead={<Flag code={e.winner.flag} size="xl" decorative />}
    title={e.name}
    meta={<Meta description={e.description} facts={e.format} />}
    aside={<Winner name={e.winner.name} />}
  />
);

export function PastTournaments() {
  return (
    <Section title="Past tournaments">
      <div className="flex flex-col gap-12">
        {TOURNAMENT_YEARS.map(y => (
          <div key={y.year}>
            <Heading level={3} style="h3" className="mb-4">{y.year}</Heading>
            <Rows label={`Tournaments of ${y.year}`}>
              {y.olympiads.map(o => <OlympiadRow key={o} event={o} />)}
              {y.events.map(e => <EventRow key={e.href} event={e} />)}
            </Rows>
          </div>
        ))}
      </div>
    </Section>
  );
}
