import type { Metadata } from 'next';

import { LiveGame, type GameResults } from '@/components/live/LiveGame';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { TextLink } from '@/components/ui/TextLink';
import { WCC_HREF } from '@/lib/wcc/config';
import { getWccGames } from '@/lib/wcc/queries';
import { matchState } from '@/lib/wcc/status';

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

/** Results for the game picker only: the page itself follows Lichess, so it works without the database. */
async function finishedGames(): Promise<GameResults> {
  const games = await getWccGames().catch((err: unknown) => {
    console.error('[live] games failed:', err instanceof Error ? err.message : String(err));
    return [];
  });
  return Object.fromEntries(matchState(games).fixed);
}

export default async function LivePage() {
  const results = await finishedGames();
  return (
    <Page kind="dashboard">
      <PageHead
        title="Gukesh vs Sindarov, live"
        crumbs={[{ label: 'World Championship 2026', href: WCC_HREF }, { label: 'Live' }]}
        // On a phone the board comes first; the words would push it off the screen.
        lead={<span className="max-sm:hidden">Every move as it is played, with the engine&rsquo;s verdict and how hard the position is to play.</span>}
        crumbActions={<TextLink standalone href={WCC_HREF}><span className="max-sm:hidden">See the match odds</span><span className="sm:hidden">Match odds</span></TextLink>}
        className="md:pb-6 md:pt-2"
      />
      <LiveGame results={results} />
    </Page>
  );
}
