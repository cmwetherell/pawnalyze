import type { Metadata } from 'next';

import OlympiadPage from '@/components/olympiad/OlympiadPage';

export const metadata: Metadata = {
  title: "Women's Chess Olympiad 2026: China Win Gold | Pawnalyze",
  description:
    "China won the 46th Women's Chess Olympiad in Samarkand, ahead of Kazakhstan and India. Final standings, board prizes, and how our Monte Carlo odds tracked all 11 rounds.",
};

export default function Page() {
  return <OlympiadPage event="women" />;
}
