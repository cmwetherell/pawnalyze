import { Container } from '@/components/layout/Container';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Wcc2024Results } from '@/components/simulation/Wcc2024Results';
import { Callout } from '@/components/ui/Callout';
import { TextLink } from '@/components/ui/TextLink';

const NAME = 'FIDE Chess World Championship Singapore 2024';

export default function Sims() {
  return (
    <Page kind="dashboard">
      <PageHead
        title={NAME}
        crumbs={[{ label: 'Simulations', href: '/simulations' }, { label: 'World Championship 2024' }]}
        lead="Reigning champion Ding Liren defends his title against Gukesh D."
        facts={['14 classical games. Tiebreaks if necessary.', <TextLink key="fide" href="https://worldchampionship.fide.com/" external>FIDE</TextLink>]}
      />
      <Container className="pb-12">
        <Callout tone="brand" action={<TextLink standalone href="/world-chess-championship-2026">See the 2026 odds</TextLink>}>
          Archived: the 2024 match (Ding Liren vs Gukesh D). The 2026 title match is Gukesh vs Sindarov.
        </Callout>
      </Container>
      <Wcc2024Results />
    </Page>
  );
}
