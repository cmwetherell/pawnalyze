import type { Metadata } from 'next';

import OlympiadPage from '@/components/olympiad/OlympiadPage';

export const metadata: Metadata = {
  title: 'Chess Olympiad 2026: Uzbekistan Win Gold | Pawnalyze',
  description:
    'Uzbekistan won the 46th Chess Olympiad in Samarkand, ahead of India and Germany. Final standings, board prizes, and how our Monte Carlo odds tracked all 11 rounds.',
};

export default function Page() {
  return <OlympiadPage event="open" />;
}
