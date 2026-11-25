import { BroadcastRound } from '@/components/elocator/Broadcast';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Section } from '@/components/layout/Section';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('Elocator Broadcast', 'How hard each position of a broadcast round is to play, scored by Elocator.', { path: '/elocator/broadcast', image: 'site' });

export default function Broadcast() {
  return (
    <Page kind="landing">
      <PageHead title="Elocator broadcast" crumbs={[{ label: 'Elocator', href: '/elocator' }, { label: 'Broadcast' }]} />
      <Section label="Broadcast" layout="plain" rule={false}>
        <BroadcastRound broadcastRoundId="5yjXPZ9T" />
      </Section>
    </Page>
  );
}
