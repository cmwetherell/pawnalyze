'use client';

import { MatchCalendar } from '@/components/chess/MatchCalendar';
import { Section } from '@/components/layout/Section';
import { Photo } from '@/components/ui/Photo';
import { TextLink } from '@/components/ui/TextLink';
import { useMounted } from '@/hooks/useNow';
import { CLASSICAL_SCHEDULE, EVENT, SCHEDULE_DAYS, WCC_HREF } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import { WCC_PHOTOS } from '@/lib/wcc/photos';
import type { WccGame } from '@/lib/wcc/types';

/** Zones that read the same clock as Geneva. */
const SAME_CLOCK = new Set(['Europe/Zurich', 'Europe/Paris', 'Europe/Berlin']);

export const liveHref = (gameNo: number) => `${WCC_HREF}/live?game=${gameNo}`;

export function Schedule({ games, players }: { games: WccGame[]; players: Players }) {
  const mounted = useMounted();
  const local = mounted && !SAME_CLOCK.has(Intl.DateTimeFormat().resolvedOptions().timeZone)
    ? new Date(CLASSICAL_SCHEDULE[0].startsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
    : null;
  return (
    <Section
      id="schedule"
      title="Schedule"
      finding={
        <>
          Games start at <strong className="font-medium text-ink">15:00 CET</strong>{local && <>, <strong className="font-medium text-ink">{local}</strong> where you are</>}, at the {EVENT.venue} in {EVENT.venueArea}.
          {' '}Opening ceremony at the {EVENT.ceremonyVenue} on 22 Nov, where the colours are drawn. {EVENT.drawRule}.
        </>
      }
      legend={<Photo photo={WCC_PHOTOS.venue} ratio="3/2" sizes="(min-width: 1280px) 302px, (min-width: 1024px) 22vw, 100vw" />}
    >
      <MatchCalendar days={SCHEDULE_DAYS} games={games} players={players} hrefFor={liveHref} />
      <p className="mt-4 type-small text-ink-2">
        Tiebreaks (only at 7–7) and the closing ceremony are on 12 Dec. Games after the match is decided are not played.
        {' '}<TextLink href={EVENT.regulationsUrl}>FIDE regulations (PDF)</TextLink>
      </p>
    </Section>
  );
}
