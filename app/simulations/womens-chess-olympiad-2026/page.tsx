import OlympiadPage from '@/components/olympiad/OlympiadPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta(
  'Women’s Chess Olympiad 2026: China Wins Gold',
  'China won the 46th Women’s Chess Olympiad in Samarkand, ahead of Kazakhstan and India. Final standings, board prizes, and how our Monte Carlo odds tracked all 11 rounds.',
  { path: '/simulations/womens-chess-olympiad-2026' },
);

export default function Page() {
  return <OlympiadPage event="women" />;
}
