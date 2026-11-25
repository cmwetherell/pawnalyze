'use client';

import { useMemo, useRef, useState } from 'react';

import { ColumnChart } from '@/components/charts/ColumnChart';
import { BoardControls } from '@/components/chess/BoardControls';
import { BoardPane } from '@/components/chess/BoardPane';
import { ComplexityChart, averageComplexity } from '@/components/chess/ComplexityChart';
import { ComplexityScale } from '@/components/chess/ComplexityScale';
import { Replay } from '@/components/chess/Replay';
import { Split } from '@/components/layout/Split';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Chip } from '@/components/ui/Chip';
import { CopyButton } from '@/components/ui/CopyButton';
import { Field } from '@/components/ui/Field';
import { Heading } from '@/components/ui/Heading';
import { Textarea } from '@/components/ui/Input';
import { Panel } from '@/components/ui/Panel';
import { StatStrip } from '@/components/ui/StatStrip';
import { moveLabel } from '@/lib/chess/moves';
import { analyzeGame, fetchComplexity, type GameAnalysis } from '@/lib/elocator/api';
import { EXAMPLE_GAME, EXAMPLE_POSITIONS } from '@/lib/elocator/examples';
import { detectInputType, fenOf, positionOf, positionsOf, type Position } from '@/lib/elocator/input';
import { complexityTone, complexityWord } from '@/lib/theme/tones';
import { START_FEN } from '@/lib/live/pgn';

const SIDE = { w: 'White', b: 'Black' } as const;
const START = [positionOf(START_FEN)];

const FILLS = [
  ...EXAMPLE_POSITIONS.map(p => ({ label: p.name, text: p.fen })),
  { label: 'Full game', text: EXAMPLE_GAME.pgn },
];

/** What Elocator said, and about which input. */
type Answer = { input: string } & ({ error: string } | { fenScore: number } | { game: GameAnalysis });

/** FEN or PGN in, board and complexity out. With an empty box it shows a game that is already scored. */
export function Analyzer() {
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [ply, setPly] = useState(EXAMPLE_GAME.showcasePly);
  const [flipped, setFlipped] = useState(false);
  const request = useRef(0);

  const text = input.trim();
  const kind = text === '' ? 'sample' : detectInputType(text);
  const replay = useMemo(() => (kind === 'pgn' ? positionsOf(text) : []), [kind, text]);
  const mine = answer !== null && answer.input === text ? answer : null;
  const game = mine && 'game' in mine ? mine.game : null;
  const error = mine && 'error' in mine ? mine.error : null;

  const positions: Position[] = kind === 'sample' ? EXAMPLE_GAME.positions
    : kind === 'fen' ? [positionOf(fenOf(text), mine && 'fenScore' in mine ? mine.fenScore : null)]
      : game ? game.positions : replay.length ? replay : START;
  const last = positions.length - 1;
  const at = positions[Math.min(ply, last)];
  const scored = positions.some(p => p.complexity !== null);
  const go = (n: number) => setPly(Math.min(Math.max(n, 0), last));
  const flip = () => setFlipped(v => !v);

  const fill = (value: string) => {
    setInput(value);
    setPly(value.trim() === '' ? EXAMPLE_GAME.showcasePly : 0);
  };

  const analyze = async () => {
    const id = ++request.current;
    const done = (a: Answer) => { if (id === request.current) { setAnswer(a); setPending(null); } };
    if (kind === 'sample' || kind === 'error') {
      done({ input: text, error: 'Could not detect input format. Please enter a valid FEN string or PGN game.' });
      return;
    }
    setPending(text);
    if (kind === 'fen') {
      const r = await fetchComplexity(fenOf(text));
      done('error' in r ? { input: text, error: r.error } : { input: text, fenScore: r.score });
    } else {
      const r = await analyzeGame(text, replay);
      done('error' in r ? { input: text, error: r.error } : { input: text, game: r });
    }
  };

  const title = kind === 'sample' ? EXAMPLE_GAME.title
    : game && (game.white || game.black) ? `${game.white ?? SIDE.w} vs ${game.black ?? SIDE.b}`
      : kind === 'fen' ? 'Your position' : replay.length || game ? 'Your game' : null;
  const facts = kind === 'sample' ? `An example, already scored. ${EXAMPLE_GAME.players}, ${EXAMPLE_GAME.event}` : game?.event;

  return (
    <Panel padding="md">
      <Split
        asideWidth="wide"
        main={(
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Field label="FEN or PGN">
                <Textarea mono rows={3} placeholder="Paste a FEN or PGN here" value={input} onChange={e => fill(e.target.value)} />
              </Field>
              {error && <Callout tone="negative" icon="error">{error}</Callout>}
              <div className="flex flex-col gap-x-6 gap-y-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Button variant="primary" loading={pending !== null && pending === text} onClick={analyze}>{pending !== null && pending === text ? 'Analyzing' : 'Analyze'}</Button>
                <div role="group" aria-label="Try an example" className="flex flex-wrap items-center gap-2">
                  <span aria-hidden className="mr-1 type-small text-ink-2">Try</span>
                  {FILLS.map(f => <Chip key={f.label} pressed={text === f.text} onClick={() => fill(text === f.text ? '' : f.text)}>{f.label}</Chip>)}
                </div>
              </div>
            </div>
            {title && (
              <div className="flex flex-col gap-6 border-t border-line pt-6">
                <div>
                  <Heading level={2} style="h3">{title}</Heading>
                  {facts && <p className="type-small text-ink-2">{facts}</p>}
                </div>
                <Readout position={at} count={last + 1} />
                {kind === 'fen' && (
                  <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
                    <code className="min-w-0 break-all type-mono text-ink-2">{at.fen}</code>
                    <CopyButton kind="text" text={at.fen} label="Copy FEN" variant="icon" className="-mr-3" />
                  </div>
                )}
                {last > 0 && scored && <Averages positions={positions} />}
              </div>
            )}
          </div>
        )}
        aside={(
          <Replay
            label="Board; use the arrow keys to step through the moves" ply={Math.min(ply, last)} last={last} onGo={go} onFlip={flip}
            board={(
              <BoardPane
                fen={at.fen} from={at.from} to={at.to} flipped={flipped}
                label={kind === 'fen' ? `Your position, ${SIDE[at.toMove]} to move` : `Position after ${moveLabel(at)}`}
                controls={<BoardControls ply={Math.min(ply, last)} last={last} onGo={go} onFlip={flip} />}
              />
            )}
          />
        )}
      />
      {last > 0 && scored && (
        <div className="mt-8">
          {kind === 'sample'
            ? <SampleChart positions={positions} ply={ply} onGo={go} />
            : (
              <ComplexityChart
                points={positions} selected={Math.min(ply, last)} onSelect={go}
                sides={{ w: { name: game?.white ?? SIDE.w, tone: 'ink' }, b: { name: game?.black ?? SIDE.b, tone: 'context' } }}
                caption="Complexity of the position, 1 to 100, for the player to move. Tap or click the chart to see a position."
                table={tableOf(positions)}
              />
            )}
        </div>
      )}
      <p role="status" className="sr-only">{mine && 'fenScore' in mine ? `Complexity ${mine.fenScore} out of 100, ${complexityWord(mine.fenScore)}` : game ? `${game.positions.length} positions scored` : ''}</p>
    </Panel>
  );
}

