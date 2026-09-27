import { PRIZE } from '@/lib/wcc/config';
import type { Prize } from '@/lib/wcc/types';
import { DeltaChip, Section, formatPct, fmtUsd, type Players } from './ui';

export default function PrizeCard({ prize, base, players }: { prize: Prize; base: Prize | null; players: Players }) {
  const rows = [
    { id: 1 as const, v: prize.exp1, b: base?.exp1 },
    { id: 2 as const, v: prize.exp2, b: base?.exp2 },
  ];
  return (
    <Section
      id="prize"
      eyebrow="$2.5 million prize fund"
      title="Expected prize money"
      description={<>{PRIZE.rule} {PRIZE.exception}</>}
    >
      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px] gap-3">
        {rows.map(r => (
          <div key={r.id} className="rounded-xl bg-[var(--bg-surface-2)] p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
              <span aria-hidden className="w-2.5 h-2.5 rounded-sm" style={{ background: r.id === 1 ? 'var(--wcc-p1)' : 'var(--wcc-p2)' }} />
              {players[r.id].shortName}
            </p>
            <p className="mt-1 font-heading text-3xl text-[var(--text-primary)]">{fmtUsd(r.v)}</p>
            <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-surface-3)] overflow-hidden" aria-hidden>
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(r.v / PRIZE.total) * 100}%`, background: r.id === 1 ? 'var(--wcc-p1)' : 'var(--wcc-p2)' }} />
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--text-muted)] tabular-nums">
              expected, of {fmtUsd(PRIZE.total)}
              {r.b !== undefined && Math.abs(r.v - r.b) >= 500 && (
                <span className="ml-1 font-semibold text-[var(--text-primary)]">({r.v > r.b ? '+' : '−'}{fmtUsd(Math.abs(r.v - r.b))})</span>
              )}
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-[var(--border)] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Fixed $1.3M / $1.2M split</p>
          <p className="mt-1 font-heading text-3xl text-[var(--text-primary)]">{formatPct(prize.p_split)}</p>
          {base && <DeltaChip value={prize.p_split} base={base.p_split} />}
          <p className="mt-1.5 text-[11px] text-[var(--text-muted)] leading-snug">Mostly tiebreak finishes; a few very decisive 14-game matches too.</p>
        </div>
      </div>
    </Section>
  );
}
