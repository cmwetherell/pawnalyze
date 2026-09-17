'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import CopyLink from '@/components/ui/CopyLink';
import { SkeletonHistogram, SkeletonRounds } from '@/components/ui/Skeleton';
import Flag from '@/components/ui/Flag';
import { formatDelta, formatPct } from '@/components/ui/ProbBar';
import LikelyOpponents from './LikelyOpponents';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { StaleRunError, cachedJson } from '@/lib/olympiad/clientCache';
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
  onStale?: () => void;
}

const RANK_BUCKETS = 15;

function Tile({ label, value, sub, tone = 'text-[var(--text-primary)]', delta, children, title }: {
  label: string; value: string; sub?: string; tone?: string; delta?: { text: string; up: boolean } | null; children?: React.ReactNode; title?: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--bg-surface-2)] px-3 py-2 min-w-0" title={title}>
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-lg font-heading tabular-nums leading-tight ${tone}`}>{value}</span>
        {delta && (
          <span className={`text-[11px] font-semibold tabular-nums ${delta.up ? 'text-emerald-500' : 'text-rose-400'}`}>{delta.up ? '▲' : '▼'} {delta.text.replace(/^[+−]/, '')}</span>
        )}
      </div>
      {sub && <div className="text-[11px] text-[var(--text-muted)] truncate">{sub}</div>}
      {children}
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

/** Plain block on tablets and up; a native <details> accordion on phones. */
function Section({ title, right, defaultOpen, desktop, children }: {
  title: string; right?: React.ReactNode; defaultOpen?: boolean; desktop: boolean; children: React.ReactNode;
}) {
  const heading = (
    <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] flex items-baseline justify-between gap-2">
      <span>{title}</span>
      {right && <span className="normal-case tracking-normal">{right}</span>}
    </div>
  );
  if (desktop) return <div><div className="mb-2">{heading}</div>{children}</div>;
  return (
    <details className="group rounded-lg border border-[var(--border)]" open={defaultOpen}>
      <summary className="list-none cursor-pointer select-none px-3 min-h-[44px] flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <div className="flex-1">{heading}</div>
        <svg className="w-4 h-4 text-[var(--text-muted)] transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export default function TeamSpotlight({
  event, run, team, players, matches, teamsById, standing, participants, odds, baseline, isScenario, filtersKey, history,
  anyPlayed, onClose, onPrev, onNext, onStale,
}: TeamSpotlightProps) {
  const requestKey = `detail|${event}|${run.runId}|${team.teamId}|${filtersKey}`;
  const [result, setResult] = useState<{ key: string; data?: TeamDetailData; error?: string } | null>(null);
  const data = result?.key === requestKey ? result.data ?? null : null;
  const error = result?.key === requestKey ? result.error ?? null : null;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const desktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ event, run: String(run.runId), teamId: String(team.teamId) });
    if (filtersKey) params.set('filters', filtersKey);
    cachedJson<TeamDetailData>(requestKey, `/api/sims/olympiad-2026/team?${params.toString()}`)
      .then(d => { if (!cancelled) setResult({ key: requestKey, data: d }); })
      .catch(e => {
        if (cancelled) return;
        if (e instanceof StaleRunError) { onStale?.(); setResult({ key: requestKey, error: 'New simulations are available — reload the page.' }); return; }
        setResult({ key: requestKey, error: e.message });
      });
    return () => { cancelled = true; };
  }, [event, run.runId, team.teamId, filtersKey, requestKey, onStale]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  // Move focus to the heading when the spotlighted team changes (keyboard and screen-reader users land here).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [team.teamId]);

  const roundHistory = useMemo(() => teamRoundHistory(matches, team.teamId), [matches, team.teamId]);
  const played = roundHistory.filter(h => h.status === 'final');
  const nextMatch = roundHistory.find(h => h.status !== 'final') ?? null;
  // The round the simulations treat as "next" may already be played; feed its real result to the opponent odds.
  const playedNext = roundHistory.find(h => h.round === run.roundsCompleted + 1 && h.status === 'final') ?? null;
  const nextOpp = nextMatch?.opponentId != null ? teamsById.get(nextMatch.opponentId) ?? null : null;
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

  const expRank = odds?.expRank ?? null;
  const expRankShown = expRank ?? baseline?.expRank ?? null;
  const expRankIsBaseline = isScenario && expRank === null;
  const rosterAvg = players.length ? Math.round(players.slice(0, 4).reduce((a, p) => a + p.rating, 0) / Math.min(4, players.length)) : null;
  const ctrl = 'w-10 h-10 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)] disabled:opacity-30 flex items-center justify-center';

  return (
    <section
      className="surface-card overflow-hidden motion-safe:animate-fade-in-up"
      role="region"
      aria-labelledby="spotlight-heading"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-surface-2)]/60">
        <Flag code={team.fedCode} size="xl" title={team.name} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 id="spotlight-heading" ref={headingRef} tabIndex={-1} className="text-lg sm:text-xl font-heading text-[var(--text-primary)] truncate !outline-none">{team.name}</h3>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">Seed #{team.teamId} · avg {team.avgRating}</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] truncate">
            {team.captain ? `Captain ${team.captain}` : 'Captain TBA'}
            {anyPlayed && standing && (
              <> · <span className="text-[var(--text-secondary)]">{ordinal(standing.rank)} of {participants}</span> on {standing.mp} MP (unofficial)</>
            )}
            {isScenario && <span className="text-gold-ink"> · scenario odds</span>}
          </div>
          <div className="mt-1 text-xs text-[var(--text-secondary)] flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] shrink-0">Next</span>
            {nextMatch ? (
              <>
                <span className="shrink-0">R{nextMatch.round}</span>
                {nextOpp ? (
                  <>
                    <span className="text-[var(--text-muted)] shrink-0">vs</span>
                    <Flag code={nextOpp.fedCode} size="xs" aria-hidden />
                    <span className="font-medium text-[var(--text-primary)] truncate min-w-[5rem]">{nextOpp.name}</span>
                    <span className="text-[var(--text-muted)] shrink-0 hidden sm:inline">#{nextOpp.teamId} · {nextOpp.avgRating}</span>
                    {nextMatch.projected && <span className="text-gold-ink text-[11px] uppercase tracking-wider shrink-0">projected</span>}
                    {nextMatch.status === 'live' && <span className="text-red-400 text-[11px] shrink-0">· in play</span>}
                  </>
                ) : (
                  <span className="italic text-[var(--text-muted)]">bye</span>
                )}
              </>
            ) : (
              <span className="italic text-[var(--text-muted)]">pairings not published yet</span>
            )}
          </div>
        </div>
        {trend.length >= 2 && (
          <div className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--text-muted)]" title="Gold odds after each completed round">
            <span>Gold trend</span>
            <Sparkline points={trend} />
          </div>
        )}
        <div className="flex items-center gap-0.5 shrink-0">
          <CopyLink label="Copy link" className="hidden sm:inline-flex" />
          <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Previous team" className={ctrl}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next team" className={ctrl}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          <button type="button" onClick={onClose} aria-label="Close team details" className={ctrl}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 sm:px-6 pt-4">
        <Tile label="Gold" value={formatPct(odds?.pGold ?? 0)} tone="text-gold-ink" delta={delta(odds?.pGold, baseline?.pGold)} />
        <Tile label="Podium" value={formatPct(odds?.pMedal ?? 0)} delta={delta(odds?.pMedal, baseline?.pMedal)}
          title={`Gold ${formatPct(odds?.pGold ?? 0)} · Silver ${formatPct(odds?.pSilver ?? 0)} · Bronze ${formatPct(odds?.pBronze ?? 0)}`}>
          <div className="mt-1 h-1.5 rounded-full overflow-hidden flex bg-[var(--bg-surface-3)]" aria-hidden>
            <div className="h-full bg-medal-gold" style={{ width: `${(odds?.pGold ?? 0) * 100}%` }} />
            <div className="h-full bg-medal-silver" style={{ width: `${(odds?.pSilver ?? 0) * 100}%` }} />
            <div className="h-full bg-medal-bronze" style={{ width: `${(odds?.pBronze ?? 0) * 100}%` }} />
          </div>
          <div className="text-[11px] text-[var(--text-muted)] tabular-nums mt-0.5">
            <span className="text-medal-silver">S {formatPct(odds?.pSilver ?? 0)}</span> · <span className="text-medal-bronze">B {formatPct(odds?.pBronze ?? 0)}</span>
          </div>
        </Tile>
        <Tile label="Top 10" value={formatPct(odds?.pTop10 ?? 0)} delta={delta(odds?.pTop10, baseline?.pTop10)} />
        <Tile
          label={expRankIsBaseline ? 'Exp. finish (baseline)' : 'Exp. finish'}
          value={formatRank(expRankShown)}
          sub={`${formatMp(odds?.expMp ?? baseline?.expMp ?? null)} match pts`}
          tone={expRankIsBaseline ? 'text-[var(--text-muted)]' : undefined}
          title={expRankIsBaseline ? 'Expected finish is recomputed only for teams in your picks; this is the baseline value' : undefined}
        />
      </div>

      {/* Body */}
      <div className="grid gap-6 px-4 sm:px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
        {/* Roster */}
        <Section title="Roster" right={rosterAvg ? `top-4 avg ${rosterAvg}` : undefined} defaultOpen desktop={desktop}>
          {players.length ? (
            <table className="w-full text-xs table-fixed">
              <tbody>
                {players.map(p => (
                  <tr key={p.board} className="border-t border-[var(--border)]/60">
                    <td className="py-1.5 pr-2 text-[var(--text-muted)] tabular-nums w-5">{p.board}</td>
                    <td className="py-1.5 pr-2 w-8 text-gold-ink font-semibold">{p.title ?? ''}</td>
                    <td className="py-1.5 pr-2 text-[var(--text-primary)] truncate">{p.name}</td>
                    <td className="py-1.5 text-right tabular-nums text-[var(--text-secondary)] w-12">{p.rating || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">Roster pending.</p>
          )}
        </Section>

        {/* Results + opponents */}
        <Section title="Results & likely opponents" desktop={desktop}>
          <div className="space-y-5">
          <div>
            {desktop && <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Results</div>}
            {played.length ? (
              <ul className="space-y-1 text-xs">
                {played.map(h => {
                  const opp = h.opponentId !== null ? teamsById.get(h.opponentId) : null;
                  const tone = h.outcome === 'w' ? 'text-emerald-500' : h.outcome === 'l' ? 'text-rose-400' : 'text-gold-ink';
                  return (
                    <li key={h.round} className="flex items-center gap-2">
                      <span className="w-7 text-[var(--text-muted)] tabular-nums">R{h.round}</span>
                      {opp ? <Flag code={opp.fedCode} size="xs" aria-hidden /> : null}
                      <span className="flex-1 truncate text-[var(--text-secondary)]">
                        {opp ? opp.name : h.opponentId === null ? 'bye' : '—'}
                        {opp && <span className="text-[11px] text-[var(--text-muted)]"> #{opp.teamId}</span>}
                      </span>
                      <span className={`font-mono ${tone}`}>
                        {h.outcome === 'w' ? 'W' : h.outcome === 'l' ? 'L' : 'D'} {formatMatchScore(h.score, h.oppScore)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic">No matches played yet.</p>
            )}
          </div>
          <LikelyOpponents event={event} run={run} team={team} teamsById={teamsById} filtersKey={filtersKey} isScenario={isScenario} onStale={onStale} playedNextResult={playedNext?.outcome ?? null} />
          </div>
        </Section>

        {/* Finish distribution */}
        <Section title="Finish distribution" right={median !== null ? `median ${ordinal(median)}` : undefined} desktop={desktop}>
          {error ? (
            <p className="text-xs text-rose-400">{error}</p>
          ) : !data ? (
            <SkeletonHistogram />
          ) : total === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">No matching simulations.</p>
          ) : (
            <>
              <div className="flex items-end gap-[3px] h-28" role="img" aria-label={`Most likely finish ${median !== null ? ordinal(median) : 'unknown'}; ${formatPct((dist.find(d => d.rank === 1)?.n ?? 0) / total)} first, ${formatPct(bucketed[RANK_BUCKETS].n / total)} ${RANK_BUCKETS + 1}th or worse`}>
                {bucketed.map(b => {
                  const p = b.n / total;
                  return (
                    <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${b.label === `${RANK_BUCKETS + 1}+` ? `${RANK_BUCKETS + 1}th or worse` : ordinal(Number(b.label))}: ${formatPct(p)}`}>
                      {p >= 0.08 && <span className="text-[11px] text-[var(--text-muted)] tabular-nums mb-0.5">{Math.round(p * 100)}%</span>}
                      <div
                        className={`w-full rounded-t-sm ${b.label === '1' ? 'bg-medal-gold' : b.label === '2' ? 'bg-medal-silver' : b.label === '3' ? 'bg-medal-bronze' : 'bg-[var(--text-muted)]/45 group-hover:bg-[var(--text-muted)]/70'}`}
                        style={{ height: `${Math.max(2, (b.n / maxN) * 100)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-[3px] mt-1" aria-hidden>
                {bucketed.map((b, i) => (
                  <div key={b.label} className={`flex-1 text-center text-[11px] tabular-nums ${median !== null && String(median) === b.label ? 'text-gold-ink font-bold' : 'text-[var(--text-muted)]'} ${i % 2 === 1 && i < RANK_BUCKETS ? 'invisible sm:visible' : ''}`}>{b.label}</div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[var(--text-muted)]">Final position across {total.toLocaleString()} simulations{isScenario ? ' matching your scenario' : ''}.</p>
            </>
          )}
        </Section>

        {/* Remaining rounds */}
        <Section title="Remaining rounds · win / draw / loss" defaultOpen desktop={desktop}>
          {error ? (
            <p className="text-xs text-rose-400">{error}</p>
          ) : !data ? (
            <SkeletonRounds rows={Math.max(1, 11 - run.roundsCompleted)} />
          ) : data.roundOdds.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">Tournament complete.</p>
          ) : (
            <ul className="space-y-1.5">
              {data.roundOdds.map(o => {
                const n = Math.max(1, o.w + o.d + o.l);
                const entry = roundHistory.find(h => h.round === o.round && h.status !== 'final');
                const opp = entry?.opponentId != null ? teamsById.get(entry.opponentId) : null;
                return (
                  <li key={o.round} className="text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-[var(--text-muted)] tabular-nums">R{o.round}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden flex bg-[var(--bg-surface-3)]" role="img" aria-label={`Round ${o.round}: win ${Math.round((o.w / n) * 100)}%, draw ${Math.round((o.d / n) * 100)}%, loss ${Math.round((o.l / n) * 100)}%`}>
                        <div className="h-full bg-emerald-500" style={{ width: `${(o.w / n) * 100}%` }} />
                        <div className="h-full bg-chess-gold" style={{ width: `${(o.d / n) * 100}%` }} />
                        <div className="h-full bg-rose-400" style={{ width: `${(o.l / n) * 100}%` }} />
                      </div>
                      <span className="w-20 text-right tabular-nums text-[var(--text-muted)]">
                        {Math.round((o.w / n) * 100)} / {Math.round((o.d / n) * 100)} / {Math.round((o.l / n) * 100)}
                      </span>
                    </div>
                    {opp && (
                      <div className="pl-8 text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                        <Flag code={opp.fedCode} size="xs" aria-hidden /> vs {opp.name}{entry?.projected ? ' (projected)' : ''}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    </section>
  );
}
