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
        lead="Reigning champion Ding Liren defended his title against Gukesh D."
        foldLead
        facts={['14 classical games. Tiebreaks if necessary.', <TextLink key="fide" href="https://worldchampionship.fide.com/" external>FIDE</TextLink>]}
      />
      <Wcc2024Results
        notice={(
          <Callout tone="brand" action={<TextLink standalone href="/world-chess-championship-2026">See the 2026 odds</TextLink>}>
            Archived: the 2024 match (Ding Liren vs Gukesh D). The 2026 title match is Gukesh vs Sindarov.
          </Callout>
        )}
      />
    </Page>
  );
}
