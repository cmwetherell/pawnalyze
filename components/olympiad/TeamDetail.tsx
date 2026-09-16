'use client';

import { useEffect, useState } from 'react';

import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import { formatMp, ordinal } from '@/lib/olympiad/odds';
import { formatMatchScore, teamRoundHistory } from '@/lib/olympiad/standings';
import type { Match, OlympiadEvent, Player, Run, Team, TeamDetail as TeamDetailData, TeamOdds } from '@/lib/olympiad/types';

interface TeamDetailProps {
  event: OlympiadEvent;
  run: Run;
  team: Team;
  players: Player[];
  matches: Match[];
  teamsById: Map<number, Team>;
  filtersKey: string;
  odds: TeamOdds | null;
  baseline: TeamOdds | null;
  isScenario: boolean;
  expMp: number | null;
}

const RANK_BUCKETS = 15;

export default function TeamDetail({
  event, run, team, players, matches, teamsById, filtersKey, odds, baseline, isScenario, expMp,
}: TeamDetailProps) {
  const requestKey = `${event}|${run.runId}|${team.teamId}|${filtersKey}`;
  const [result, setResult] = useState<{ key: string; data?: TeamDetailData; error?: string } | null>(null);
  const data = result?.key === requestKey ? result.data ?? null : null;
  const error = result?.key === requestKey ? result.error ?? null : null;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ event, run: String(run.runId), teamId: String(team.teamId) });
    if (filtersKey) params.set('filters', filtersKey);
    fetch(`/api/sims/olympiad-2026/team?${params.toString()}`)
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error ?? `HTTP ${r.status}`);
        return r.json() as Promise<TeamDetailData>;
      })
      .then(d => { if (!cancelled) setResult({ key: requestKey, data: d }); })
      .catch(e => { if (!cancelled) setResult({ key: requestKey, error: e.message }); });
    return () => { cancelled = true; };
  }, [event, run.runId, team.teamId, filtersKey, requestKey]);

  const history = teamRoundHistory(matches, team.teamId);
  const total = data?.total ?? 0;
  const dist = data?.rankDist ?? [];
  const bucketed = Array.from({ length: RANK_BUCKETS }, (_, i) => {
    const rank = i + 1;
    return { label: String(rank), n: dist.find(d => d.rank === rank)?.n ?? 0 };
  });
  const rest = dist.filter(d => d.rank > RANK_BUCKETS).reduce((a, d) => a + d.n, 0);
  bucketed.push({ label: `${RANK_BUCKETS + 1}+`, n: rest });
  const maxN = Math.max(1, ...bucketed.map(b => b.n));

  return (
    <div className="px-4 sm:px-6 py-4 grid gap-6 md:grid-cols-3 text-sm">
      {/* Roster */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Flag code={team.fedCode} size="md" />
          <div>
            <div className="font-semibold text-[var(--text-primary)]">{team.name}</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Seed #{team.teamId} · avg {team.avgRating}{team.captain ? ` · Capt. ${team.captain}` : ''}
            </div>
          </div>
        </div>
        {odds && (
          <div className="grid grid-cols-4 gap-1 mb-3 text-center">
            {([['Gold', odds.pGold, 'text-chess-gold'], ['Silver', odds.pSilver, 'text-medal-silver'], ['Bronze', odds.pBronze, 'text-medal-bronze'], ['Top 10', odds.pTop10, 'text-[var(--text-secondary)]']] as [string, number, string][]).map(([label, v, cls]) => (
              <div key={label} className="rounded-md bg-[var(--bg-surface-1)] py-1.5">
                <div className={`text-sm font-semibold tabular-nums ${cls}`}>{formatPct(v)}</div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
              </div>
            ))}
          </div>
        )}
        {players.length ? (
          <table className="w-full text-xs">
            <tbody>
              {players.map(p => (
                <tr key={p.board} className="border-t border-[var(--border)]/60">
                  <td className="py-1 pr-2 text-[var(--text-muted)] tabular-nums w-5">{p.board}</td>
                  <td className="py-1 pr-2 w-7 text-chess-gold font-semibold">{p.title ?? ''}</td>
                  <td className="py-1 pr-2 text-[var(--text-primary)] truncate max-w-[160px]">{p.name}</td>
                  <td className="py-1 text-right tabular-nums text-[var(--text-secondary)]">{p.rating || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic">Roster pending.</p>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Results</div>
        {history.length ? (
          <ul className="space-y-1 text-xs">
            {history.map(h => {
              const opp = h.opponentId !== null ? teamsById.get(h.opponentId) : null;
              const tone = h.status !== 'final' ? 'text-[var(--text-muted)]'
                : h.outcome === 'w' ? 'text-emerald-500' : h.outcome === 'l' ? 'text-rose-400' : 'text-chess-gold';
              return (
                <li key={h.round} className="flex items-center gap-2">
                  <span className="w-7 text-[var(--text-muted)] tabular-nums">R{h.round}</span>
                  {opp ? <Flag code={opp.fedCode} size="xs" /> : null}
                  <span className="flex-1 truncate text-[var(--text-secondary)]">
                    {opp ? opp.name : h.opponentId === null ? 'bye' : '—'}
                    {opp && <span className="text-[10px] text-[var(--text-muted)]"> #{opp.teamId}</span>}
                  </span>
                  <span className={`font-mono ${tone}`}>
                    {h.status === 'scheduled' ? 'sched.' : h.status === 'live' ? 'live' : formatMatchScore(h.score, h.oppScore)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic">No pairings yet.</p>
        )}
        {expMp !== null && (
          <p className="mt-3 text-[11px] text-[var(--text-muted)]">
            Expected final match points: <span className="text-[var(--text-secondary)] font-semibold tabular-nums">{formatMp(expMp)}</span>
            {isScenario && baseline?.expMp != null && odds?.expMp != null && (
              <span className="ml-1">(baseline {formatMp(baseline.expMp)})</span>
            )}
          </p>
        )}
      </div>

      {/* Finish distribution + round odds */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
          Finish distribution{isScenario ? ' · scenario' : ''}
        </div>
        {error ? (
          <p className="text-xs text-rose-400">{error}</p>
        ) : !data ? (
          <div className="h-24 rounded bg-[var(--bg-surface-3)]/50 animate-pulse" />
        ) : total === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">No matching simulations.</p>
        ) : (
          <>
            <div className="flex items-end gap-[3px] h-20">
              {bucketed.map(b => (
                <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full" title={`${b.label === `${RANK_BUCKETS + 1}+` ? `${RANK_BUCKETS + 1}th or worse` : ordinal(Number(b.label))}: ${formatPct(b.n / total)}`}>
                  <div
                    className={`w-full rounded-t-sm ${b.label === '1' ? 'bg-medal-gold' : b.label === '2' ? 'bg-medal-silver' : b.label === '3' ? 'bg-medal-bronze' : 'bg-[var(--text-muted)]/50'}`}
                    style={{ height: `${Math.max(2, (b.n / maxN) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-[3px] mt-1">
              {bucketed.map(b => (
                <div key={b.label} className="flex-1 text-center text-[8px] text-[var(--text-muted)] tabular-nums">{b.label}</div>
              ))}
            </div>
            {data.roundOdds.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Remaining rounds · W / D / L</div>
                <ul className="space-y-1">
                  {data.roundOdds.map(o => {
                    const n = Math.max(1, o.w + o.d + o.l);
                    return (
                      <li key={o.round} className="flex items-center gap-2 text-[10px]">
                        <span className="w-6 text-[var(--text-muted)] tabular-nums">R{o.round}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden flex bg-[var(--bg-surface-3)]">
                          <div className="h-full bg-emerald-500" style={{ width: `${(o.w / n) * 100}%` }} />
                          <div className="h-full bg-chess-gold" style={{ width: `${(o.d / n) * 100}%` }} />
                          <div className="h-full bg-rose-400" style={{ width: `${(o.l / n) * 100}%` }} />
                        </div>
                        <span className="w-24 text-right tabular-nums text-[var(--text-muted)]">
                          {Math.round((o.w / n) * 100)} / {Math.round((o.d / n) * 100)} / {Math.round((o.l / n) * 100)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
