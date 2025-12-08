'use client';
import { useState, useEffect } from 'react';

interface GamePickerProps {
  whitePlayer: string;
  blackPlayer: string;
  onOutcomeChange: (outcome: 'white' | 'draw' | 'black') => void;
  gameDetails?: { [key: string]: any };
}

const GamePicker = ({ whitePlayer, blackPlayer, onOutcomeChange, gameDetails }: GamePickerProps) => {
  const [selectedOutcome, setSelectedOutcome] = useState<'white' | 'draw' | 'black' | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDisplayName = (name: string) => (isMobile ? name.substring(0, 10) : name);

  const handleOutcomeSelect = (outcome: 'white' | 'draw' | 'black') => {
    const newOutcome = selectedOutcome === outcome ? null : outcome;
    setSelectedOutcome(newOutcome);
    onOutcomeChange(newOutcome as 'white' | 'draw' | 'black');
  };

  const getButtonStyle = (outcome: 'white' | 'draw' | 'black') => {
    const isSelected = selectedOutcome === outcome;
    
    return `
      flex-1 py-3 px-4 text-sm font-medium
      transition-all duration-300 ease-out-expo
      border border-white/[0.06]
      ${isSelected
        ? outcome === 'white'
          ? 'bg-ivory-100 text-obsidian-950 border-ivory-100'
          : outcome === 'black'
          ? 'bg-obsidian-700 text-ivory-100 border-obsidian-700'
          : 'bg-amber-400 text-obsidian-950 border-amber-400'
        : 'bg-white/[0.03] text-obsidian-300 hover:bg-white/[0.06] hover:text-ivory-100'
      }
    `;
  };

  return (
    <div className="p-1">
      <div className="flex gap-1 rounded-lg overflow-hidden bg-obsidian-900/50">
        {/* White Player Button */}
        <button
          className={`${getButtonStyle('white')} rounded-l-md`}
          onClick={() => handleOutcomeSelect('white')}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-ivory-100 border border-obsidian-300 flex-shrink-0" />
            <span className="truncate">{getDisplayName(whitePlayer)}</span>
          </div>
        </button>

        {/* Draw Button */}
        <button
          className={getButtonStyle('draw')}
          onClick={() => handleOutcomeSelect('draw')}
        >
          <span className="truncate">½ - ½</span>
        </button>

        {/* Black Player Button */}
        <button
          className={`${getButtonStyle('black')} rounded-r-md`}
          onClick={() => handleOutcomeSelect('black')}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="truncate">{getDisplayName(blackPlayer)}</span>
            <span className="w-3 h-3 rounded-full bg-obsidian-800 border border-obsidian-400 flex-shrink-0" />
          </div>
        </button>
      </div>

      {/* Optional Game Details */}
      {gameDetails && (
        <div className="mt-2 space-y-1">
          {Object.entries(gameDetails).map(([key, value]) => (
            <p key={key} className="text-xs text-obsidian-500 truncate">
              <span className="font-medium">{key}:</span> {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamePicker;
