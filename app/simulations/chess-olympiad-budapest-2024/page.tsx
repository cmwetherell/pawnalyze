import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Section } from '@/components/layout/Section';
import { Budapest2024Results } from '@/components/simulation/Budapest2024Results';
import { Callout } from '@/components/ui/Callout';
import { Prose } from '@/components/ui/Prose';
import { TextLink } from '@/components/ui/TextLink';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('Chess Olympiad Budapest 2024 Odds', 'How our simulations of the 2024 Chess Olympiad in Budapest moved round by round.', { path: '/simulations/chess-olympiad-budapest-2024', image: 'site' });

const NAME = 'Chess Olympiad Budapest 2024';

export default function Sims() {
  return (
    <Page kind="dashboard">
      <PageHead
        title={NAME}
        crumbs={[{ label: 'Simulations', href: '/simulations' }, { label: 'Olympiad 2024' }]}
        lead="Countries battle it out 4v4 to find the best chess nation."
        foldLead
        facts={['11 rounds of 4v4 team battles', <TextLink key="fide" tap href="https://chessolympiad2024.fide.com/" external>FIDE</TextLink>]}
      />
      <Budapest2024Results notice={<Callout tone="brand" icon="medal">Congrats to India for winning gold in both the Open and Women’s event!</Callout>} />
      <Section id="method" title="How it works">
        <Prose>
          <p>
            Before the Olympiad kicked off, we ran 5,000 simulations of the tournament to predict the probabilities that each
            country wins gold, silver, or bronze. After each round, new simulations were run based on the current results,
            accounting for the official FIDE pairing logic.
          </p>
          <p>
            Read <TextLink href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html">more about the methodology</TextLink> or
            view the <TextLink href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py">code on GitHub</TextLink>.
          </p>
        </Prose>
      </Section>
    </Page>
  );
}
