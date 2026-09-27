import { fmtScore } from '@/lib/wcc/status';
import type { MatchOdds } from '@/lib/wcc/types';
import { Section, Swatch, TableFallback, formatPct, tdCls, thCls, type Players } from './ui';

interface Row { key: string; label: string; sub: string; p1: number; p2: number }

/** Every way the classical match can finish, Gukesh wins to the left, Sindarov wins to the right. */
export default function ScoreDistribution({ odds, players }: { odds: MatchOdds; players: Players }) {
  const cells = new Map<string, Row>();
  const get = (win: number, lose: number, games: number) => {
    const key = `${win}-${lose}-${games}`;
    let row = cells.get(key);
    if (!row) {
      row = { key, label: fmtScore(win, lose), sub: `after G${games}`, p1: 0, p2: 0 };
      cells.set(key, row);
    }
    return row;
  };
  // Enumerate every possible finish so the shape stays stable as scenarios change.
  // 7½–x (a draw or win from 7) and 8–x (a win from 7) are the only ways to reach the clinch.
  for (let g = 14; g >= 8; g--) {
    get(15, 2 * g - 15, g);
    get(16, 2 * g - 16, g);
  }
  for (const r of odds.scoreDist) {
    if (r.p1_hp === r.p2_hp) continue;
    const p1Won = r.p1_hp > r.p2_hp;
    const row = get(Math.max(r.p1_hp, r.p2_hp), Math.min(r.p1_hp, r.p2_hp), r.games);
    if (p1Won) row.p1 += r.p; else row.p2 += r.p;
  }
  const tbRow = odds.endGame.find(e => e.g === 'tb');
  const rows: Row[] = [
    { key: 'tb', label: '7–7', sub: 'tiebreak', p1: tbRow?.p1 ?? 0, p2: tbRow?.p2 ?? 0 },
    ...Array.from(cells.values()),
  ];
  const max = Math.max(0.01, ...rows.flatMap(r => [r.p1, r.p2]));
  const best = rows.reduce((a, r) => (Math.max(r.p1, r.p2) > Math.max(a.p1, a.p2) ? r : a), rows[0]);
  const bestWho = best.p1 >= best.p2 ? players[1].shortName : players[2].shortName;

  const bar = (p: number, side: 'l' | 'r') => (
    <div className={`flex items-center gap-1.5 ${side === 'l' ? 'flex-row-reverse' : ''}`}>
      <div
        className={`h-4 ${side === 'l' ? 'rounded-l' : 'rounded-r'} transition-[width] duration-500`}
        style={{ width: `${(p / max) * 100}%`, minWidth: p > 0 ? 2 : 0, background: side === 'l' ? 'var(--wcc-p1)' : 'var(--wcc-p2)' }}
      />
      <span className="text-[10px] tabular-nums text-[var(--text-secondary)] shrink-0">{p >= 0.0005 ? formatPct(p) : ''}</span>
    </div>
  );

  return (
    <Section
      id="scores"
      eyebrow="Final classical score"
      title="Score distribution"
      description={<>The single most likely finish is <strong className="text-[var(--text-primary)]">{best.key === 'tb' ? '7–7 and a tiebreak' : `${bestWho} ${best.label} ${best.sub}`}</strong> ({formatPct(Math.max(best.p1, best.p2))}). Matches stop the moment someone reaches 7½.</>}
    >
      <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-2">
        <span className="inline-flex items-center gap-1.5"><Swatch player={1} /> {players[1].shortName} wins</span>
        <span className="inline-flex items-center gap-1.5">{players[2].shortName} wins <Swatch player={2} /></span>
      </div>
      <div role="img" aria-label={`Final score probabilities. Most likely: ${best.label} ${best.sub}.`} className="space-y-1">
        {rows.map(r => (
          <div key={r.key} className={`grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-center gap-2 ${r.key === 'tb' ? 'pb-2 mb-1 border-b border-dashed border-[var(--border)]' : ''}`}>
            {bar(r.p1, 'l')}
            <div className="text-center leading-tight">
              <span className="block text-xs font-semibold text-[var(--text-primary)] tabular-nums">{r.label}</span>
              <span className="block text-[10px] text-[var(--text-muted)]">{r.sub}</span>
            </div>
            {bar(r.p2, 'r')}
          </div>
        ))}
      </div>
      <TableFallback>
        <table className="w-full text-[11px]">
          <thead><tr><th className={thCls}>Score</th><th className={thCls}>Finish</th><th className={thCls}>{players[1].shortName} wins</th><th className={thCls}>{players[2].shortName} wins</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.key} className="border-t border-[var(--border)]">
                <td className={tdCls}>{r.label}</td><td className={tdCls}>{r.sub}</td><td className={tdCls}>{formatPct(r.p1)}</td><td className={tdCls}>{formatPct(r.p2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableFallback>
    </Section>
  );
}
