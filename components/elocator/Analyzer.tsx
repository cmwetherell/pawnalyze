'use client';

import { useMemo, useRef, useState } from 'react';

import { ColumnChart } from '@/components/charts/ColumnChart';
import { BoardControls } from '@/components/chess/BoardControls';
import { BoardPane } from '@/components/chess/BoardPane';
import { ComplexityChart, averageComplexity } from '@/components/chess/ComplexityChart';
import { ComplexityScale } from '@/components/chess/ComplexityScale';
import { Replay } from '@/components/chess/Replay';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Chip } from '@/components/ui/Chip';
import { CopyButton } from '@/components/ui/CopyButton';
import { Field } from '@/components/ui/Field';
import { Heading } from '@/components/ui/Heading';
import { Textarea } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/IconButton';
import { Panel } from '@/components/ui/Panel';
import { StatStrip } from '@/components/ui/StatStrip';
import { moveLabel, positionLabel } from '@/lib/chess/moves';
import { analyzeGame, fetchComplexity, type GameAnalysis } from '@/lib/elocator/api';
import { EXAMPLE_GAME, EXAMPLE_POSITIONS } from '@/lib/elocator/examples';
import { detectInputType, endOf, fenOf, positionOf, positionsOf, type Position } from '@/lib/elocator/input';
import { complexityTone, complexityWord } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

const SIDE = { w: 'White', b: 'Black' } as const;

const FILLS = [
  ...EXAMPLE_POSITIONS.map(p => ({ label: p.name, text: p.fen })),
  { label: 'Full game', text: EXAMPLE_GAME.pgn },
];

/** What Elocator said, and about which input. */
type Answer = { input: string } & ({ fenScore: number } | { game: GameAnalysis });

const NOT_READ = 'Could not detect input format. Please enter a valid FEN string or PGN game.';

