'use client';

import { useTween } from './motion';
import { DeltaChip, Swatch, formatPct, inHundred, type Players } from './ui';

interface Props {
  players: Players;
  pWin1: number;
  pTb: number;
  /** Baseline odds; a delta chip shows when a scenario moves them. */
  base: { pWin1: number; pTb: number } | null;
  nSims: number;
  scenarioLabel?: string | null;
}

export default function WinSplitBar({ players, pWin1, pTb, base, nSims, scenarioLabel }: Props) {
  const t1 = useTween(pWin1);
  const t2 = 1 - t1;
  const tTb = useTween(pTb);
  const fav = pWin1 >= 0.5 ? players[1] : players[2];
  const favP = Math.max(pWin1, 1 - pWin1);
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
            <Swatch player={1} /> {players[1].shortName}
          </p>
          <p className="font-heading text-4xl sm:text-6xl text-[var(--text-primary)] leading-none mt-1" aria-hidden>
            {pct(t1)}
          </p>
          {base && <DeltaChip value={pWin1} base={base.pWin1} className="mt-2" />}
        </div>
        <div className="hidden sm:block text-center pb-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Chance to win the match</p>
        </div>
        <div className="min-w-0 text-right">
          <p className="flex items-center justify-end gap-1.5 text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
            {players[2].shortName} <Swatch player={2} />
          </p>
          <p className="font-heading text-4xl sm:text-6xl text-[var(--text-primary)] leading-none mt-1" aria-hidden>
            {pct(t2)}
          </p>
          {base && <DeltaChip value={1 - pWin1} base={1 - base.pWin1} className="mt-2" />}
        </div>
      </div>

      <div
        className="relative mt-4 flex h-4 sm:h-5 gap-[2px] rounded-full overflow-hidden bg-[var(--bg-surface-3)]"
        role="img"
        aria-label={`${players[1].shortName} ${formatPct(pWin1)}, ${players[2].shortName} ${formatPct(1 - pWin1)}`}
      >
        <div className="h-full rounded-l-full" style={{ width: `calc(${t1 * 100}% - 1px)`, background: 'var(--wcc-p1)' }} />
        <div className="h-full flex-1 rounded-r-full" style={{ background: 'var(--wcc-p2)' }} />
        <div aria-hidden className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--bg-surface-1)]/70" />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[var(--text-muted)] tabular-nums" aria-hidden>
        <span>0</span><span>50%</span><span>100</span>
      </div>

      <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed" aria-live="polite">
        {scenarioLabel ? <span className="font-semibold text-[var(--text-primary)]">{scenarioLabel} </span> : null}
        <span className="font-semibold text-[var(--text-primary)]">{fav.shortName}</span> wins {inHundred(favP)} matches
        {' '}· <span className="tabular-nums">{formatPct(tTb)}</span> go to tiebreaks.
        {' '}<span className="text-[var(--text-muted)]">
          {scenarioLabel
            ? 'Exact probabilities, recomputed instantly for this scenario.'
            : `Exact probabilities, confirmed by ${nSims.toLocaleString('en-US')} simulations.`}
        </span>
      </p>
    </div>
  );
}
