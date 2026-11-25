import type { ReactNode } from 'react';

import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Section } from '@/components/layout/Section';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Explainer } from '@/components/ui/Explainer';
import type { LinkItem } from '@/components/ui/Tabs';
import { TextLink } from '@/components/ui/TextLink';
import { getPlayerName, getPlayerPhoto } from '@/lib/playerData';
import type { EventTable, SimulationRow } from '@/lib/simulations';
import candidates2024 from '@/public/candResByRound.json';
import candidates2026 from '@/public/candResByRound2026.json';
import womensCandidates2024 from '@/public/womensCandByRound.json';
import womensCandidates2026 from '@/public/womensCandByRound2026.json';
import { CandidatesResults } from './CandidatesResults';
import type { GameRound } from './rounds';

const GAMES: Record<EventTable, GameRound[]> = {
  candidates_2024: candidates2024,
  womens_candidates_2024: womensCandidates2024,
  candidates_2026: candidates2026,
  womens_candidates_2026: womensCandidates2026,
};

/** The same event for the other field. */
const SIBLINGS: [EventTable, EventTable, string, string][] = [
  ['candidates_2026', 'womens_candidates_2026', '/simulations/candidates-2026', '/simulations/womens-candidates-2026'],
  ['candidates_2024', 'womens_candidates_2024', '/simulations/candidates-2024', '/simulations/womens-candidates-2024'],
];

const switcher = (event: EventTable): LinkItem[] =>
  SIBLINGS.filter(([open, women]) => event === open || event === women).flatMap(([open, women, openHref, womenHref]) => [
    { label: 'Open', href: openHref, active: event === open },
    { label: 'Women', href: womenHref, active: event === women },
  ]);

interface CandidatesPageProps {
  eventTable: EventTable;
  name: string;
  description: string;
  format: string;
  website: string;
  /** Stored name, once the event is over. */
  winner?: string;
  /** Stored names, in the order of their pictures. */
  players?: string[];
  intro?: ReactNode;
  /** The unfiltered simulations; without them the page fetches its own. */
  initialData?: SimulationRow[];
  /** "How it works" */
  method?: boolean;
}

/** Every Candidates tournament, open and women's. */
export function CandidatesPage({ eventTable, name, description, format, website, winner, players, intro, initialData, method = false }: CandidatesPageProps) {
  return (
    <Page kind="dashboard">
      <PageHead
        title={name}
        crumbs={[{ label: 'Simulations', href: '/simulations' }, { label: name }]}
        switcher={switcher(eventTable)}
        lead={description}
        facts={[format, <TextLink key="fide" href={website} external>FIDE</TextLink>]}
        media={players && <AvatarStack label="Players" size={40} people={players.map(p => ({ name: getPlayerName(p), src: getPlayerPhoto(p) }))} />}
      />
      <CandidatesResults eventTable={eventTable} rounds={GAMES[eventTable]} initialData={initialData} winner={winner} intro={intro} />
      {method && (
        <Section id="method" title="How it works">
          <Explainer
            columns={3}
            items={[
              { title: 'Monte Carlo sims', body: <p>Over 1M simulations using Elo, color advantage, and draw rates.</p> },
              { title: 'Scenario explorer', body: <p>Lock in results and explore “what if” scenarios.</p> },
              { title: 'Round-by-round tracking', body: <p>Actual results were baked in round by round as games completed. The final simulated round reflects the tournament as played.</p> },
            ]}
            note={<>For a deeper dive, check out <TextLink href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html">How Our Chess Tournament Predictions Work</TextLink> on the blog.</>}
          />
        </Section>
      )}
    </Page>
  );
}
