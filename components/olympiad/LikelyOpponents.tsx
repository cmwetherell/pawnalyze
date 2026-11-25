'use client';

import { useEffect, useState } from 'react';

import { BarRows } from '@/components/charts/BarRows';
import { Flag } from '@/components/ui/Flag';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPct } from '@/lib/format';
import { StaleRunError, cachedJson } from '@/lib/olympiad/clientCache';
import type { OlympiadEvent, OpponentShare, Outcome, Run, Team, TeamOpponents } from '@/lib/olympiad/types';
import { shortTeamName } from './teams';

interface LikelyOpponentsProps {
  event: OlympiadEvent;
  run: Run;
  team: Team;
  teamsById: Map<number, Team>;
  filtersKey: string;
  onStale?: () => void;
  /** The team's actual result in the next simulated round, when that round has already been played. */
  playedNextResult?: Outcome | null;
}

type Split = 'all' | 'w' | 'd' | 'l';

const SPLIT_LABEL: Record<Split, string> = { all: 'Any', w: 'Win', d: 'Draw', l: 'Loss' };
const TOP_N = 6;

function ShareList({ shares, total, teamsById, label }: { shares: OpponentShare[]; total: number; teamsById: Map<number, Team>; label: string }) {
  if (total === 0) return <p className="type-small text-ink-3">No matching simulations.</p>;
  const rest = shares.slice(TOP_N).reduce((a, s) => a + s.n, 0);
  return (
    <>
      <BarRows
        size="sm" format="pct" ariaLabel={label}
        rows={shares.slice(0, TOP_N).map(s => {
          const opp = teamsById.get(s.teamId);
          return { key: String(s.teamId), label: opp ? shortTeamName(opp.name) : s.teamId === 0 ? 'Bye' : `Team ${s.teamId}`, value: s.n / total, tone: 'ink' as const, lead: opp && <Flag code={opp.fedCode} size="xs" decorative /> };
        })}
      />
      {rest > 0 && <p className="mt-2 type-label text-ink-3">{shares.length - TOP_N} other teams, {formatPct(rest / total)}</p>}
    </>
  );
}

/** Who the team is likely to meet next, and after that for each result. */
export function LikelyOpponents({ event, run, team, teamsById, filtersKey, onStale, playedNextResult = null }: LikelyOpponentsProps) {
  const requestKey = `opp|${event}|${run.runId}|${team.teamId}|${filtersKey}`;
  const [result, setResult] = useState<{ key: string; data?: TeamOpponents; error?: string } | null>(null);
  const [split, setSplit] = useState<Split>(playedNextResult ?? 'all');
  const data = result?.key === requestKey ? result.data ?? null : null;
  const error = result?.key === requestKey ? result.error ?? null : null;

  useEffect(() => {
    let canceled = false;
    const params = new URLSearchParams({ event, run: String(run.runId), teamId: String(team.teamId) });
    if (filtersKey) params.set('filters', filtersKey);
    cachedJson<TeamOpponents>(requestKey, `/api/sims/olympiad-2026/opponents?${params.toString()}`)
      .then(d => { if (!canceled) setResult({ key: requestKey, data: d }); })
      .catch(e => {
        if (canceled) return;
        if (e instanceof StaleRunError) { onStale?.(); setResult({ key: requestKey, error: 'New simulations are available: reload the page.' }); return; }
        setResult({ key: requestKey, error: e.message });
      });
    return () => { canceled = true; };
  }, [event, run.runId, team.teamId, filtersKey, requestKey, onStale]);

  if (error) return <p role="alert" className="type-small text-negative">{error}</p>;
  if (!data) return <Skeleton kind="bars" rows={6} label="Loading likely opponents" />;
  if (!data.available || data.nextRound === null) return <p className="type-small text-ink-3">Pairing odds arrive with the next simulation upload.</p>;

  const next = data.nextRound;
  const fixed = data.next.length === 1 && data.next[0].n === data.total;
  const fixedOpp = fixed ? teamsById.get(data.next[0].teamId) : undefined;
  const splitTotal = split === 'all' ? data.total : data.outcomeCounts[split];

  return (
    <div className="flex flex-col gap-6">
      {playedNextResult === null && (
        <div className="flex flex-col gap-2">
          <p className="type-label text-ink-2">Round {next}{fixed ? ', pairing set' : ''}</p>
          {!fixed ? <ShareList shares={data.next} total={data.total} teamsById={teamsById} label={`Likely opponents in round ${next}`} />
            : fixedOpp ? (
              <p className="flex min-w-0 items-center gap-2 type-ui text-ink">
                <Flag code={fixedOpp.fedCode} size="sm" decorative />
                <span className="truncate">{fixedOpp.name}</span>
                <span className="shrink-0 type-label text-ink-3">#{fixedOpp.teamId}, {fixedOpp.avgRating}</span>
              </p>
            ) : <p className="type-small text-ink-3">Bye</p>}
        </div>
      )}
      {data.followingRound !== null && (
        <div className="flex flex-col gap-2">
          <p className="type-label text-ink-2">
            Round {data.followingRound}
            {split !== 'all' && `, ${playedNextResult === split ? 'after the actual' : 'if a'} ${SPLIT_LABEL[split].toLowerCase()} in round ${next}`}
          </p>
          <Segmented
            role="tablist" size="sm" ariaLabel={`Condition on round ${next} result`} value={split} onChange={setSplit}
            items={(['all', 'w', 'd', 'l'] as Split[]).map(k => {
              const count = k === 'all' ? data.total : data.outcomeCounts[k];
              return { value: k, label: SPLIT_LABEL[k], disabled: count === 0, hint: `${SPLIT_LABEL[k]} in round ${next}, ${formatPct(data.total ? count / data.total : 0)} of simulations` };
            })}
          />
          <ShareList shares={data.following[split]} total={splitTotal} teamsById={teamsById} label={`Likely opponents in round ${data.followingRound}`} />
          {split !== 'all' && data.total > 0 && (
            <p className="type-label text-ink-3">
              {formatPct(splitTotal / data.total)} of simulations have {team.name} {split === 'w' ? 'winning' : split === 'd' ? 'drawing' : 'losing'} round {next}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
