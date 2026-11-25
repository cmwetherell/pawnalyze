import type { Metadata } from 'next';

import { Board } from '@/components/chess/Board';
import { ComplexityScale } from '@/components/chess/ComplexityScale';
import { Analyzer } from '@/components/elocator/Analyzer';
import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Section } from '@/components/layout/Section';
import { SectionGroup } from '@/components/layout/SectionGroup';
import { CopyButton } from '@/components/ui/CopyButton';
import { Explainer } from '@/components/ui/Explainer';
import { Row, Rows } from '@/components/ui/Rows';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { EXAMPLE_GAME, EXAMPLE_POSITIONS } from '@/lib/elocator/examples';

export const metadata: Metadata = { title: 'Elocator: Chess Complexity Calculator | Pawnalyze' };

const STEPS = [
  { title: 'Position analysis', body: 'The neural network analyzes board state features to predict position difficulty.' },
  { title: 'Expected error', body: 'Complexity is the expected change in win percentage after a grandmaster plays. Harder positions mean more error.' },
  { title: '1 to 100 scale', body: 'Positions are scored from 1 (simple) to 100 (extreme), color-coded for quick reading.' },
  { title: 'Game analysis', body: 'Paste a PGN for move-by-move complexity charts.' },
];

export default function ElocatorPage() {
  return (
    <Page kind="landing">
      <PageHead
        enter title="Elocator: Chess Complexity Calculator"
        lead="Analyze the complexity of any chess position or game. Paste a FEN for single-position analysis or a PGN for full game analysis with move-by-move complexity charts."
        facts={['Simple to 25, moderate to 50, complex to 75, extreme above']}
      />
      <Section label="Analyze a position or a game" layout="plain" rule={false}>
        <Analyzer />
      </Section>
      <Section title="How it works" layout="wide">
        <Explainer columns={4} items={STEPS} />
      </Section>
      <SectionGroup label="Examples" ground="surface">
        <Section title="Example positions" finding="Three positions and the score Elocator gives each. Copy a FEN and paste it above.">
          <Rows label="Example positions">
            {EXAMPLE_POSITIONS.map(p => (
              <Row
                key={p.fen}
                lead={<span className="block w-24"><Board fen={p.fen} label={p.name} coords={false} /></span>}
                title={p.label}
                meta={<><span className="block">{p.name}</span><code className="mt-1 block truncate type-mono text-ink-3">{p.fen}</code></>}
                figure={<ComplexityScale score={p.score} />}
                action={<CopyButton kind="text" text={p.fen} label="Copy FEN" variant="icon" className="-mr-3" />}
              />
            ))}
          </Rows>
        </Section>
        <Section
          title="Example game"
          finding={<><span className="block font-medium text-ink">&ldquo;{EXAMPLE_GAME.title}&rdquo;</span>{EXAMPLE_GAME.players}. {EXAMPLE_GAME.event}.</>}
          actions={<CopyButton kind="text" text={EXAMPLE_GAME.pgn} label="Copy PGN" variant="secondary" />}
        >
          <ScrollArea label="Moves of the game" maxHeight={280}>
            <p className="type-mono text-ink-2">{EXAMPLE_GAME.moves}</p>
          </ScrollArea>
        </Section>
      </SectionGroup>
    </Page>
  );
}
