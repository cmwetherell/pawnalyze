'use client';

import { Section } from '@/components/layout/Section';
import { Podium, type PodiumPlace } from '@/components/ui/Podium';
import { formatPct } from '@/lib/format';
import { MEDAL_WORD, type MedalPlace } from '@/lib/olympiad/medals';
import type { HistoryPoint, OfficialStandings, Team } from '@/lib/olympiad/types';
import { goldStory, podiumRows } from './podium';
import { MedalHistoryChart, hasTrend } from './MedalHistoryChart';
import { nameInSentence, sentenceName, shortTeamName } from './teams';

interface FinalPodiumProps {
  standings: OfficialStandings;
  teamsById: Map<number, Team>;
  history: HistoryPoint[];
  eventLabel: string;
  selectedTeamId: number | null;
  onSelect: (teamId: number) => void;
}

/** A medal decided on tiebreak: level on match points with the team right below. */
function tiebreakNote(standings: OfficialStandings, rank: number, teamsById: Map<number, Team>): string | null {
  const here = standings.rows.find(r => r.rank === rank);
  const below = standings.rows.find(r => r.rank === rank + 1);
  if (!here || !below || here.mp !== below.mp) return null;
  const other = teamsById.get(below.teamId);
  if (!other) return null;
  const level = here.gpHalf === below.gpHalf ? 'match points and game points' : 'match points';
  const ahead = here.sb !== null && below.sb !== null ? `, ahead by ${Math.abs(here.sb - below.sb).toFixed(1)} on Sonneborn-Berger` : '';
  return `on tiebreak: level with ${nameInSentence(other.name)} on ${level}${ahead}.`;
}

/**
 * The finished event's first screen: the medalists beside how the gold odds moved. Ranks and tiebreaks are the official
 * chess-results values; the odds quoted are from before round 1 (after the last round the model has the medalists at 100%).
 */
export function FinalPodium({ standings, teamsById, history, eventLabel, selectedTeamId, onSelect }: FinalPodiumProps) {
  const rows = podiumRows(standings);
  const champion = rows.length ? teamsById.get(rows[0].teamId) : undefined;
  if (!champion) return null;

  const before = new Map(history.filter(h => h.roundsCompleted === 0).map(h => [h.teamId, h.pGold]));
  const places = rows.flatMap((r): PodiumPlace[] => {
    const team = teamsById.get(r.teamId);
    if (!team) return [];
    const first = r.rank === 1;
    const pre = before.get(r.teamId);
    return [{
      rank: r.rank as MedalPlace, name: shortTeamName(team.name), flag: team.fedCode,
      stats: [
        { label: first ? 'Match points' : 'MP', value: r.mp },
        { label: first ? 'Game points' : 'GP', value: (r.gpHalf / 2).toFixed(1) },
        ...(r.sb !== null ? [{ label: first ? 'Sonneborn-Berger' : 'SB', value: r.sb.toFixed(1) }] : []),
      ],
      pre: pre !== undefined && `${formatPct(pre)} gold odds before round 1`,
    }];
  });
  const tiebreaks = rows.flatMap(r => {
    const note = tiebreakNote(standings, r.rank, teamsById);
    const team = teamsById.get(r.teamId);
    return note && team ? [`${sentenceName(team.name)} took ${MEDAL_WORD[r.rank as MedalPlace]} ${note}`] : [];
  });

  const story = goldStory(history, champion.teamId);
  const favorite = story && teamsById.get(story.favoriteId);
  const name = sentenceName(champion.name);
  const finding = story && favorite && (
    story.favoriteId === champion.teamId
      ? <>{name} started as favorite at {formatPct(story.favoriteP)} {story.ledFrom === 0
          ? <strong className="text-ink">and led after every round.</strong>
          : <>and lost the lead, <strong className="text-ink">then took it back for good after round {story.ledFrom}.</strong></>}</>
      : <>{sentenceName(favorite.name)} started as favorite at {formatPct(story.favoriteP)}. <strong className="text-ink">{name} {story.ledFrom === story.lastRound
          ? 'went ahead in the last round.'
          : `took the lead after round ${story.ledFrom} and never gave it back.`}</strong></>
  );

  return (
    <Section
      id="podium" rule={false} className="pt-6 md:pt-0" layout={hasTrend(history) ? 'split' : 'plain'} ratio="5/7"
      title={`${name} won gold`}
      finding={finding} findingFrom="lg"
    >
      <div className="flex flex-col gap-6">
        <Podium className="self-stretch" places={places} label={`${eventLabel} final medalists`} />
        {tiebreaks.length > 0 && <p className="border-t border-line pt-4 type-small text-ink-3">{tiebreaks.join(' ')}</p>}
        {/* On phones the medalists come first and the story of the odds leads into its chart. */}
        {finding && <p className="type-body text-ink-2 lg:hidden">{finding}</p>}
      </div>
      {hasTrend(history) && (
        <MedalHistoryChart history={history} teamsById={teamsById} extraTeamId={selectedTeamId} medalists={rows.map(r => r.teamId)} fill onSelect={onSelect} />
      )}
    </Section>
  );
}
