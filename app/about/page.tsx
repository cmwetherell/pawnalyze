import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Part } from '@/components/layout/Part';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Prose } from '@/components/ui/Prose';
import { Row, Rows } from '@/components/ui/Rows';
import { TextLink } from '@/components/ui/TextLink';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('About', 'What Pawnalyze is, who makes it, and how the chess forecasts work.', { path: '/about', image: 'site' });

export default function AboutPage() {
  return (
    <Page kind="landing">
      <PageHead title="About Pawnalyze" enter className="pb-6" />

      <Section layout="split" ratio="5/7" label="About">
        {/* Stays beside the text, which is the taller column. */}
        <div>
          <Photo className="lg:sticky lg:top-24" photo={{ src: '/img/selfie.jpeg', alt: 'Caleb Wetherell' }} ratio="1/1" sizes="(min-width: 1024px) 520px, 100vw" priority />
        </div>
        <div className="flex flex-col gap-12">
          <Prose>
            <p>
              Welcome to Pawnalyze, a site for people who like chess and data! My name is Caleb Wetherell, a Seattle-based data scientist who plays
              chess, not very well yet. As a serial hobbyist, I dive into intriguing projects that blend my love for data and my array of interests,
              with chess taking center stage on Pawnalyze.
            </p>
            <p>
              Pawnalyze is the culmination of my passion for data science and chess. I simulate and make predictions for chess tournaments, and
              recently started analyzing the complexity of chess positions. This project reflects my journey in learning and entertainment. For the
              curious minds, the code that powers these simulations is{' '}
              <TextLink href="https://www.github.com/cmwetherell/cmwetherell.github.io">available on GitHub</TextLink>.
            </p>
          </Prose>
          <Part rule="always" title="Elocator">
            <Prose>
              <p>
                In my continuous exploration of chess through data, I’ve launched Elocator. This open-source tool is designed to predict the complexity
                of chess positions for humans, providing a unique lens to understand what makes a position challenging. By defining complexity as the
                expected change in win percentage after a move, Elocator offers a novel perspective on the game’s intricate dynamics.
              </p>
              <p>
                Elocator operates on a dataset of FENs, analyzing the loss in win percentage when a grandmaster makes a move. Underpinned by a neural
                network trained on over 100,000 chess moves by grandmasters, it assigns a complexity score to positions, aiming to deepen our
                understanding of chess strategy.
              </p>
            </Prose>
          </Part>
        </div>
      </Section>

      <Section title="Recognition">
        <Rows label="Recognition">
          <Row title="The New York Times" meta="Featured Pawnalyze’s analysis of the Hans Niemann chess cheating scandal." />
          <Row title="NPR" meta="Highlighted Pawnalyze’s data-driven approach to chess analytics." />
        </Rows>
      </Section>

      <Section title="Follow along">
        <Prose>
          <p>
            As Pawnalyze continues to evolve, so does my commitment to enhancing the chess community’s understanding and appreciation of the game.
            Whether through the analytical insights from simulated tournaments or the analysis provided by Elocator, our mission remains to enrich
            the chess experience for players and enthusiasts around the world.
          </p>
          <p>I invite you to explore the depths of chess analytics with me.</p>
        </Prose>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="https://www.twitter.com/pawnalyze/" icon="x">Follow on X</Button>
          <Button href="https://www.github.com/cmwetherell/pawnalyze" icon="github">View on GitHub</Button>
        </div>
      </Section>
    </Page>
  );
}
