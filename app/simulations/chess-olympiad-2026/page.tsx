import type { Metadata } from 'next';

import OlympiadPage from '@/components/olympiad/OlympiadPage';

export const metadata: Metadata = {
  title: 'Chess Olympiad 2026 Predictions | Pawnalyze',
  description:
    'Live Monte Carlo medal odds for the 46th Chess Olympiad in Samarkand. Explore scenarios round by round and see which nations are favoured for gold.',
};

export default function Page() {
  return <OlympiadPage event="open" />;
}
