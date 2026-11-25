import type { MatchSide } from '@/components/chess/MatchRow';
import type { PickOption } from '@/components/ui/PickToggle';
import { Flag } from '@/components/ui/Flag';
import type { SplitSegment } from '@/components/ui/SplitBar';
import { formatMatchScore, outcomeFromScores } from '@/lib/olympiad/standings';
import type { Match, Outcome, Team } from '@/lib/olympiad/types';
import { codeLabel, shortTeamName, type WinProbs } from './teams';

/** Both sides of a match as MatchRow takes them; a bye has an empty away side. */
export function matchSides(match: Match, home: Team, away: Team | null, meta?: (t: Team) => string, onSelect?: (teamId: number) => void, picked?: Outcome | null): { home: MatchSide; away: MatchSide } {
  const won = picked ?? (match.status === 'final' ? outcomeFromScores(match.team1Score, match.team2Score) : null);
  const side = (t: Team, mine: Outcome): MatchSide => ({
    lead: <Flag code={t.fedCode} size="md" decorative />,
    name: shortTeamName(t.name),
    meta: meta?.(t),
    onSelect: onSelect && (() => onSelect(t.teamId)),
    emphasis: won === mine,
    muted: won !== null && won !== 'd' && won !== mine,
  });
  return { home: side(home, 'w'), away: away ? side(away, 'l') : { name: '' } };
}

export const matchResult = (m: Match) => (m.team2Id === null ? 'bye' : formatMatchScore(m.team1Score, m.team2Score));

export const wdlSegments = (p: WinProbs): SplitSegment[] => [
  { key: 'w', value: p.w, tone: 'win', label: 'Win' },
  { key: 'd', value: p.d, tone: 'draw', label: 'Draw' },
  { key: 'l', value: p.l, tone: 'loss', label: 'Loss' },
];

/** The same between two teams: each end is a team's chance to win. */
export const matchSegments = (p: WinProbs, home: Team, away: Team): SplitSegment[] => [
  { key: 'w', value: p.w, tone: 'win', label: shortTeamName(home.name) },
  { key: 'd', value: p.d, tone: 'draw', label: 'Draw' },
  { key: 'l', value: p.l, tone: 'loss', label: shortTeamName(away.name) },
];

/** Pick cells for a paired match: either team, or a drawn match. */
export const matchPicks = (home: Team, away: Team, p: WinProbs | null): PickOption<Outcome>[] => [
  { value: 'w', label: `${home.name} wins`, glyph: codeLabel(home), pct: p?.w, tone: 'ink' },
  { value: 'd', label: 'Drawn match (2–2)', glyph: '=', pct: p?.d, tone: 'draw' },
  { value: 'l', label: `${away.name} wins`, glyph: codeLabel(away), pct: p?.l, tone: 'ink' },
];

/** Pick cells for one team's round, whoever the opponent is. */
export const teamPicks = (team: Team): PickOption<Outcome>[] => [
  { value: 'w', label: `${team.name} wins`, glyph: 'W', tone: 'win' },
  { value: 'd', label: `${team.name} draws`, glyph: 'D', tone: 'draw' },
  { value: 'l', label: `${team.name} loses`, glyph: 'L', tone: 'loss' },
];