const tableOf = (positions: Position[]) => ({
  columns: ['After', 'To move', 'Complexity'],
  rows: positions.map(p => [moveLabel(p), SIDE[p.toMove], p.complexity ?? '–']),
});

/** The position on the board and its score. */
function Readout({ position, count }: { position: Position; count: number }) {
  const { complexity } = position;
  const where = count === 1 ? null : `Position ${position.ply + 1} of ${count}, ${position.ply === 0 ? 'the start' : `after ${moveLabel(position)}`}. `;
  return (
    <div className="flex flex-col gap-4">
      <p className="type-small text-ink-2 tnum">{where}{SIDE[position.toMove]} to move.</p>
      {complexity !== null ? (
        <div>
          <p className="flex flex-wrap items-baseline gap-x-3"><span className="type-h1 text-ink">{complexity}</span><span className="type-h3 text-ink-2">/ 100, {complexityWord(complexity).toLowerCase()}</span></p>
          <ComplexityScale score={complexity} size="lg" words={false} className="mt-2" />
        </div>
      ) : <p className="type-body text-ink-2">Press Analyze to get the complexity {count === 1 ? 'score' : 'score of every position'}.</p>}
    </div>
  );
}

function Averages({ positions }: { positions: Position[] }) {
  const avg = (c: 'w' | 'b') => averageComplexity(positions, c)?.toFixed(2) ?? '–';
  return <StatStrip columns={2} items={[{ label: 'White, average complexity', value: avg('w') }, { label: 'Black, average complexity', value: avg('b') }]} />;
}

/** One column per position, in the color of its complexity. */
function SampleChart({ positions, ply, onGo }: { positions: Position[]; ply: number; onGo: (ply: number) => void }) {
  const top = positions.reduce((m, p) => ((p.complexity ?? 0) > (m.complexity ?? 0) ? p : m));
  return (
    <ColumnChart
      columns={positions.map(p => ({
        key: String(p.ply), title: moveLabel(p),
        label: p === top ? moveLabel(p) : p.ply > 0 && p.ply % 20 === 0 ? String(p.ply / 2) : '',
        parts: [{ tone: complexityTone(p.complexity ?? 1), value: p.complexity ?? 0, label: 'Complexity' }],
      }))}
      format="int" height={160} values={false} selected={String(ply)} onSelect={k => onGo(Number(k))}
      caption={`Complexity after each move. ${moveLabel(top)} left the hardest position, ${top.complexity} out of 100. Tap or click a column to see it.`}
      ariaLabel={`Complexity of ${positions.length} positions. The hardest, ${top.complexity} out of 100, came after ${moveLabel(top)}.`}
      table={tableOf(positions)}
    />
  );
}
