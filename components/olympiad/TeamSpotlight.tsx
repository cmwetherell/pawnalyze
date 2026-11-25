'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ColumnChart } from '@/components/charts/ColumnChart';
import { LineChart } from '@/components/charts/LineChart';
import { Sparkline } from '@/components/charts/Sparkline';
import { CopyButton } from '@/components/ui/CopyButton';
import { Delta } from '@/components/ui/Delta';
import { Disclosure } from '@/components/ui/Disclosure';
import { Flag } from '@/components/ui/Flag';
import { Heading } from '@/components/ui/Heading';
import { IconButton } from '@/components/ui/IconButton';
import { LiveDot } from '@/components/ui/LiveDot';
import { Panel } from '@/components/ui/Panel';
import { Pips } from '@/components/ui/Pips';
import { Row, Rows } from '@/components/ui/Rows';
import { Skeleton } from '@/components/ui/Skeleton';
import { SplitBar } from '@/components/ui/SplitBar';
import { StatStrip } from '@/components/ui/StatStrip';
import { Legend } from '@/components/ui/Swatch';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { Tag } from '@/components/ui/Tag';
import { TextLink } from '@/components/ui/TextLink';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatPct } from '@/lib/format';
import { StaleRunError, cachedJson } from '@/lib/olympiad/clientCache';
import { N_ROUNDS, boardsHref, playerHref } from '@/lib/olympiad/config';
import { formatMp, formatRank, ordinal } from '@/lib/olympiad/odds';
import { formatMatchScore, teamRoundHistory, type TeamRoundEntry } from '@/lib/olympiad/standings';
import { formatScore } from '@/lib/olympiad/tpr';
import { cn } from '@/lib/utils';
import type {
  DerivedStanding, HistoryPoint, Match, OlympiadEvent, Outcome, Player, Run, Team, TeamDetail, TeamOdds,
} from '@/lib/olympiad/types';
import { medalSegments } from './GoldRace';
import { LikelyOpponents } from './LikelyOpponents';
import { wdlSegments } from './matchSides';
import { shortTeamName, toProbs } from './teams';

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
  /** Event is over: no next match, no likely opponents, no remaining rounds. */
  finished: boolean;
  /** Round after which the odds were computed. */
  oddsRound: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onStale?: () => void;
}

const RANK_BUCKETS = 15;
/** Under 360px the roster leaves the points out, and the performance is its last column. */
const WIDE = 'max-[359.98px]:hidden';
const LAST_NARROW = 'max-[359.98px]:!pr-0';
const WDL: Record<Outcome, { letter: string; word: string; tone: 'win' | 'draw' | 'loss' }> = {
  w: { letter: 'W', word: 'win', tone: 'win' },
  d: { letter: 'D', word: 'draw', tone: 'draw' },
  l: { letter: 'L', word: 'loss', tone: 'loss' },
};

/** A column from 768, a disclosure on phones. */
function Block({ title, note, defaultOpen, wide, className, children }: { title: string; note?: ReactNode; defaultOpen?: boolean; wide: boolean; className?: string; children: ReactNode }) {
  if (!wide) return <Disclosure variant="row" summary={title} meta={note} open={defaultOpen}>{children}</Disclosure>;
  return (
    <div className={cn('min-w-0', className)}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <Heading level={4} style="h3">{title}</Heading>
        {note && <span className="type-label text-ink-3">{note}</span>}
      </div>
      {children}
    </div>
  );
}

const Quiet = ({ children }: { children: ReactNode }) => <p className="type-small text-ink-3">{children}</p>;

function isTypingTarget(el: EventTarget | null): boolean {
  return el instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable);
}

