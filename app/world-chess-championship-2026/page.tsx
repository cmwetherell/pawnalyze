import type { Metadata } from 'next';

import WccPage from '@/components/wcc/WccPage';

const title = 'World Chess Championship 2026 Predictions: Gukesh vs Sindarov | Pawnalyze';
const description =
  'Who wins Gukesh vs Sindarov in Geneva? Exact match odds, confirmed by 10,000 simulations and updated after every game, plus tiebreak paths, score predictions, a scenario builder and live prediction-market prices.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/world-chess-championship-2026' },
  openGraph: { title, description, type: 'website', url: '/world-chess-championship-2026' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function Page() {
  return <WccPage />;
}
