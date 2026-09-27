import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import type { OfficialStandings, Team } from '@/lib/olympiad/types';

const MEDAL = [
  { label: 'Gold', pip: 'bg-medal-gold text-chess-dark', ring: 'border-chess-gold/60 bg-chess-gold/[0.07] shadow-gold' },
  { label: 'Silver', pip: 'bg-medal-silver text-chess-dark', ring: 'border-[var(--border)] bg-[var(--bg-surface-2)]' },
  { label: 'Bronze', pip: 'bg-medal-bronze text-white', ring: 'border-[var(--border)] bg-[var(--bg-surface-2)]' },
];

interface Props {
  standings: OfficialStandings;
  teams: Team[];
  /** Pre-tournament gold odds by team id, from the rounds_completed = 0 run. */
  preTournamentGold: Map<number, number>;
  eventLabel: string;
}

/**
 * Final medalists, shown once every round has a result. Ranks and tiebreaks are the official
 * chess-results values; the odds quoted alongside are what the model gave each team before round 1,
 * which is the honest comparison (the post-event run has them all at 100%).
 */
export default function FinalPodium({ standings, teams, preTournamentGold, eventLabel }: Props) {
  const byId = new Map(teams.map(t => [t.teamId, t]));
  const podium = standings.rows.filter(r => r.rank <= 3).sort((a, b) => a.rank - b.rank);
  if (podium.length < 3) return null;

  // A medal decided on tiebreak: level on match points with the team immediately below it.
  const rowAt = (rank: number) => standings.rows.find(r => r.rank === rank);
  const tiebreakNote = (rank: number): string | null => {
    const here = rowAt(rank);
    const below = rowAt(rank + 1);
    if (!here || !below || here.mp !== below.mp) return null;
    const other = byId.get(below.teamId);
    if (!other) return null;
    const sameGp = here.gpHalf === below.gpHalf;
    const margin = here.sb !== null && below.sb !== null ? Math.abs(here.sb - below.sb) : null;
    return `Decided on tiebreak — level with ${other.name} on match points${sameGp ? ' and game points' : ''}${
      margin !== null ? `, ahead by ${margin.toFixed(1)} on Sonneborn-Berger` : ''
    }.`;
  };

  return (
    <section className="surface-card p-4 sm:p-6" aria-label={`${eventLabel} final medalists`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
        <h2 className="text-xl font-heading text-[var(--text-primary)]">
          <span className="gold-gradient-text">Champions</span>
        </h2>
        <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          Final standings · 11 rounds · Samarkand
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {podium.map((row, i) => {
          const team = byId.get(row.teamId);
          if (!team) return null;
          const note = tiebreakNote(row.rank);
          const pre = preTournamentGold.get(row.teamId);
          return (
            <li key={row.teamId} className={`rounded-xl border p-4 flex flex-col gap-3 ${MEDAL[i].ring}`}>
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold inline-flex items-center justify-center shrink-0 ${MEDAL[i].pip}`}
                  aria-hidden
                >
                  {row.rank}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{MEDAL[i].label}</span>
              </div>

              <div className="flex items-center gap-3">
                <Flag code={team.fedCode} size="xl" aria-hidden />
                <div className="min-w-0">
                  <p className={`font-heading leading-tight truncate ${i === 0 ? 'text-lg text-gold-ink' : 'text-base text-[var(--text-primary)]'}`}>
                    {team.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] tabular-nums">
                    {row.mp} MP · {(row.gpHalf / 2).toFixed(1)} GP
                    {row.sb !== null ? <> · {row.sb.toFixed(1)} SB</> : null}
                  </p>
                </div>
              </div>

              {note ? <p className="text-[11px] leading-snug text-[var(--text-secondary)]">{note}</p> : null}

              {pre !== undefined ? (
                <p className="text-[11px] leading-snug text-[var(--text-muted)] mt-auto">
                  Pre-tournament gold odds:{' '}
                  <span className="text-[var(--text-secondary)] tabular-nums font-medium">{formatPct(pre)}</span>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
