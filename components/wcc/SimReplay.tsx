'use client';

import { useEffect, useRef, useState } from 'react';

import { LADDER, TB_STAGE_GAMES } from '@/lib/wcc/config';
import { fmtPoints, fmtScore } from '@/lib/wcc/status';
import type { HalfPoints, SimRow, SimStats, TbStage } from '@/lib/wcc/types';
import { usePrefersReducedMotion } from './motion';
import { Section, type Players } from './ui';

const STEP_MS = 420;

function Pip({ hp, players, label, pending }: { hp: HalfPoints | null; players: Players; label: string; pending?: boolean }) {
  if (hp === null || pending) {
    return (
      <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full grid place-items-center text-[10px] border border-dashed border-[var(--border)] text-[var(--text-muted)] ${pending ? 'opacity-60' : 'opacity-40'}`} aria-label={`${label}: ${pending ? 'pending' : 'not played'}`}>
        {pending ? '' : '–'}
      </span>
    );
  }
  const text = hp === 2 ? players[1].shortName[0] : hp === 0 ? players[2].shortName[0] : '½';
  const bg = hp === 2 ? 'var(--wcc-p1)' : hp === 0 ? 'var(--wcc-p2)' : 'var(--wcc-draw)';
  const who = hp === 2 ? `${players[1].shortName} won` : hp === 0 ? `${players[2].shortName} won` : 'draw';
  return (
    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full grid place-items-center text-[11px] font-bold text-white animate-fade-in shadow-sm" style={{ background: bg }} aria-label={`${label}: ${who}`}>
      {text}
    </span>
  );
}

function tbStageOf(i: number): TbStage {
  if (i < TB_STAGE_GAMES.rapid15) return 'rapid15';
  if (i < TB_STAGE_GAMES.rapid15 + TB_STAGE_GAMES.rapid10) return 'rapid10';
  if (i < TB_STAGE_GAMES.rapid15 + TB_STAGE_GAMES.rapid10 + TB_STAGE_GAMES.blitz) return 'blitz';
  return 'sd';
}

export default function SimReplay({
  runId, nSims, stats, sample, players,
}: {
  runId: number;
  nSims: number;
  stats: SimStats | null;
  sample: SimRow[];
  players: Players;
}) {
  const reduced = usePrefersReducedMotion();
  const [sim, setSim] = useState<SimRow | null>(sample[0] ?? null);
  const [index, setIndex] = useState<number | null>(null);
  const [shown, setShown] = useState<number>(Infinity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const total = sim ? sim.classical.filter(v => v !== null).length + sim.tb.length : 0;

  const deal = async () => {
    if (timer.current) clearInterval(timer.current);
    setLoading(true);
    setError(null);
    const k = Math.floor(Math.random() * nSims);
    try {
      const res = await fetch(`/api/sims/wcc-2026/sim?run=${runId}&id=${k}`);
      if (!res.ok) throw new Error(res.status === 410 ? 'New simulations are available; reload the page.' : `HTTP ${res.status}`);
      const next = (await res.json()) as SimRow;
      setSim(next);
      setIndex(k);
      const steps = next.classical.filter(v => v !== null).length + next.tb.length;
      if (reduced) { setShown(Infinity); return; }
      setShown(0);
      let i = 0;
      timer.current = setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= steps && timer.current) clearInterval(timer.current);
      }, STEP_MS);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load a simulation');
    } finally {
      setLoading(false);
    }
  };

  const played = sim ? sim.classical.map((v, i) => ({ v, i })).filter(x => x.v !== null) : [];
  const revealedClassical = Math.min(shown, played.length);
  const revealedTb = Math.max(0, Math.min(shown - played.length, sim?.tb.length ?? 0));
  let s1 = 0, s2 = 0;
  for (let i = 0; i < revealedClassical; i++) { s1 += played[i].v!; s2 += 2 - played[i].v!; }
  const finished = shown >= total;
  const animating = sim !== null && !finished;
  const winner = sim ? players[sim.winner] : null;
  const decided = sim?.decidedStage === 'classical'
    ? `${fmtScore(Math.max(sim.p1Hp, sim.p2Hp), Math.min(sim.p1Hp, sim.p2Hp))} after game ${sim.endGame}`
    : sim ? `7–7, then won the ${LADDER[sim.decidedStage].label.toLowerCase()} ${sim.decidedStage === 'sd' ? `after ${sim.tb.length - 8} sudden-death game${sim.tb.length - 8 === 1 ? '' : 's'}` : 'stage'}` : '';

  return (
    <Section
      id="replay"
      eyebrow={`One of ${nSims.toLocaleString('en-US')} simulated matches`}
      title="Deal a simulated match"
      description="Every simulated match is stored. Deal one and watch it play out game by game — it's what the odds are made of."
      action={
        <button
          type="button"
          onClick={deal}
          disabled={loading}
          className="h-11 px-4 rounded-lg bg-chess-gold text-chess-dark text-sm font-semibold hover:bg-chess-gold-light hover:shadow-gold transition-all disabled:opacity-60 inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><rect x="4" y="3" width="12" height="16" rx="2" /><path d="M8 21h10a2 2 0 002-2V7" /></svg>
          {loading ? 'Dealing…' : sim && index !== null ? 'Deal another' : 'Deal a match'}
        </button>
      }
    >
      {sim ? (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[var(--text-muted)]">
                {index !== null ? <>Simulation #{(index + 1).toLocaleString('en-US')}</> : 'A sample simulation'}
                {' · '}{players[sim.g1White].shortName} White in game 1
              </p>
              <p className="font-heading text-2xl text-[var(--text-primary)] whitespace-nowrap" aria-live="polite">
                {fmtPoints(s1) || '0'}–{fmtPoints(s2) || '0'}
              </p>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 justify-items-center" aria-label="Classical games">
              {sim.classical.map((v, i) => {
                const pos = played.findIndex(x => x.i === i);
                const visible = pos >= 0 && pos < revealedClassical;
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <Pip hp={visible ? (v as HalfPoints) : null} players={players} label={`Game ${i + 1}`} pending={v !== null && !visible} />
                    <span className="text-[9px] text-[var(--text-muted)]">G{i + 1}</span>
                  </div>
                );
              })}
            </div>
            {sim.tb.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Tiebreaks</p>
                <div className="flex flex-wrap gap-1.5">
                  {sim.tb.map((v, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <Pip hp={i < revealedTb ? v : null} players={players} label={`${LADDER[tbStageOf(i)].label} game`} pending={i >= revealedTb} />
                      <span className="text-[9px] text-[var(--text-muted)]">{tbStageOf(i) === 'sd' ? 'SD' : tbStageOf(i) === 'blitz' ? 'Bz' : tbStageOf(i) === 'rapid10' ? 'R10' : 'R15'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className={`mt-4 text-sm transition-opacity ${finished ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">
              {finished && winner && (
                <>
                  <span className="font-semibold text-[var(--text-primary)]">{winner.shortName} is World Champion</span>
                  <span className="text-[var(--text-secondary)]"> — {decided}.</span>
                </>
              )}
            </p>
            {animating && (
              <button type="button" onClick={() => { if (timer.current) clearInterval(timer.current); setShown(Infinity); }} className="mt-1 h-8 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline">
                Skip to the end
              </button>
            )}
            {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
          </div>

          {stats && (
            <dl className="grid grid-cols-2 lg:grid-cols-1 gap-2 content-start">
              {[
                { k: 'Went all the way to sudden death', v: `${stats.toSd.toLocaleString('en-US')} sims` },
                { k: 'Longest sudden-death run', v: stats.longestSd > 0 ? `${stats.longestSd} games` : '—' },
                { k: 'Most one-sided finish', v: stats.maxMarginScore ? `${fmtScore(Math.max(stats.maxMarginScore.p1, stats.maxMarginScore.p2), Math.min(stats.maxMarginScore.p1, stats.maxMarginScore.p2))} after G${stats.maxMarginScore.games}` : '—' },
                { k: 'Fourteen straight draws', v: `${stats.allDraws.toLocaleString('en-US')} sims` },
              ].map(x => (
                <div key={x.k} className="rounded-lg bg-[var(--bg-surface-2)] px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{x.k}</dt>
                  <dd className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{x.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Simulated matches appear here once the first run is uploaded.</p>
      )}
    </Section>
  );
}
