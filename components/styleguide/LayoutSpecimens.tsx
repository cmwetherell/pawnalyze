import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Container } from '@/components/layout/Container';
import { PageHead } from '@/components/layout/PageHead';
import { Section } from '@/components/layout/Section';
import { Split } from '@/components/layout/Split';
import { Part } from '@/components/layout/Part';
import { Button } from '@/components/ui/Button';
import { FlagStack } from '@/components/ui/FlagStack';
import { Legend } from '@/components/ui/Swatch';
import { Tag } from '@/components/ui/Tag';
import { TextLink } from '@/components/ui/TextLink';

/** Stands for a figure, so a layout can be read without one. */
function Figure({ label, tall = false }: { label: string; tall?: boolean }) {
  return <div className={`grid place-items-center bg-sunken type-small text-ink-3 ${tall ? 'h-[480px]' : 'h-48'}`}>{label}</div>;
}

export function LayoutSpecimens() {
  return (
    // A real box, so the section bar knows when it is being read.
    <div id="layout">
      <PageHead
        crumbs={[{ label: 'Simulations', href: '/simulations' }, { label: 'Chess Olympiad 2026' }]}
        title="Chess Olympiad 2026"
        status={<Tag icon="check">Final</Tag>}
        media={<FlagStack items={[{ code: 'UZB', name: 'Uzbekistan' }, { code: 'IND', name: 'India' }, { code: 'GER', name: 'Germany' }]} />}
        switcher={[{ label: 'Open', href: '/simulations/chess-olympiad-2026', active: true }, { label: 'Women', href: '/simulations/womens-chess-olympiad-2026', active: false }]}
        facts={['206 teams, 11 Swiss rounds', 'Samarkand, Uzbekistan', <TextLink key="r" href="https://chess-results.com">chess-results</TextLink>]}
        tabs={[{ label: 'Medal odds', href: '/simulations/chess-olympiad-2026', active: true }, { label: 'Board prizes', href: '/simulations/chess-olympiad-2026/boards', active: false }]}
      />
      <PageHead
        title="Page with a lead and actions"
        lead="The lead starts beside the title, so titles stand at one height, and stacks under it on a phone."
        actions={<><Button variant="primary" href="/simulations">See every simulation</Button><Button href="/elocator">Analyze a position</Button></>}
      />
      <Container className="pb-section"><Breadcrumb items={[{ label: 'Simulations', href: '/simulations' }, { label: 'Chess Olympiad 2026', href: '/simulations/chess-olympiad-2026' }, { label: 'Boards' }]} /></Container>

      <Section
        title="Rail: words, then a figure" layout="rail"
        finding="The default. Three columns of words, nine of figure. The words stay in view while a taller figure scrolls."
        legend={<Legend items={[{ tone: 'p1', label: 'Gukesh' }, { tone: 'p2', label: 'Sindarov' }]} />}
        actions={<TextLink href="/simulations">Replay the Candidates</TextLink>}
        credit="Credit line"
      >
        <Figure label="Nine columns" tall />
      </Section>
      <Section title="Wide: a heading row" layout="wide" finding="Four, five and three columns, then the figure at full width. For the games sheet and long tables." actions={<Button size="sm">Share scenario</Button>}>
        <Figure label="Twelve columns" />
      </Section>
      <Section title="Split: two figures" layout="split" finding="Equal halves, or 5/7 and 7/5 by the ratio prop.">
        <Figure label="Six columns" /><Figure label="Six columns" />
      </Section>
      <Section label="Parts" layout="split">
        <Part title="Part" finding="One figure of a split section, with its own anchor and heading."><Figure label="Six columns" /></Part>
        <Part title="Second part" finding="Stacked, it gets a rule of its own."><Figure label="Six columns" /></Part>
      </Section>
      <Section title="Split 5/7" layout="split" ratio="5/7" level={3} rule={false}>
        <Figure label="Five" /><Figure label="Seven" />
      </Section>
    </div>
  );
}

/** For a surface SectionGroup. */
export function SplitSpecimens() {
  return (
    <Section title="Surface band" layout="plain" finding="A movement on the surface ground bleeds full width and pads itself.">
      <Split main={<Figure label="Split main" />} aside={<Figure label="Split aside" />} />
      <Split className="mt-6" asideWidth="wide" main={<Figure label="Main, wide aside" />} aside={<Figure label="Wide aside" />} />
    </Section>
  );
}