export function TeamSpotlight({
  event, run, team, players, matches, teamsById, standing, participants, odds, baseline, isScenario, filtersKey, history,
  anyPlayed, finished, oddsRound, onClose, onPrev, onNext, onStale,
}: TeamSpotlightProps) {
  const requestKey = `detail|${event}|${run.runId}|${team.teamId}|${filtersKey}`;
  const [result, setResult] = useState<{ key: string; data?: TeamDetail; error?: string } | null>(null);
  const data = result?.key === requestKey ? result.data ?? null : null;
  const error = result?.key === requestKey ? result.error ?? null : null;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wide = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (finished) return;   // the last run knows the result: nothing is left to distribute
    let canceled = false;
    const params = new URLSearchParams({ event, run: String(run.runId), teamId: String(team.teamId) });
    if (filtersKey) params.set('filters', filtersKey);
    cachedJson<TeamDetail>(requestKey, `/api/sims/olympiad-2026/team?${params.toString()}`)
      .then(d => { if (!canceled) setResult({ key: requestKey, data: d }); })
      .catch(e => {
        if (canceled) return;
        if (e instanceof StaleRunError) { onStale?.(); setResult({ key: requestKey, error: 'New simulations are available: reload the page.' }); return; }
        setResult({ key: requestKey, error: e.message });
      });
    return () => { canceled = true; };
  }, [event, run.runId, team.teamId, filtersKey, requestKey, onStale, finished]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A tab list, chart or open sheet that used the key has already said so.
      if (e.defaultPrevented || isTypingTarget(e.target)) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  // Keyboard and screen-reader users land on the name when the team changes.
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [team.teamId]);

  const roundHistory = useMemo(() => teamRoundHistory(matches, team.teamId), [matches, team.teamId]);
  const played = roundHistory.filter(h => h.status === 'final');
  const nextMatch = roundHistory.find(h => h.status !== 'final') ?? null;
  // The round the simulations treat as "next" may already be played; feed its real result to the opponent odds.
  const playedNext = roundHistory.find(h => h.round === run.roundsCompleted + 1 && h.status === 'final') ?? null;
  const nextOpp = nextMatch?.opponentId != null ? teamsById.get(nextMatch.opponentId) ?? null : null;
  const points = useMemo(
    () => history.filter(h => h.teamId === team.teamId).sort((a, b) => a.roundsCompleted - b.roundsCompleted),
    [history, team.teamId],
  );
  const trend = points.map(h => h.pGold);
  // A team that never had a real chance of a medal has no path to draw.
  const charted = finished && points.length >= 2 && points.some(h => h.pMedal >= 0.01);

  const delta = (cur: number | null | undefined, base: number | null | undefined) =>
    (isScenario && cur != null && base != null ? <Delta value={cur} base={base} short /> : undefined);
  const exp = odds?.expRank ?? null;
  const expIsBaseline = isScenario && exp === null;
  const asOf = finished ? `After round ${oddsRound}` : undefined;
  const anyRace = players.some(p => p.race && p.race.games > 0);
  const top4 = players.slice(0, 4);
  const rosterAvg = top4.length ? Math.round(top4.reduce((a, p) => a + p.rating, 0) / top4.length) : null;
  const medals = medalSegments(odds ?? { pGold: 0, pSilver: 0, pBronze: 0 });

  const roster = (
    <Block title="Roster" note={rosterAvg ? `top four average ${rosterAvg}` : undefined} defaultOpen wide={wide} className={finished ? undefined : 'md:col-span-2 lg:col-span-1'}>
      <Roster event={event} team={team} players={players} anyRace={anyRace} />
    </Block>
  );

  return (
    <Panel as="section" aria-labelledby="spotlight-heading">
      <Panel.Head>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 flex-1 basis-72 items-start gap-4">
            <Flag code={team.fedCode} size="xl" title={team.name} decorative />
            <div className="min-w-0 flex-1">
              <Heading level={3} style="h3" id="spotlight-heading" ref={headingRef} tabIndex={-1}>{team.name}</Heading>
              <p className="type-small text-ink-2">
                Seed #{team.teamId}, average {team.avgRating}. {team.captain ? `Captain ${team.captain}` : 'Captain to be announced'}.
                {anyPlayed && standing && <> <strong className="text-ink">{ordinal(standing.rank)} of {participants}</strong> on {standing.mp} match points{standing.official ? '' : ' (unofficial)'}.</>}
              </p>
              {!(finished && !nextMatch) && (
                <div className="mt-1 flex flex-wrap items-center gap-2 type-small text-ink-2">
                  {nextMatch ? (
                    <>
                      <span>Next, round {nextMatch.round}:</span>
                      {nextOpp ? (
                        <>
                          <Flag code={nextOpp.fedCode} size="xs" decorative />
                          <span className="font-medium text-ink">{shortTeamName(nextOpp.name)}</span>
                          <span className="text-ink-3">#{nextOpp.teamId}, {nextOpp.avgRating}</span>
                          {nextMatch.projected && <Tag>Projected</Tag>}
                          {nextMatch.status === 'live' && <LiveDot label="in play" />}
                        </>
                      ) : <span>bye</span>}
                    </>
                  ) : <span>Next: pairings not published yet</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 lg:w-auto">
            {isScenario && <Tag>Scenario odds</Tag>}
            {trend.length >= 2 && !finished && (
              <div className="hidden items-center gap-3 md:flex" title="Gold odds after each completed round">
                <span className="type-label text-ink-2">Gold trend</span>
                <Sparkline values={trend} label={`Gold odds by round, from ${formatPct(trend[0])} to ${formatPct(trend[trend.length - 1])}`} />
              </div>
            )}
            <div className="-mx-3 flex flex-1 items-center lg:ml-0">
              <CopyButton kind="link" variant="icon" label="Copy link" />
              <IconButton icon="chevron-left" label="Previous team" onClick={onPrev} disabled={!onPrev} />
              <IconButton icon="chevron-right" label="Next team" onClick={onNext} disabled={!onNext} />
              <IconButton icon="close" label="Close team details" onClick={onClose} className="ml-auto lg:ml-0" />
            </div>
          </div>
        </div>
      </Panel.Head>

      <Panel.Body className="flex flex-col gap-8">
        <StatStrip
          columns={4}
          items={[
            { key: 'gold', label: 'Gold', value: formatPct(odds?.pGold ?? 0), delta: delta(odds?.pGold, baseline?.pGold), sub: asOf },
            {
              key: 'podium', label: 'Podium', value: formatPct(odds?.pMedal ?? 0), delta: delta(odds?.pMedal, baseline?.pMedal),
              hint: medals.map(m => m.label).join(', '),
              // Zero has no bar and no track.
              visual: (odds?.pMedal ?? 0) > 0 && <SplitBar height={8} segments={medals} ariaLabel={medals.map(m => m.label).join(', ')} />,
              sub: (odds?.pMedal ?? 0) > 0 ? `${asOf ? `${asOf}: silver` : 'Silver'} ${formatPct(odds?.pSilver ?? 0)}, bronze ${formatPct(odds?.pBronze ?? 0)}` : asOf,
            },
            { key: 'top10', label: 'Top 10', value: formatPct(odds?.pTop10 ?? 0), delta: delta(odds?.pTop10, baseline?.pTop10), sub: asOf },
            {
              key: 'finish', label: expIsBaseline ? 'Expected finish (baseline)' : 'Expected finish', value: formatRank(exp ?? baseline?.expRank ?? null),
              sub: `${asOf ? `${asOf}: ` : ''}${formatMp(odds?.expMp ?? baseline?.expMp ?? null)} match points`,
              hint: expIsBaseline ? 'Expected finish is recomputed only for teams in your picks; this is the baseline value' : undefined,
            },
          ]}
        />

        {finished ? (
          <div className="grid gap-x-12 lg:grid-cols-2">
            <div className="flex min-w-0 flex-col md:gap-8">
              {roster}
              <FinalBlock team={team} standing={standing} participants={participants} points={points} charted={charted} wide={wide} />
            </div>
            <Block title="Results" wide={wide}>
              <Results played={played} teamsById={teamsById} tall={charted} />
            </Block>
          </div>
        ) : (
          <div className="grid gap-x-8 md:grid-cols-2 md:gap-y-8 xl:grid-cols-[1.35fr_1.1fr_1fr_1fr]">
            {roster}

            <Block title="Results and opponents" wide={wide}>
              <div className="flex flex-col gap-6">
                <Results played={played} teamsById={teamsById} />
                <div className="flex flex-col gap-3">
                  <p className="type-ui text-ink">Likely opponents{isScenario ? ', scenario' : ''}</p>
                  <LikelyOpponents event={event} run={run} team={team} teamsById={teamsById} filtersKey={filtersKey} onStale={onStale} playedNextResult={playedNext?.outcome ?? null} />
                </div>
              </div>
            </Block>

            <FinishBlock data={data} error={error} isScenario={isScenario} wide={wide} />

            <Block title="Remaining rounds" defaultOpen wide={wide}>
              {error ? <p role="alert" className="type-small text-negative">{error}</p>
                : !data ? <Skeleton kind="rounds" rows={Math.max(1, N_ROUNDS - run.roundsCompleted)} label="Loading the remaining rounds" />
                : data.roundOdds.length === 0 ? <Quiet>Tournament complete.</Quiet>
                : <RemainingRounds data={data} roundHistory={roundHistory} teamsById={teamsById} />}
            </Block>
          </div>
        )}
      </Panel.Body>
    </Panel>
  );
}

function Roster({ event, team, players, anyRace }: { event: OlympiadEvent; team: Team; players: Player[]; anyRace: boolean }) {
  if (players.length === 0) return <Quiet>Roster pending.</Quiet>;
  return (
    <>
      <Table label={`${team.name} roster`} density="compact">
        <THead>
          <tr>
            <Th title="Board" width={24}><span aria-hidden>Bd</span><span className="sr-only">Board</span></Th>
            <Th>Player</Th>
            <Th align="right">Rating</Th>
            {anyRace && <Th align="right" title="Performance rating in the board-prize race" className={LAST_NARROW}>TPR</Th>}
            {anyRace && <Th align="right" className={WIDE}>Points</Th>}
          </tr>
        </THead>
        <TBody>
          {players.map(p => (
            <Tr key={p.board}>
              <Td muted>{p.board}</Td>
              <Td header grow lead={p.title && <span className="type-label text-ink-3">{p.title}</span>}>
                {p.race && p.fideId !== null
                  ? <TextLink quiet href={playerHref(event, p.fideId)} title={`${p.name}: games, performance rating and board-prize rank`}>{p.name}</TextLink>
                  : <span title={p.name}>{p.name}</span>}
              </Td>
              <Td align="right">{p.rating || '—'}</Td>
              {anyRace && (
                <Td align="right" title={p.race?.rank ? `${ordinal(p.race.rank)} on board ${p.board}` : undefined} className={cn(LAST_NARROW, p.race?.rank === 1 && 'font-semibold')}>
                  {p.race?.tpr ?? '—'}
                </Td>
              )}
              {anyRace && <Td align="right" muted className={WIDE}>{p.race?.games ? formatScore(p.race.score, p.race.games) : '—'}</Td>}
            </Tr>
          ))}
        </TBody>
      </Table>
      {anyRace && <TextLink standalone className="mt-2" href={`${boardsHref(event)}?team=${team.teamId}`}>Board prize race</TextLink>}
    </>
  );
}

/** `tall`: beside a roster with a chart under it, so both columns end together. */
function Results({ played, teamsById, tall = false }: { played: TeamRoundEntry[]; teamsById: Map<number, Team>; tall?: boolean }) {
  if (played.length === 0) return <Quiet>No matches played yet.</Quiet>;
  return (
    <Table label="Results" density={tall ? 'row' : 'compact'}>
      <THead><tr><Th width={56}>Round</Th><Th>Opponent</Th><Th align="right">Result</Th></tr></THead>
      <TBody>
        {played.map(h => {
          const opp = h.opponentId !== null ? teamsById.get(h.opponentId) : null;
          const r = WDL[h.outcome ?? 'd'];
          return (
            <Tr key={h.round}>
              <Td muted>{h.round}</Td>
              <Td header grow lead={opp && <Flag code={opp.fedCode} size="xs" decorative />} meta={opp && `#${opp.teamId}`}>
                <span title={opp?.name}>{opp ? shortTeamName(opp.name) : h.opponentId === null ? 'bye' : '—'}</span>
              </Td>
              <Td align="right">
                <span className="inline-flex items-center gap-2">
                  {formatMatchScore(h.score, h.oppScore)}
                  <Pips kind="result" size={20} items={[{ label: `Round ${h.round}: ${r.word}`, letter: r.letter, tone: r.tone }]} />
                </span>
              </Td>
            </Tr>
          );
        })}
      </TBody>
    </Table>
  );
}

/** Once the event is over: the place, and how the chance of a medal got there. */
function FinalBlock({ team, standing, participants, points, charted, wide }: { team: Team; standing?: DerivedStanding; participants: number; points: HistoryPoint[]; charted: boolean; wide: boolean }) {
  const best = points.reduce<HistoryPoint | null>((a, h) => (a && a.pMedal >= h.pMedal ? a : h), null);
  const when = (h: HistoryPoint) => (h.roundsCompleted === 0 ? 'before round 1' : `after round ${h.roundsCompleted}`);
  // On the way to a medal the last value says nothing new; the top of a chance that came to nothing does.
  const story = charted && best && points[0].roundsCompleted === 0
    ? `${formatPct(points[0].pMedal)} to win a medal before round 1${standing && standing.rank > 3 && best !== points[0] ? `, ${formatPct(best.pMedal)} at best (${when(best)})` : ''}.`
    : null;
  return (
    <Block title="Finish" defaultOpen wide={wide}>
      <p className="type-body text-ink-2">
        {standing && <strong className="text-ink">Finished {ordinal(standing.rank)} of {participants}, seeded {ordinal(team.teamId)}.</strong>} {story}
      </p>
      {charted && (
        <LineChart
          className="mt-4"
          caption="Chance after each round"
          ariaLabel={`Chance of a medal and of gold after each round. Medal: from ${formatPct(points[0].pMedal)} to ${formatPct(points[points.length - 1].pMedal)}.`}
          series={[
            { id: 'medal', label: 'Any medal', short: 'Medal', values: points.map(h => h.pMedal), tone: 'ink', emphasis: 'strong' },
            { id: 'gold', label: 'Gold', values: points.map(h => h.pGold), tone: 'gold', emphasis: 'normal' },
          ]}
          x={{ labels: points.map(h => (h.roundsCompleted === 0 ? 'Pre' : `R${h.roundsCompleted}`)), titles: points.map(h => (h.roundsCompleted === 0 ? 'Before round 1' : `After round ${h.roundsCompleted}`)) }}
          y={{ min: 0, format: 'pct' }}
          height={{ desktop: 168, phone: 180 }}
          table={{ columns: ['Round', 'Any medal', 'Gold'], rows: points.map(h => [h.roundsCompleted === 0 ? 'Before round 1' : `After round ${h.roundsCompleted}`, formatPct(h.pMedal), formatPct(h.pGold)]) }}
        />
      )}
    </Block>
  );
}

function FinishBlock({ data, error, isScenario, wide }: { data: TeamDetail | null; error: string | null; isScenario: boolean; wide: boolean }) {
  const total = data?.total ?? 0;
  const dist = data?.rankDist ?? [];
  const buckets = [
    ...Array.from({ length: RANK_BUCKETS }, (_, i) => ({ rank: i + 1, label: String(i + 1), n: dist.find(d => d.rank === i + 1)?.n ?? 0 })),
    { rank: RANK_BUCKETS + 1, label: `${RANK_BUCKETS + 1}+`, n: dist.filter(d => d.rank > RANK_BUCKETS).reduce((a, d) => a + d.n, 0) },
  ];
  let median: number | null = null;
  if (total > 0) {
    let acc = 0;
    for (const d of [...dist].sort((a, b) => a.rank - b.rank)) { acc += d.n; if (acc >= total / 2) { median = d.rank; break; } }
  }
  // One outcome and nothing else is a sentence, not a chart.
  const sure = total > 0 ? buckets.find(b => b.n / total >= 0.9995) : undefined;
  const words = (rank: number) => (rank > RANK_BUCKETS ? `${RANK_BUCKETS + 1}th or worse` : ordinal(rank));
  return (
    <Block title="Finish distribution" note={median !== null ? `median ${ordinal(median)}` : undefined} wide={wide}>
      {error ? <p role="alert" className="type-small text-negative">{error}</p>
        : !data ? <Skeleton kind="histogram" height={200} label="Loading the finish distribution" />
        : total === 0 ? <Quiet>No matching simulations.</Quiet>
        : sure ? <p className="type-body text-ink-2">{words(sure.rank)} in every simulation{isScenario ? ' that matches your scenario' : ''}.</p>
        : (
          <>
            <ColumnChart
              format="pct0" height={200} values={0.08}
              selected={median !== null ? String(Math.min(median, RANK_BUCKETS + 1)) : undefined}
              columns={buckets.map(b => ({
                key: String(b.rank), label: b.label, title: words(b.rank),
                parts: [{ tone: b.rank === 1 ? 'gold' as const : b.rank === 2 ? 'silver' as const : b.rank === 3 ? 'bronze' as const : 'context' as const, value: b.n / total, label: 'Simulations' }],
              }))}
              ariaLabel={`Median finish ${median !== null ? ordinal(median) : 'unknown'}; ${formatPct(buckets[0].n / total)} first, ${formatPct(buckets[RANK_BUCKETS].n / total)} ${RANK_BUCKETS + 1}th or worse`}
              table={{ columns: ['Finish', 'Simulations'], rows: buckets.map(b => [words(b.rank), formatPct(b.n / total)]) }}
            />
            <p className="mt-2 type-label text-ink-3">Final position across {total.toLocaleString('en-US')} simulations{isScenario ? ' matching your scenario' : ''}. The median is marked.</p>
          </>
        )}
    </Block>
  );
}

function RemainingRounds({ data, roundHistory, teamsById }: { data: TeamDetail; roundHistory: TeamRoundEntry[]; teamsById: Map<number, Team> }) {
  return (
    <>
      <Legend className="mb-3" items={[{ tone: 'win', label: 'Win' }, { tone: 'draw', label: 'Draw' }, { tone: 'loss', label: 'Loss' }]} />
      <Rows label="Remaining rounds: win, draw and loss chances">
        {data.roundOdds.map(o => {
          const p = toProbs(o) ?? { w: 0, d: 0, l: 0 };
          const entry = roundHistory.find(h => h.round === o.round && h.status !== 'final');
          const opp = entry?.opponentId != null ? teamsById.get(entry.opponentId) : null;
          const pct = [p.w, p.d, p.l].map(v => Math.round(v * 100));
          return (
            <Row
              key={o.round} size="sm" lead={<span className="type-data text-ink-3">{o.round}</span>}
              title={opp
                ? <span className="inline-flex items-center gap-2"><Flag code={opp.fedCode} size="xs" decorative />{shortTeamName(opp.name)}</span>
                : <span className="font-normal text-ink-3">to be paired</span>}
              meta={entry?.projected ? 'projected' : undefined}
              value={pct.join(' / ')}
            >
              <SplitBar className="pb-3" height={8} segments={wdlSegments(p)} ariaLabel={`Round ${o.round}: win ${pct[0]}%, draw ${pct[1]}%, loss ${pct[2]}%`} />
            </Row>
          );
        })}
      </Rows>
    </>
  );
}
