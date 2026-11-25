import type { Metadata } from 'next';

import { OddsChip } from '@/components/chess/OddsChip';
import { BottomBar } from '@/components/layout/BottomBar';
import { Container } from '@/components/layout/Container';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { SectionBar, type SectionBarProps } from '@/components/layout/SectionBar';
import { SectionGroup } from '@/components/layout/SectionGroup';
import { ChartSpecimens } from '@/components/styleguide/ChartSpecimens';
import { ChessSpecimens, HeroSpecimen } from '@/components/styleguide/ChessSpecimens';
import { PictureSpecimens, StatusSpecimens, WordSpecimens } from '@/components/styleguide/ContentSpecimens';
import { ButtonSpecimens, ChoiceSpecimens, FormSpecimens, OverlaySpecimens } from '@/components/styleguide/ControlSpecimens';
import { ListSpecimens, PanelSpecimens, StatSpecimens, StripSpecimens, SurfaceSpecimens } from '@/components/styleguide/DataSpecimens';
import { ODDS } from '@/components/styleguide/fixtures';
import { ColorSpecimens, FrameSpecimens, TypeSpecimens } from '@/components/styleguide/FoundationSpecimens';
import { LayoutSpecimens, SplitSpecimens } from '@/components/styleguide/LayoutSpecimens';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';

export const metadata: Metadata = {
  title: 'Styleguide | Pawnalyze',
  description: 'Every component of the Pawnalyze interface, in every variant.',
  robots: { index: false, follow: false },
};

const GROUPS: SectionBarProps['groups'] = [
  { label: 'Foundations', items: [{ id: 'color', label: 'Color' }, { id: 'type', label: 'Type' }, { id: 'frame', label: 'Space' }, { id: 'layout', label: 'Layout' }] },
  {
    label: 'Primitives',
    items: [
      { id: 'buttons', label: 'Buttons' }, { id: 'choices', label: 'Choices' }, { id: 'forms', label: 'Forms' }, { id: 'containers', label: 'Containers' }, { id: 'words', label: 'Words' },
      { id: 'status', label: 'Status' }, { id: 'pictures', label: 'Pictures' }, { id: 'stats', label: 'Figures' }, { id: 'lists', label: 'Lists', also: ['strip', 'panels', 'surface'] },
    ],
  },
  { label: 'Charts and chess', items: [{ id: 'charts', label: 'Lines' }, { id: 'bars', label: 'Bars' }, { id: 'match', label: 'Face-off' }, { id: 'sheet', label: 'Scoresheet' }, { id: 'board', label: 'Board' }, { id: 'scenario', label: 'Scenario' }] },
];

/** The visual contract: every library component, in the site shell. Not linked, not indexed. */
export default function StyleguidePage() {
  return (
    <Page kind="dashboard">
      <div id="hero">
        <PageHead
          size="mega" enter title="Gukesh vs Sindarov"
          crumbs={[{ label: 'Pawnalyze', href: '/' }, { label: 'Styleguide' }]}
          facts={['FIDE World Championship 2026', 'Nov 22 to Dec 13, Fondation Martin Bodmer, Cologny, Geneva', '14 classical games, first to 7½, $2.5M prize fund']}
        />
        <Container className="pb-8"><HeroSpecimen /></Container>
      </div>
      <SectionBar eventLabel="Styleguide" heroId="hero" groups={GROUPS} live={<OddsChip sides={ODDS} />} actions={<><Button size="sm" variant="quiet" icon="reset">Reset</Button><CopyButton kind="link" variant="secondary" label="Share scenario" /></>} />
      <SectionGroup label="Foundations">
        <ColorSpecimens />
        <TypeSpecimens />
        <FrameSpecimens />
        <LayoutSpecimens />
      </SectionGroup>
      <SectionGroup label="A surface band" ground="surface">
        <SplitSpecimens />
      </SectionGroup>
      <SectionGroup label="Primitives">
        <ButtonSpecimens />
        <ChoiceSpecimens />
        <FormSpecimens />
        <OverlaySpecimens />
        <WordSpecimens />
        <StatusSpecimens />
        <PictureSpecimens />
        <StatSpecimens />
        <ListSpecimens />
        <StripSpecimens />
        <PanelSpecimens />
      </SectionGroup>
      <SectionGroup label="Panel on a surface band" ground="surface">
        <SurfaceSpecimens />
      </SectionGroup>
      <SectionGroup label="Charts and chess">
        <ChartSpecimens />
        <ChessSpecimens />
      </SectionGroup>
      <BottomBar label="Match odds" heroId="hero">
        <a href="#scenario" className="flex min-w-0 flex-1 rounded-sm"><OddsChip variant="halves" sides={ODDS} /></a>
        <CopyButton kind="link" variant="icon" label="Share scenario" />
      </BottomBar>
    </Page>
  );
}
