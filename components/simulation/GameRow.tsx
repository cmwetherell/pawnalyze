'use client';

import { MatchRow, type MatchSide } from '@/components/chess/MatchRow';
import { PieceDot } from '@/components/chess/PieceDot';
import { Avatar } from '@/components/ui/Avatar';
import type { PickOption } from '@/components/ui/PickToggle';
import { getPlayerName, getPlayerPhoto, getPlayerShortName } from '@/lib/playerData';
import type { Game } from '@/types';
import { SCORE, type Outcome } from './rounds';

const OPTIONS: PickOption<Outcome>[] = [
  { value: 'white', label: 'White wins', glyph: '1', tone: 'ink' },
  { value: 'draw', label: 'Draw', glyph: '=', tone: 'draw' },
  { value: 'black', label: 'Black wins', glyph: '0', tone: 'ink' },
];

interface GameRowProps {
  game: Game;
  pick?: Outcome | null;
  onPick?: (outcome: Outcome | null) => void;
  /** "Game 3" */
  label?: string;
  disabled?: boolean;
}

const Color = ({ side }: { side: 'white' | 'black' }) => (
  <span className="inline-flex items-center gap-1.5"><PieceDot side={side} />{side === 'white' ? 'White' : 'Black'}</span>
);

/** One game: its result, or the cells to pick one. White is always on the left. */
export function GameRow({ game, pick = null, onPick, label, disabled }: GameRowProps) {
  const result = game.outcome ? SCORE[game.outcome] : undefined;
  const side = (name: string, color: 'white' | 'black'): MatchSide => ({
    name: result === undefined ? getPlayerShortName(name) : getPlayerName(name),
    meta: <Color side={color} />,
    lead: result === undefined && getPlayerPhoto(name) ? <Avatar name={getPlayerName(name)} src={getPlayerPhoto(name)} size={32} mono decorative /> : undefined,
    emphasis: game.outcome === color,
    muted: Boolean(game.outcome) && game.outcome !== 'draw' && game.outcome !== color,
  });
  return (
    <MatchRow
      home={side(game.whitePlayer, 'white')}
      away={side(game.blackPlayer, 'black')}
      result={result && (label ? <>{result}<span className="block type-label font-normal text-ink-3">{label}</span></> : result)}
      options={result === undefined ? OPTIONS : undefined}
      pick={pick}
      onPick={result === undefined ? onPick : undefined}
      status={result === undefined ? label : undefined}
      legend={`${getPlayerName(game.whitePlayer)} against ${getPlayerName(game.blackPlayer)}`}
      disabled={disabled}
    />
  );
}
