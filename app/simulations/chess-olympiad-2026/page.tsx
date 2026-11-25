import OlympiadPage from '@/components/olympiad/OlympiadPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta(
  'Chess Olympiad 2026: Uzbekistan Wins Gold',
  'Uzbekistan won the 46th Chess Olympiad in Samarkand, ahead of India and Germany. Final standings, board prizes, and how our Monte Carlo odds tracked all 11 rounds.',
  { path: '/simulations/chess-olympiad-2026' },
);

export default function Page() {
  return <OlympiadPage event="open" />;
}
