import { CLASSICAL_SCHEDULE, TIEBREAK_START } from '@/lib/wcc/config';
import type { MatchOdds } from '@/lib/wcc/types';
import { Section, Swatch, TableFallback, formatPct, tdCls, thCls, type Players } from './ui';

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Europe/Zurich', day: 'numeric', month: 'short' });
const dateOf = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short' });

/** When is the match decided? Clinch-game histogram with calendar dates. */
export default function ClinchTimeline({ odds, players }: { odds: MatchOdds; players: Players }) {
  const cols = odds.endGame.map(e => {
    const iso = e.g === 'tb' ? TIEBREAK_START : CLASSICAL_SCHEDULE[(e.g as number) - 1].startsAt;
    return { key: String(e.g), label: e.g === 'tb' ? 'TB' : `G${e.g}`, date: dateOf(iso), short: shortDate(iso), p1: e.p1, p2: e.p2, total: e.p1 + e.p2 };
  });
  const max = Math.max(0.01, ...cols.map(c => c.total));
  const mode = cols.reduce((a, c) => (c.total > a.total ? c : a), cols[0]);
  const byG14 = cols.filter(c => c.key !== 'tb').reduce((a, c) => a + c.total, 0);
  const H = 180;

  return (
    <Section
      id="when"
      eyebrow="When is it decided?"
      title="Clinch timeline"
      description={<>Most likely decided <strong className="text-[var(--text-primary)]">{mode.key === 'tb' ? 'in the tiebreaks' : `in game ${mode.key}`}, {mode.date}</strong> ({formatPct(mode.total)}). The match is over before the tiebreak day in {formatPct(byG14)} of cases.</>}
    >
      <div className="flex gap-1.5 sm:gap-3 items-end" style={{ height: H + 44 }} role="img"
        aria-label={`Probability the match is decided at each game. Most likely ${mode.label} (${formatPct(mode.total)}).`}>
        {cols.map(c => {
          const h1 = (c.p1 / max) * H;
          const h2 = (c.p2 / max) * H;
          const isMode = c.key === mode.key;
          return (
            <div key={c.key} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full group" title={`${c.label} (${c.date}): ${players[1].shortName} ${formatPct(c.p1)}, ${players[2].shortName} ${formatPct(c.p2)}`}>
              <span className={`text-[10px] sm:text-[11px] tabular-nums mb-1 ${isMode ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                {formatPct(c.total, c.total < 0.1 ? 1 : 0)}
              </span>
              <div className={`w-full max-w-[56px] flex flex-col gap-[2px] ${isMode ? 'drop-shadow-[0_0_8px_rgba(201,168,76,0.35)]' : ''}`}>
                {h2 > 0.5 && <div className="w-full rounded-t transition-[height] duration-500" style={{ height: h2, background: 'var(--wcc-p2)' }} />}
                {h1 > 0.5 && <div className={`w-full ${h2 > 0.5 ? '' : 'rounded-t'} transition-[height] duration-500`} style={{ height: h1, background: 'var(--wcc-p1)' }} />}
              </div>
              <div className={`mt-1.5 w-full border-t ${isMode ? 'border-chess-gold' : 'border-[var(--border)]'} pt-1 text-center leading-tight`}>
                <span className={`block text-[11px] font-semibold ${isMode ? 'text-gold-ink' : 'text-[var(--text-primary)]'}`}>{c.label}</span>
                <span className="block text-[9px] sm:text-[10px] text-[var(--text-muted)] truncate"><span className="sm:hidden">{c.short}</span><span className="hidden sm:inline">{c.date}</span></span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5"><Swatch player={1} /> {players[1].shortName} clinches</span>
        <span className="inline-flex items-center gap-1.5"><Swatch player={2} /> {players[2].shortName} clinches</span>
        <span className="text-[var(--text-muted)]">Games 1–7 cannot decide the match (7½ needs at least 8 games).</span>
      </div>
      <TableFallback>
        <table className="w-full text-[11px]">
          <thead><tr><th className={thCls}>Decided at</th><th className={thCls}>Date</th><th className={thCls}>{players[1].shortName}</th><th className={thCls}>{players[2].shortName}</th><th className={thCls}>Total</th></tr></thead>
          <tbody>
            {cols.map(c => (
              <tr key={c.key} className="border-t border-[var(--border)]">
                <td className={tdCls}>{c.label}</td><td className={tdCls}>{c.date}</td><td className={tdCls}>{formatPct(c.p1)}</td><td className={tdCls}>{formatPct(c.p2)}</td><td className={tdCls}>{formatPct(c.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableFallback>
    </Section>
  );
}