/** FEN or PGN in, board and complexity out. With an empty box it shows a game that is already scored. */
export function Analyzer() {
  const [input, setInput] = useState('');
  // What the board shows: the last input that could be read, so a slip of the pen does not clear it.
  const [shown, setShown] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [failure, setFailure] = useState<{ input: string; error: string } | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [ply, setPly] = useState(EXAMPLE_GAME.showcasePly);
  const [flipped, setFlipped] = useState(false);
  const request = useRef(0);

  const text = input.trim();
  const busy = pending !== null && pending === text;
  const error = failure?.input === text ? failure.error : null;
  const kind = shown === '' ? 'sample' : detectInputType(shown);
  const replay = useMemo(() => (kind === 'pgn' ? positionsOf(shown) : []), [kind, shown]);
  const mine = answer !== null && answer.input === shown ? answer : null;
  const game = mine && 'game' in mine ? mine.game : null;

  const positions: Position[] = kind === 'sample' ? EXAMPLE_GAME.positions
    : kind === 'fen' ? [positionOf(fenOf(shown), mine && 'fenScore' in mine ? mine.fenScore : null)]
      : game ? game.positions : replay;
  const last = positions.length - 1;
  const at = positions[Math.min(ply, last)];
  const scored = positions.some(p => p.complexity !== null);
  const go = (n: number) => setPly(Math.min(Math.max(n, 0), last));
  const flip = () => setFlipped(v => !v);

  const show = (value: string) => {
    // An answer still on its way was for another input.
    request.current++;
    setPending(null);
    setShown(value);
    setPly(value === '' ? EXAMPLE_GAME.showcasePly : 0);
  };
  const fill = (value: string) => {
    setInput(value);
    const next = value.trim();
    const as = next === '' ? 'sample' : detectInputType(next);
    if (next !== shown && (as === 'sample' || as === 'fen' || (as === 'pgn' && positionsOf(next).length > 1))) show(next);
  };

  const analyze = async () => {
    const id = ++request.current;
    const fail = (message: string) => { if (id === request.current) { setFailure({ input: text, error: message }); setPending(null); } };
    const done = (a: Answer) => {
      if (id !== request.current) return;
      setAnswer(a);
      setFailure(null);
      setPending(null);
      // A game that could not be replayed here, but that Elocator can read.
      if (text !== shown) show(text);
    };
    const as = text === '' ? 'error' : detectInputType(text);
    if (as === 'error') { fail(NOT_READ); return; }
    setPending(text);
    if (as === 'fen') {
      const r = await fetchComplexity(fenOf(text));
      if ('error' in r) fail(r.error); else done({ input: text, fenScore: r.score });
    } else {
      const r = await analyzeGame(text, text === shown ? replay : positionsOf(text));
      if ('error' in r) fail(r.error); else done({ input: text, game: r });
    }
  };

  const title = kind === 'sample' ? EXAMPLE_GAME.title
    : game && (game.white || game.black) ? `${game.white ?? SIDE.w} vs ${game.black ?? SIDE.b}`
      : kind === 'fen' ? 'Your position' : 'Your game';
  const facts = kind === 'sample' ? `An example, already scored. ${EXAMPLE_GAME.players}, ${EXAMPLE_GAME.event}` : game?.event;

  return (
    <Panel padding="md">
      {/* The box takes the height the board leaves, so both columns end together. The averages stand under the shorter one. */}
      <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]', last > 0 && 'lg:grid-rows-[auto_1fr] xl:grid-rows-[1fr_auto]')}>
        <div className={cn('flex min-w-0 flex-col gap-6', last > 0 && 'lg:row-span-2 xl:row-span-1')}>
          <div className="flex flex-col gap-4 lg:grow">
            <div className="relative flex flex-col lg:grow">
              <Field label="FEN or PGN" className="lg:grow">
                <Textarea mono rows={3} placeholder="Paste a FEN or PGN here" value={input} onChange={e => fill(e.target.value)} className="pr-12 lg:grow" />
              </Field>
              {input !== '' && <IconButton icon="close" label="Clear" onClick={e => { e.currentTarget.parentElement?.querySelector('textarea')?.focus(); fill(''); }} className="absolute right-0.5 top-7 mt-0.5" />}
            </div>
            {error && <Callout tone="negative" icon="error">{error}</Callout>}
            <div className="flex flex-col gap-x-6 gap-y-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Button variant="primary" loading={busy} onClick={analyze}>{busy ? 'Analyzing' : 'Analyze'}</Button>
              <div role="group" aria-label="Try an example" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:max-xl:w-full lg:max-xl:flex-col lg:max-xl:items-stretch">
                <span aria-hidden className="type-small text-ink-2 sm:mr-1">Try</span>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:max-xl:grid">
                  {FILLS.map(f => <Chip key={f.label} className="justify-center" onClick={() => fill(f.text)}>{f.label}</Chip>)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 border-t border-line pt-6">
            <div>
              <Heading level={2} style="h3">{title}</Heading>
              {facts && <p className="type-small text-ink-2">{facts}</p>}
            </div>
            <Readout position={at} count={last + 1} busy={busy && text === shown} />
            {kind === 'fen' && (
              <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
                <code className="min-w-0 break-all type-mono text-ink-2">{at.fen}</code>
                <CopyButton kind="text" text={at.fen} label="Copy FEN" variant="icon" className="-mr-3" />
              </div>
            )}
          </div>
        </div>
        <div className={cn('min-w-0', last > 0 && 'xl:row-span-2')}>
          <Replay
            label="Board; use the arrow keys to step through the moves" ply={Math.min(ply, last)} last={last} onGo={go} onFlip={flip}
            board={(
              <BoardPane
                fen={at.fen} from={at.from} to={at.to} flipped={flipped}
                label={kind === 'fen' ? `Your position, ${SIDE[at.toMove]} to move` : positionLabel(at)}
                controls={<BoardControls ply={Math.min(ply, last)} last={last} onGo={go} onFlip={flip} />}
              />
            )}
          />
        </div>
        {last > 0 && <Averages positions={positions} />}
      </div>
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

/** The position on the board and its score; the room is there before the score is. */
function Readout({ position, count, busy }: { position: Position; count: number; busy: boolean }) {
  const { complexity } = position;
  const where = count === 1 ? null : `Position ${position.ply + 1} of ${count}, ${position.ply === 0 ? 'the start' : `after ${moveLabel(position)}`}. `;
  const end = useMemo(() => endOf(position.fen), [position.fen]);
  return (
    <div className="flex flex-col gap-4">
      <p className="type-small text-ink-2 tnum">{where}{end ?? `${SIDE[position.toMove]} to move`}.</p>
      <div>
        <p className="flex flex-wrap items-baseline gap-x-3">
          {/* Unscored: an empty figure as tall as the number to come. */}
          <span aria-hidden={complexity === null || undefined} className={cn('type-h1 text-ink', complexity === null && 'invisible -mr-3 w-0')}>{complexity ?? 0}</span>
          {complexity !== null ? <span className="type-h3 text-ink-2">/ 100, {complexityWord(complexity).toLowerCase()}</span>
            : <span className="min-w-0 type-lead text-ink-2">{busy ? `Scoring ${count === 1 ? 'the position' : 'every position'}` : `Press Analyze to score ${count === 1 ? 'it' : 'every position'}`}</span>}
        </p>
        <ComplexityScale score={complexity} size="lg" words={false} className="mt-2" />
      </div>
    </div>
  );
}

function Averages({ positions }: { positions: Position[] }) {
  const avg = (c: 'w' | 'b') => averageComplexity(positions, c)?.toFixed(2) ?? '–';
  return <StatStrip columns={2} className="self-start" items={[{ label: 'White, average complexity', value: avg('w') }, { label: 'Black, average complexity', value: avg('b') }]} />;
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
