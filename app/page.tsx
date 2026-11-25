import { CandidatesStory } from '@/components/home/CandidatesStory';
import { ElocatorStory } from '@/components/home/ElocatorStory';
import { Press } from '@/components/home/Press';
import { RecentResults } from '@/components/home/RecentResults';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { WccFeature } from '@/components/wcc/WccFeature';

export default function Home() {
  return (
    <Page kind="landing">
      <div className="lg:min-h-hero">
        <PageHead
          size="mega" enter
          title="Forecasts for championship chess"
          lead="Exact match odds, tournament simulations you can steer, and a complexity score for any position."
        />
        <WccFeature as="hero" />
      </div>
      <RecentResults />
      <CandidatesStory />
      <ElocatorStory />
      <Press />
    </Page>
  );
}
