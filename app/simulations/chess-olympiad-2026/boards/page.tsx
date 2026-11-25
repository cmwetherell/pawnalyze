import BoardRacePage from '@/components/olympiad/boards/BoardRacePage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta(
  'Board Prizes: Chess Olympiad 2026',
  'Final performance-rating standings for the individual board medals at the 46th Chess Olympiad in Samarkand: who won each board, the eight-game minimum, and every game replay.',
  { path: '/simulations/chess-olympiad-2026/boards' },
);

export default function Page() {
  return <BoardRacePage event="open" />;
}
