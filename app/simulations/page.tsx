import { PastTournaments } from '@/components/home/PastTournaments';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { WccFeature } from '@/components/wcc/WccFeature';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('Chess Tournament Simulations', 'Monte Carlo tournament simulations with interactive scenario building.', { path: '/simulations', image: 'site' });

export default function SimulationsPage() {
  return (
    <Page kind="landing">
      <PageHead title="Simulations" lead="Monte Carlo tournament simulations with interactive scenario building." enter className="pb-6" />
      <WccFeature as="section" />
      <PastTournaments />
    </Page>
  );
}
