'use client';

import { useEffect, useMemo, useState } from 'react';

import Flag from '@/components/ui/Flag';
import { formatDelta, formatPct } from '@/components/ui/ProbBar';
import LikelyOpponents from './LikelyOpponents';
import { formatMp, formatRank, ordinal } from '@/lib/olympiad/odds';
import { formatMatchScore, teamRoundHistory } from '@/lib/olympiad/standings';
import type {
  DerivedStanding, HistoryPoint, Match, OlympiadEvent, Player, Run, Team, TeamDetail as TeamDetailData, TeamOdds,
} from '@/lib/olympiad/types';

interface TeamSpotlightProps {
  event: OlympiadEvent;
  run: Run;
  team: Team;
  players: Player[];
  matches: Match[];
  teamsById: Map<number, Team>;
  standing?: DerivedStanding;
  participants: number;
  odds: TeamOdds | null;
  baseline: TeamOdds | null;
  isScenario: boolean;
  filtersKey: string;
  history: HistoryPoint[];
  anyPlayed: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const RANK_BUCKETS = 15;

function Tile({ label, value, sub, tone = 'text-[var(--text-primary)]', delta }: {
  label: string; value: string; sub?: string; tone?: string; delta?: { text: string; up: boolean } | null;
}) {
  return (
    <div className="rounded-lg bg-[var(--bg-surface-2)] px-3 py-2 min-w-0">
      <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-lg font-heading tabular-nums leading-tight ${tone}`}>{value}</span>
        {delta && (
          <span className={`text-[10px] font-semibold tabular-nums ${delta.up ? 'text-emerald-500' : 'text-rose-400'}`}>{delta.text}</span>
        )}
      </div>
      {sub && <div className="text-[10px] text-[var(--text-muted)] truncate">{sub}</div>}
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 120, h = 32, pad = 2;
  const max = Math.max(...points, 0.01);
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - pad * 2));
  const ys = points.map(p => h - pad - (p / max) * (h - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      <path d={d} fill="none" stroke="#C9A84C" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2.5} fill="#C9A84C" />
    </svg>
  );
}

export default function TeamSpotlight({
  event, run, team, players, matches, teamsById, standing, participants, odds, baseline, isScenario, filtersKey, history,
  anyPlayed, onClose, onPrev, onNext,
}: TeamSpotlightProps) {
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  const roundHistory = useMemo(() => teamRoundHistory(matches, team.teamId), [matches, team.teamId]);
  const trend = useMemo(
    () => history.filter(h => h.teamId === team.teamId).sort((a, b) => a.roundsCompleted - b.roundsCompleted).map(h => h.pGold),
    [history, team.teamId],
  );

  const total = data?.total ?? 0;
  const dist = data?.rankDist ?? [];
  const bucketed = Array.from({ length: RANK_BUCKETS }, (_, i) => ({ label: String(i + 1), n: dist.find(d => d.rank === i + 1)?.n ?? 0 }));
  bucketed.push({ label: `${RANK_BUCKETS + 1}+`, n: dist.filter(d => d.rank > RANK_BUCKETS).reduce((a, d) => a + d.n, 0) });
  const maxN = Math.max(1, ...bucketed.map(b => b.n));
  let median: number | null = null;
  if (total > 0) {
    let acc = 0;
    for (const d of [...dist].sort((a, b) => a.rank - b.rank)) { acc += d.n; if (acc >= total / 2) { median = d.rank; break; } }
  }

  const delta = (cur: number | null | undefined, base: number | null | undefined) => {
    if (!isScenario || cur == null || base == null) return null;
    const text = formatDelta(cur, base);
    return text ? { text, up: cur > base } : null;
  };

  const rosterAvg = players.length ? Math.round(players.slice(0, 4).reduce((a, p) => a + p.rating, 0) / Math.min(4, players.length)) : null;

  return (
    <section
      className="surface-card overflow-hidden animate-fade-in-up"
      aria-label={`${team.name} details`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-surface-2)]/60">
        <Flag code={team.fedCode} size="xl" title={team.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-heading text-[var(--text-primary)] truncate">{team.name}</h3>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">Seed #{team.teamId} · avg {team.avgRating}</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] truncate">
            {team.captain ? `Captain ${team.captain}` : 'Captain TBA'}
            {anyPlayed && standing && (
              <> · <span className="text-[var(--text-secondary)]">{ordinal(standing.rank)} of {participants}</span> on {standing.mp} MP (unofficial)</>
            )}
            {isScenario && <span className="text-chess-gold"> · scenario odds</span>}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
          {trend.length >= 2 && (
            <div className="flex items-center gap-1.5" title="Gold odds after each completed round">
              <span className="uppercase tracking-wider">Gold trend</span>
              <Sparkline points={trend} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Previous team" className="w-8 h-8 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)] disabled:opacity-30">
            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next team" className="w-8 h-8 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)] disabled:opacity-30">
            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)]">
            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-4 sm:px-6 pt-4">
        <Tile label="Gold" value={formatPct(odds?.pGold ?? 0)} tone="text-chess-gold" delta={delta(odds?.pGold, baseline?.pGold)} />
        <Tile label="Silver" value={formatPct(odds?.pSilver ?? 0)} tone="text-medal-silver" delta={delta(odds?.pSilver, baseline?.pSilver)} />
        <Tile label="Bronze" value={formatPct(odds?.pBronze ?? 0)} tone="text-medal-bronze" delta={delta(odds?.pBronze, baseline?.pBronze)} />
        <Tile label="Any medal" value={formatPct(odds?.pMedal ?? 0)} delta={delta(odds?.pMedal, baseline?.pMedal)} />
        <Tile label="Top 10" value={formatPct(odds?.pTop10 ?? 0)} delta={delta(odds?.pTop10, baseline?.pTop10)} />
        <Tile
          label="Exp. finish"
          value={formatRank(odds?.expRank ?? baseline?.expRank ?? null)}
          sub={`${formatMp(odds?.expMp ?? baseline?.expMp ?? null)} match pts`}
        />
      </div>

      {/* Body */}
      <div className="grid gap-6 px-4 sm:px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
        {/* Roster */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-baseline justify-between">
            <span>Roster</span>
            {rosterAvg && <span className="normal-case tracking-normal">top-4 avg {rosterAvg}</span>}
          </div>
          {players.length ? (
            <table className="w-full text-xs table-fixed">
              <tbody>
                {players.map(p => (
                  <tr key={p.board} className="border-t border-[var(--border)]/60">
                    <td className="py-1.5 pr-2 text-[var(--text-muted)] tabular-nums w-5">{p.board}</td>
                    <td className="py-1.5 pr-2 w-8 text-chess-gold font-semibold">{p.title ?? ''}</td>
                    <td className="py-1.5 pr-2 text-[var(--text-primary)] truncate">{p.name}</td>
                    <td className="py-1.5 text-right tabular-nums text-[var(--text-secondary)] w-12">{p.rating || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">Roster pending.</p>
          )}
        </div>

        {/* Results + opponents */}
        <div className="space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Results</div>
            {roundHistory.length ? (
              <ul className="space-y-1 text-xs">
                {roundHistory.map(h => {
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
                        {h.projected ? 'proj.' : h.status === 'scheduled' ? 'sched.' : h.status === 'live' ? 'live' : formatMatchScore(h.score, h.oppScore)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic">No pairings yet.</p>
            )}
          </div>
          <LikelyOpponents event={event} run={run} team={team} teamsById={teamsById} filtersKey={filtersKey} isScenario={isScenario} />
        </div>

        {/* Finish distribution */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-baseline justify-between">
            <span>Finish distribution</span>
            {median !== null && <span className="normal-case tracking-normal">median {ordinal(median)}</span>}
          </div>
          {error ? (
            <p className="text-xs text-rose-400">{error}</p>
          ) : !data ? (
            <div className="h-28 rounded bg-[var(--bg-surface-3)]/50 animate-pulse" />
          ) : total === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">No matching simulations.</p>
          ) : (
            <>
              <div className="flex items-end gap-[3px] h-28">
                {bucketed.map(b => {
                  const p = b.n / total;
                  return (
                    <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${b.label === `${RANK_BUCKETS + 1}+` ? `${RANK_BUCKETS + 1}th or worse` : ordinal(Number(b.label))}: ${formatPct(p)}`}>
                      {p >= 0.08 && <span className="text-[8px] text-[var(--text-muted)] tabular-nums mb-0.5">{Math.round(p * 100)}%</span>}
                      <div
                        className={`w-full rounded-t-sm ${b.label === '1' ? 'bg-medal-gold' : b.label === '2' ? 'bg-medal-silver' : b.label === '3' ? 'bg-medal-bronze' : 'bg-[var(--text-muted)]/45 group-hover:bg-[var(--text-muted)]/70'}`}
                        style={{ height: `${Math.max(2, (b.n / maxN) * 100)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-[3px] mt-1">
                {bucketed.map(b => (
                  <div key={b.label} className={`flex-1 text-center text-[8px] tabular-nums ${median !== null && String(median) === b.label ? 'text-chess-gold font-bold' : 'text-[var(--text-muted)]'}`}>{b.label}</div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-[var(--text-muted)]">Final position across {total.toLocaleString()} simulations{isScenario ? ' matching your scenario' : ''}.</p>
            </>
          )}
        </div>

        {/* Remaining rounds */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Remaining rounds · win / draw / loss</div>
          {!data ? (
            <div className="h-28 rounded bg-[var(--bg-surface-3)]/50 animate-pulse" />
          ) : data.roundOdds.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">Tournament complete.</p>
          ) : (
            <ul className="space-y-1.5">
              {data.roundOdds.map(o => {
                const n = Math.max(1, o.w + o.d + o.l);
                const projected = roundHistory.find(h => h.round === o.round && h.projected);
                const known = roundHistory.find(h => h.round === o.round && !h.projected && h.status !== 'final');
                const opp = (known ?? projected)?.opponentId != null ? teamsById.get((known ?? projected)!.opponentId as number) : null;
                return (
                  <li key={o.round} className="text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-[var(--text-muted)] tabular-nums">R{o.round}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden flex bg-[var(--bg-surface-3)]">
                        <div className="h-full bg-emerald-500" style={{ width: `${(o.w / n) * 100}%` }} />
                        <div className="h-full bg-chess-gold" style={{ width: `${(o.d / n) * 100}%` }} />
                        <div className="h-full bg-rose-400" style={{ width: `${(o.l / n) * 100}%` }} />
                      </div>
                      <span className="w-20 text-right tabular-nums text-[var(--text-muted)]">
                        {Math.round((o.w / n) * 100)} / {Math.round((o.d / n) * 100)} / {Math.round((o.l / n) * 100)}
                      </span>
                    </div>
                    {opp && (
                      <div className="pl-8 text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                        <Flag code={opp.fedCode} size="xs" /> vs {opp.name}{projected && !known ? ' (projected)' : ''}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
