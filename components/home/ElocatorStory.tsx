import { ColumnChart } from '@/components/charts/ColumnChart';
import { Board } from '@/components/chess/Board';
import { ComplexityScale } from '@/components/chess/ComplexityScale';
import { Section } from '@/components/layout/Section';
import { SectionGroup } from '@/components/layout/SectionGroup';
import { Button } from '@/components/ui/Button';
import game from '@/lib/elocator/game-of-the-century.json';
import { complexityTone, complexityWord } from '@/lib/theme/tones';

interface Position { ply: number; san?: string; from?: string; to?: string; fen: string; c: number }

const POSITIONS = game as Position[];
const HARDEST = POSITIONS.reduce((a, p) => (p.c > a.c ? p : a));
const moveName = (p: Position) => (p.san ? `${Math.ceil(p.ply / 2)}${p.ply % 2 === 1 ? '.' : '...'} ${p.san}` : 'Start');

/** One real game, scored by the site's own API: Byrne against Fischer, New York 1956. */
export function ElocatorStory() {
  const at = moveName(HARDEST);
  return (
    <SectionGroup label="Elocator" ground="surface">
      <Section
        layout="split" ratio="5/7"
        title="Elocator scores how hard a position is"
        finding="Paste a FEN or PGN. A neural network trained on more than 100,000 grandmaster moves rates the position from 1 to 100 for the player to move."
        actions={<Button variant="primary" href="/elocator">Analyze a position</Button>}
      >
        <Board fen={HARDEST.fen} from={HARDEST.from} to={HARDEST.to} label={`Byrne against Fischer, 1956, after ${at}`} />
        <div className="flex flex-col justify-between gap-8">
          <div>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
              <p className="type-mega text-ink">{HARDEST.c}</p>
              <div className="pb-2">
                <p className="type-h3 text-ink">{complexityWord(HARDEST.c)}, out of 100</p>
                <p className="type-small text-ink-2">Byrne against Fischer, 1956, after {at}</p>
              </div>
            </div>
            <ComplexityScale className="mt-4" score={HARDEST.c} size="lg" words={false} />
          </div>
          <ColumnChart
            caption={`Complexity of all ${POSITIONS.length} positions of the game`}
            ariaLabel={`Complexity peaks at ${HARDEST.c} after ${at}`}
            columns={POSITIONS.map(p => ({ key: String(p.ply), label: p === HARDEST ? at : '', title: moveName(p), parts: [{ tone: complexityTone(p.c), value: p.c, label: complexityWord(p.c) }] }))}
            format="int" values={HARDEST.c} height={180}
            table={{ columns: ['Move', 'Complexity'], rows: POSITIONS.map(p => [moveName(p), p.c]) }}
          />
        </div>
      </Section>
    </SectionGroup>
  );
}
