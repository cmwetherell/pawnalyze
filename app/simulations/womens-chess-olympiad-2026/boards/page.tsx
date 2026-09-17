import type { Metadata } from 'next';

import BoardRacePage from '@/components/olympiad/boards/BoardRacePage';

export const metadata: Metadata = {
  title: "Board Prize Race — Women's Chess Olympiad 2026 | Pawnalyze",
  description: 'Live performance-rating leaderboards for the individual board medals at the 46th Chess Olympiad in Samarkand: who leads each board, who has the eight games needed, and every game replay.',
};

export default function Page() {
  return <BoardRacePage event="women" />;
}
