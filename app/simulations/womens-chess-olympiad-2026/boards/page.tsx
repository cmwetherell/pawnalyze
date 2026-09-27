import type { Metadata } from 'next';

import BoardRacePage from '@/components/olympiad/boards/BoardRacePage';

export const metadata: Metadata = {
  title: "Board Prizes — Women's Chess Olympiad 2026 | Pawnalyze",
  description: 'Final performance-rating standings for the individual board medals at the 46th Chess Olympiad in Samarkand: who won each board, the eight-game minimum, and every game replay.',
};

export default function Page() {
  return <BoardRacePage event="women" />;
}
