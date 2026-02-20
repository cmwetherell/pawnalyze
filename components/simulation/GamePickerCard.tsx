'use client';

import PlayerAvatar from './PlayerAvatar';
import OutcomeToggle from './OutcomeToggle';

interface GamePickerCardProps {
  whitePlayer: string;
  blackPlayer: string;
  selectedOutcome: 'white' | 'draw' | 'black' | null;
  onOutcomeChange: (outcome: 'white' | 'draw' | 'black' | null) => void;
}

/** Chess piece icon — small inline SVG */
function PieceIcon({ side }: { side: 'white' | 'black' }) {
  // Simple king silhouette
  return (
    <span
      className={`inline-block w-3.5 h-3.5 rounded-sm shrink-0 ${
        side === 'white' ? 'bg-white border border-gray-300' : 'bg-gray-800'
      }`}
      title={side === 'white' ? 'White pieces' : 'Black pieces'}
    />
  );
}

/** Get short display name: "Last, First" → "Last" */
function displayName(name: string): string {
  if (name.includes(',')) return name.split(',')[0].trim();
  // Handle "Praggnanandhaa R" style
  const parts = name.split(' ');
  return parts.length > 1 && parts[parts.length - 1].length <= 2
    ? parts.slice(0, -1).join(' ')
    : parts[0];
}

export default function GamePickerCard({
  whitePlayer,
  blackPlayer,
  selectedOutcome,
  onOutcomeChange,
}: GamePickerCardProps) {
  const hasSelection = selectedOutcome !== null;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
        hasSelection
          ? 'bg-gray-50 ring-1 ring-gray-200'
          : 'bg-white hover:bg-gray-50/50'
      }`}
    >
      {/* White player */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
        <span className="text-sm font-medium text-gray-800 truncate text-right">
          {displayName(whitePlayer)}
        </span>
        <PlayerAvatar name={whitePlayer} size="sm" />
        <PieceIcon side="white" />
      </div>

      {/* Toggle */}
      <OutcomeToggle selected={selectedOutcome} onChange={onOutcomeChange} />

      {/* Black player */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <PieceIcon side="black" />
        <PlayerAvatar name={blackPlayer} size="sm" />
        <span className="text-sm font-medium text-gray-800 truncate">
          {displayName(blackPlayer)}
        </span>
      </div>
    </div>
  );
}
