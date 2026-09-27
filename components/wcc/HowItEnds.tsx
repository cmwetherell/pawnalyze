import { LADDER, STAGE_ORDER } from '@/lib/wcc/config';
import type { MatchOdds, Stage } from '@/lib/wcc/types';
import { Section, Swatch, TableFallback, formatPct, tdCls, thCls, type Players } from './ui';

/** The tiebreak ladder as a funnel: how often each rung is reached and who wins there. */
export default function HowItEnds({ odds, players }: { odds: MatchOdds; players: Players }) {
  const rows = STAGE_ORDER.map((s: Stage, i) => {
    const st = odds.stages[s];
    const reach = st.reach;
    const cont = Math.max(0, reach - st.p1 - st.p2);
    return { s, i, reach, p1: st.p1, p2: st.p2, cont, last: s === 'sd' };
  });
  const tb = odds.pTb;

  return (
    <Section
      id="how-it-ends"
      eyebrow="The tiebreak ladder"
      title="How it ends"
      description={<>Each rung is only played if the match is still level. Bars show who wins <em>among matches that reach that rung</em>; the width of the rail shows how many get there.</>}
    >
      <ol className="relative space-y-2" aria-label={`Match reaches a tiebreak in ${formatPct(tb)} of cases`}>
        {rows.map(r => {
          const c1 = r.reach > 0 ? r.p1 / r.reach : 0;
          const c2 = r.reach > 0 ? r.p2 / r.reach : 0;
          const cc = r.reach > 0 ? r.cont / r.reach : 0;
          const rail = Math.max(1.5, r.reach * 100);
          return (
            <li key={r.s} className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)_76px] gap-x-4 gap-y-1.5 items-center rounded-xl bg-[var(--bg-surface-2)]/60 p-3">
              <div className="flex items-baseline justify-between sm:block">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  <span className="text-[var(--text-muted)] tabular-nums mr-1.5">{r.i + 1}</span>{LADDER[r.s].label}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] sm:mt-0.5">{LADDER[r.s].short}</p>
                <p className="sm:hidden text-xs tabular-nums text-[var(--text-secondary)]">reached {formatPct(r.reach)}</p>
              </div>
              <div className="min-w-0">
                <div className="relative h-1 mb-1.5 rounded-full bg-[var(--bg-surface-3)]" aria-hidden>
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full bg-chess-gold/60" style={{ width: `${rail}%` }} />
                </div>
                <div className="flex h-6 gap-[2px] rounded-md overflow-hidden" role="img"
                  aria-label={`${LADDER[r.s].label}: if reached, ${players[1].shortName} wins ${formatPct(c1)}, ${players[2].shortName} wins ${formatPct(c2)}${r.last ? '' : `, still level ${formatPct(cc)}`}`}>
                  {c1 > 0 && <div className="grid place-items-center text-[10px] font-semibold text-white tabular-nums" style={{ width: `${c1 * 100}%`, background: 'var(--wcc-p1)' }}>{c1 > 0.12 ? formatPct(c1, 0) : ''}</div>}
                  {c2 > 0 && <div className="grid place-items-center text-[10px] font-semibold text-white tabular-nums" style={{ width: `${c2 * 100}%`, background: 'var(--wcc-p2)' }}>{c2 > 0.12 ? formatPct(c2, 0) : ''}</div>}
                  {!r.last && cc > 0 && <div className="wcc-hatch grid place-items-center text-[10px] font-semibold text-[var(--text-primary)] tabular-nums" style={{ width: `${cc * 100}%` }}>{cc > 0.14 ? `${formatPct(cc, 0)} level` : ''}</div>}
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--text-muted)] leading-snug">{LADDER[r.s].rule}</p>
              </div>
              <p className="hidden sm:block text-right">
                <span className="block font-heading text-lg text-[var(--text-primary)]">{formatPct(r.reach)}</span>
                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">reached</span>
              </p>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5"><Swatch player={1} /> {players[1].shortName} wins here</span>
        <span className="inline-flex items-center gap-1.5"><Swatch player={2} /> {players[2].shortName} wins here</span>
        <span className="inline-flex items-center gap-1.5"><Swatch player="level" /> still level, next rung</span>
      </div>
      <TableFallback>
        <table className="w-full text-[11px]">
          <thead><tr><th className={thCls}>Stage</th><th className={thCls}>Reached</th><th className={thCls}>{players[1].shortName} wins</th><th className={thCls}>{players[2].shortName} wins</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.s} className="border-t border-[var(--border)]">
                <td className={tdCls}>{LADDER[r.s].label}</td>
                <td className={tdCls}>{formatPct(r.reach)}</td>
                <td className={tdCls}>{formatPct(r.p1)}</td>
                <td className={tdCls}>{formatPct(r.p2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1">Win columns are unconditional (share of all matches).</p>
      </TableFallback>
    </Section>
  );
}
