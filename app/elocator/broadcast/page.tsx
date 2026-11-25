import { BroadcastRound } from '@/components/elocator/Broadcast';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Section } from '@/components/layout/Section';

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
