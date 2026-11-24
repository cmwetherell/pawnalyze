import type { Metadata } from 'next';
import Link from 'next/link';

import LiveGame from '@/components/live/LiveGame';
import { WCC_HREF } from '@/lib/wcc/config';

const title = 'Gukesh vs Sindarov Live: Complexity and Stockfish Evaluation | Pawnalyze';
const description =
  'Follow the World Chess Championship 2026 move by move: live board and clocks, the Stockfish evaluation, and how hard each position is according to Elocator.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${WCC_HREF}/live` },
  openGraph: { title, description, type: 'website', url: `${WCC_HREF}/live` },
  twitter: { card: 'summary_large_image', title, description },
};

export default function Page() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-5">
        <header>
          <nav className="text-xs text-[var(--text-muted)] mb-2">
            <Link href={WCC_HREF} className="hover:text-[var(--text-secondary)]">World Championship 2026</Link> / Live
          </nav>
          <h1 className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)]">Gukesh vs Sindarov, live</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Every move as it is played, with the engine&rsquo;s verdict and how hard the position is to play.</p>
        </header>
        <LiveGame />
      </div>
    </main>
  );
}
