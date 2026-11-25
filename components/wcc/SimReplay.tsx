'use client';

import { memo, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';

import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Pips, type PipItem } from '@/components/ui/Pips';
import { StatStrip } from '@/components/ui/StatStrip';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { LADDER, TB_STAGE_GAMES } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import type { FixedTbGame } from '@/lib/wcc/match';
import { N_BROWSER_SIMS, simulateMatch, simulateStats } from '@/lib/wcc/simulate';
import { fmtPoints, fmtScore } from '@/lib/wcc/status';
import type { HalfPoints, PlayerId, SimRow, TbStage, WdlSet } from '@/lib/wcc/types';

const STEP_MS = 420;
const STAGE_SHORT: Record<TbStage, string> = { rapid15: 'R15', rapid10: 'R10', blitz: 'Bz', sd: 'SD' };

function tbStageOf(i: number): TbStage {
  if (i < TB_STAGE_GAMES.rapid15) return 'rapid15';
  if (i < TB_STAGE_GAMES.rapid15 + TB_STAGE_GAMES.rapid10) return 'rapid10';
  if (i < TB_STAGE_GAMES.rapid15 + TB_STAGE_GAMES.rapid10 + TB_STAGE_GAMES.blitz) return 'blitz';
  return 'sd';
}

/** One game of the simulated match. `null`: not played; `pending`: not shown yet. */
function pip(hp: HalfPoints | null, pending: boolean, game: string, caption: string, players: Players): PipItem {
  if (pending) return { label: `${game}: pending`, tone: 'none', caption };
  if (hp === null) return { label: `${game}: not played`, letter: '–', tone: 'none', caption };
  if (hp === 1) return { label: `${game}: draw`, letter: '½', tone: 'draw', caption };
  const id = hp === 2 ? 1 : 2;
  return { label: `${game}: ${players[id].shortName} won`, letter: players[id].shortName[0], tone: id === 1 ? 'p1' : 'p2', caption };
}

interface Props {
  wdl: WdlSet;
  /** Classical results so far (P1 half-points): every simulation keeps them. */
  fixed: ReadonlyMap<number, HalfPoints>;
  g1White: PlayerId | null;
  tb: FixedTbGame[];
  players: Players;
}

/** One simulated match, dealt game by game. */
export const SimReplay = memo(function SimReplay({ wdl, fixed, g1White, tb, players }: Props) {
  const reduced = usePrefersReducedMotion();
  const input = useMemo(() => ({ wdl, fixed, g1White, tb }), [wdl, fixed, g1White, tb]);
  const stats = useMemo(() => simulateStats(input), [input]);
  const [index, setIndex] = useState<number | null>(null);
  const sim: SimRow = useMemo(() => simulateMatch(input, index ?? 0), [input, index]);
  const [shown, setShown] = useState<number>(Infinity);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => { if (timer.current) clearInterval(timer.current); };

  useEffect(() => stop, []);

  const deal = () => {
    stop();
    const k = Math.floor(Math.random() * N_BROWSER_SIMS);
    const next = simulateMatch(input, k);
    setIndex(k);
    const steps = next.classical.filter(v => v !== null).length + next.tb.length;
    if (reduced) { setShown(Infinity); return; }
    setShown(0);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= steps) stop();
    }, STEP_MS);
  };

  /** The button goes away when pressed; focus stays beside it. */
  const skip = (e: MouseEvent<HTMLElement>) => {
    stop();
    setShown(Infinity);
    (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const played = sim.classical.filter(v => v !== null);
  const total = played.length + sim.tb.length;
  const shownClassical = Math.min(shown, played.length);
  const shownTb = Math.max(0, Math.min(shown - played.length, sim.tb.length));
  const s1 = played.slice(0, shownClassical).reduce<number>((a, v) => a + (v ?? 0), 0);
  const s2 = 2 * shownClassical - s1;
  const finished = shown >= total;
  const winner = players[sim.winner];
  const decided = sim.decidedStage === 'classical'
    ? `${fmtScore(Math.max(sim.p1Hp, sim.p2Hp), Math.min(sim.p1Hp, sim.p2Hp))} after game ${sim.endGame}`
    : `7–7, then won the ${LADDER[sim.decidedStage].label.toLowerCase()} ${sim.decidedStage === 'sd' ? `after ${sim.tb.length - 8} sudden-death game${sim.tb.length - 8 === 1 ? '' : 's'}` : 'stage'}`;
  const n = fixed.size;
  const margin = stats.maxMarginScore;

  return (
    <Section
      id="replay"
      title="Deal a simulated match"
      finding={n > 0
        ? `Every simulation keeps the ${n === 1 ? 'game' : `${n} games`} already played and draws the rest from the model’s odds. Deal one and watch it play out game by game.`
        : 'Each game is drawn from the model’s odds. Deal one and watch it play out game by game. The odds are made of matches like these.'}
      actions={
        <>
          <Button variant="primary" icon="play" onClick={deal} className="lg:min-w-44">{index !== null ? 'Deal another' : 'Deal a match'}</Button>
          {!finished && <Button onClick={skip} className="lg:min-w-44">Skip to the end</Button>}
        </>
      }
    >
      <div className="flex flex-col gap-y-6">
        <div>
          <p className="type-h1 text-ink" aria-live="polite">
            <span className="sr-only">{players[1].shortName} </span>{fmtPoints(s1)}<span aria-hidden>–</span><span className="sr-only">, {players[2].shortName} </span>{fmtPoints(s2)}
          </p>
          <p className="mt-2 min-h-8 type-standfirst text-ink" aria-live="polite">
            {finished ? <>{winner.shortName} is World Champion, {decided}.</> : <span className="text-ink-3">{shownClassical < played.length ? `Game ${shownClassical + 1}` : 'Tiebreaks'}</span>}
          </p>
          <p className="mt-1 type-small text-ink-2">
            Simulation {((index ?? 0) + 1).toLocaleString('en-US')} of {N_BROWSER_SIMS.toLocaleString('en-US')}. {players[sim.g1White].shortName} has White in game 1.
          </p>
        </div>
        <Pips
          kind="result" size={32} fill ariaLabel="Classical games"
          items={sim.classical.map((v, i) => pip(v, i >= shownClassical && (v !== null || shownClassical < played.length), `Game ${i + 1}`, `G${i + 1}`, players))}
        />
        {sim.tb.length > 0 && (
          <div>
            <p className="mb-2 type-label text-ink-2">Tiebreaks</p>
            <Pips
              kind="result" size={32} ariaLabel="Tiebreak games"
              items={sim.tb.map((v, i) => pip(v, i >= shownTb, `${LADDER[tbStageOf(i)].label} game`, STAGE_SHORT[tbStageOf(i)], players))}
            />
          </div>
        )}
        <StatStrip
          columns={4}
          items={[
            { label: 'Went all the way to sudden death', value: `${stats.toSd.toLocaleString('en-US')} sims` },
            { label: 'Longest sudden-death run', value: stats.longestSd > 0 ? `${stats.longestSd} games` : '–' },
            { label: 'Most one-sided finish', value: margin ? `${fmtScore(Math.max(margin.p1, margin.p2), Math.min(margin.p1, margin.p2))} after G${margin.games}` : '–' },
            { label: 'Fourteen straight draws', value: `${stats.allDraws.toLocaleString('en-US')} sims` },
          ]}
        />
      </div>
    </Section>
  );
});
