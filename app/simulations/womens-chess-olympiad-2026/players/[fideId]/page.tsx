import type { Metadata } from 'next';

import PlayerPage, { findPlayer, playerSummary } from '@/components/olympiad/players/PlayerPage';
import { OLYMPIAD_EVENTS, boardLabel } from '@/lib/olympiad/config';
import { getOlympiadBoardRace } from '@/lib/olympiad/queries';
import { displayName } from '@/lib/olympiad/tpr';

const event = 'women' as const;
type Params = Promise<{ fideId: string }>;

/** Prerender the current top three on every board; everyone else renders on demand. */
export async function generateStaticParams() {
  const race = await getOlympiadBoardRace(event);
  return race.boards.flatMap(rows => rows.slice(0, 3).map(r => ({ fideId: String(r.fideId) })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { fideId } = await params;
  const race = await getOlympiadBoardRace(event);
  const p = findPlayer(race, Number(fideId));
  const cfg = OLYMPIAD_EVENTS[event];
  if (!p) return { title: `Player not found | ${cfg.shortTitle} | Pawnalyze` };
  const name = `${p.title ? p.title + ' ' : ''}${displayName(p.name)}`;
  return {
    title: `${name} · ${boardLabel(p.board)} · ${cfg.shortTitle} | Pawnalyze`,
    description: `${name} (${p.teamName}) at the ${cfg.shortTitle} board prize race: ${playerSummary(p, race)} Every game with replay.`,
  };
}

export default async function Page({ params }: { params: Params }) {
  const { fideId } = await params;
  return <PlayerPage event={event} fideId={Number(fideId)} />;
}
