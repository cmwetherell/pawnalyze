import type { Metadata } from 'next';

import PlayerPage, { findPlayer, playerSummary } from '@/components/olympiad/players/PlayerPage';
import { pageMeta } from '@/lib/meta';
import { boardLabel } from '@/lib/olympiad/config';
import { getOlympiadBoardRace } from '@/lib/olympiad/queries';
import { displayName } from '@/lib/olympiad/tpr';

const event = 'women' as const;
const TITLE = "Women's Chess Olympiad 2026";
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
  if (!p) return { title: `Player not found | ${TITLE} | Pawnalyze` };
  const name = `${p.title ? p.title + ' ' : ''}${displayName(p.name)}`;
  return pageMeta(`${name} · ${boardLabel(p.board)} · ${TITLE}`, `${name} (${p.teamName}) at the ${TITLE} board prize race: ${playerSummary(p, race)} Every game with replay.`, { path: `/simulations/womens-chess-olympiad-2026/players/${fideId}` });
}

export default async function Page({ params }: { params: Params }) {
  const { fideId } = await params;
  return <PlayerPage event={event} fideId={Number(fideId)} />;
}
