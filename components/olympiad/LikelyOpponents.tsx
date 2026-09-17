'use client';

import { useEffect, useState } from 'react';

import Flag from '@/components/ui/Flag';
import { formatPct } from '@/components/ui/ProbBar';
import { StaleRunError, cachedJson } from '@/lib/olympiad/clientCache';
import type { OlympiadEvent, OpponentShare, Run, Team, TeamOpponents } from '@/lib/olympiad/types';

interface LikelyOpponentsProps {
  event: OlympiadEvent;
  run: Run;
  team: Team;
  teamsById: Map<number, Team>;
  filtersKey: string;
  isScenario: boolean;
  onStale?: () => void;
}

type Split = 'all' | 'w' | 'd' | 'l';

const SPLIT_LABEL: Record<Split, string> = { all: 'Any', w: 'Win', d: 'Draw', l: 'Loss' };
const TOP_N = 6;

function ShareList({ shares, total, teamsById }: { shares: OpponentShare[]; total: number; teamsById: Map<number, Team> }) {
  if (total === 0) return <p className="text-xs text-[var(--text-muted)] italic">No matching simulations.</p>;
  const top = shares.slice(0, TOP_N);
  const rest = shares.slice(TOP_N).reduce((a, s) => a + s.n, 0);
  const max = Math.max(top[0]?.n ?? 1, 1);
  return (
    <ul className="space-y-1">
      {top.map(s => {
        const opp = teamsById.get(s.teamId);
        const p = s.n / total;
        return (
          <li key={s.teamId} className="flex items-center gap-2 text-xs">
            {opp ? <Flag code={opp.fedCode} size="xs" title={opp.name} aria-hidden /> : <span className="w-[18px]" />}
            <span className="truncate text-[var(--text-secondary)] w-28 shrink-0">
              {opp ? opp.name : s.teamId === 0 ? 'Bye' : `Team ${s.teamId}`}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-surface-3)] overflow-hidden">
              <div className="h-full bg-chess-gold rounded-full" style={{ width: `${(s.n / max) * 100}%` }} />
            </div>
            <span className="tabular-nums w-12 text-right text-[var(--text-primary)]">{formatPct(p)}</span>
          </li>
        );
      })}
      {rest > 0 && (
        <li className="text-[11px] text-[var(--text-muted)] pl-6">
          {shares.length - TOP_N} other teams · {formatPct(rest / total)}
        </li>
      )}
    </ul>
  );
}

export default function LikelyOpponents({ event, run, team, teamsById, filtersKey, isScenario, onStale }: LikelyOpponentsProps) {
  const requestKey = `opp|${event}|${run.runId}|${team.teamId}|${filtersKey}`;
  const [result, setResult] = useState<{ key: string; data?: TeamOpponents; error?: string } | null>(null);
  const [split, setSplit] = useState<Split>('all');
  const data = result?.key === requestKey ? result.data ?? null : null;
  const error = result?.key === requestKey ? result.error ?? null : null;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ event, run: String(run.runId), teamId: String(team.teamId) });
    if (filtersKey) params.set('filters', filtersKey);
    cachedJson<TeamOpponents>(requestKey, `/api/sims/olympiad-2026/opponents?${params.toString()}`)
      .then(d => { if (!cancelled) setResult({ key: requestKey, data: d }); })
      .catch(e => {
        if (cancelled) return;
        if (e instanceof StaleRunError) { onStale?.(); setResult({ key: requestKey, error: 'New simulations are available — reload the page.' }); return; }
        setResult({ key: requestKey, error: e.message });
      });
    return () => { cancelled = true; };
  }, [event, run.runId, team.teamId, filtersKey, requestKey, onStale]);

  const heading = (
    <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
      Likely opponents{isScenario ? ' · scenario' : ''}
    </div>
  );

  if (error) return <div>{heading}<p className="text-xs text-rose-400">{error}</p></div>;
  if (!data) return <div>{heading}<div className="h-24 rounded bg-[var(--bg-surface-3)]/50 animate-pulse" /></div>;
  if (!data.available || data.nextRound === null) {
    return <div>{heading}<p className="text-xs text-[var(--text-muted)] italic">Pairing odds arrive with the next simulation upload.</p></div>;
  }

  const nextIsFixed = data.next.length === 1 && data.next[0].n === data.total;
  const splitTotal = split === 'all' ? data.total : data.outcomeCounts[split];

  return (
    <div>
      {heading}

      <div className="mb-3">
        <div className="text-[11px] text-[var(--text-muted)] mb-1">
          Round {data.nextRound}{nextIsFixed ? ' · pairing set' : ''}
        </div>
        {nextIsFixed ? (() => {
          const opp = teamsById.get(data.next[0].teamId);
          return opp ? (
            <div className="flex items-center gap-2 text-xs">
              <Flag code={opp.fedCode} size="sm" aria-hidden />
              <span className="font-medium text-[var(--text-primary)] truncate">{opp.name}</span>
              <span className="text-[var(--text-muted)]">#{opp.teamId} · {opp.avgRating}</span>
            </div>
          ) : <p className="text-xs text-[var(--text-muted)] italic">Bye</p>;
        })() : (
          <ShareList shares={data.next} total={data.total} teamsById={teamsById} />
        )}
      </div>

      {data.followingRound !== null && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="text-[11px] text-[var(--text-muted)]">
              Round {data.followingRound}
              {split !== 'all' && <span> · if {SPLIT_LABEL[split].toLowerCase()} in R{data.nextRound}</span>}
            </div>
            <div role="tablist" aria-label={`Condition on round ${data.nextRound} result`} className="inline-flex rounded-md bg-[var(--bg-surface-1)] border border-[var(--border)] p-0.5">
              {(['all', 'w', 'd', 'l'] as Split[]).map(k => {
                const count = k === 'all' ? data.total : data.outcomeCounts[k];
                const active = split === k;
                const tone = k === 'w' ? 'text-emerald-500' : k === 'd' ? 'text-gold-ink' : k === 'l' ? 'text-rose-400' : 'text-[var(--text-primary)]';
                return (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setSplit(k)}
                    disabled={count === 0}
                    title={`${SPLIT_LABEL[k]} in round ${data.nextRound} · ${formatPct(data.total ? count / data.total : 0)} of sims`}
                    className={`h-10 min-w-[2.5rem] px-2 rounded text-[11px] font-semibold transition-colors ${
                      active ? `bg-[var(--bg-surface-3)] ${tone}` : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    } disabled:opacity-40`}
                  >
                    {k === 'all' ? 'Any' : k.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
          <ShareList shares={data.following[split]} total={splitTotal} teamsById={teamsById} />
          {split !== 'all' && data.total > 0 && (
            <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
              {formatPct(splitTotal / data.total)} of simulations have {team.name} {split === 'w' ? 'winning' : split === 'd' ? 'drawing' : 'losing'} round {data.nextRound}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
