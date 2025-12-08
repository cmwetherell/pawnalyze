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

  const getDisplayName = (name: string) => (isMobile ? name.substring(0, 7) : name);

  const handleOutcomeSelect = (outcome: 'white' | 'draw' | 'black') => {
    const newOutcome = selectedOutcome === outcome ? null : outcome;
    setSelectedOutcome(newOutcome);
    onOutcomeChange(newOutcome as 'white' | 'draw' | 'black');
  };

  const getButtonStyles = (outcome: 'white' | 'draw' | 'black') => {
    const isSelected = selectedOutcome === outcome;
    
    const baseStyles = `
      relative overflow-hidden
      px-3 py-2.5
      text-xs font-semibold uppercase tracking-wider
      rounded-lg
      transition-all duration-300 ease-out-expo
      focus:outline-none focus:ring-2 focus:ring-accent/50
    `;
    
    if (isSelected) {
      if (outcome === 'white') {
        return `${baseStyles} bg-white text-bg-primary shadow-glow-sm`;
      } else if (outcome === 'black') {
        return `${baseStyles} bg-text-primary text-bg-primary`;
      } else {
        return `${baseStyles} bg-accent text-bg-primary shadow-glow-sm`;
      }
    }
    
    return `${baseStyles} bg-bg-tertiary text-text-secondary border border-border-subtle hover:border-border-hover hover:text-text-primary`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* White Player Button */}
      <button
        className={`flex-1 min-w-0 ${getButtonStyles('white')}`}
        onClick={() => handleOutcomeSelect('white')}
        title={whitePlayer}
      >
        <span className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white border border-text-muted/30 flex-shrink-0" />
          <span className="truncate">{getDisplayName(whitePlayer)}</span>
        </span>
      </button>
      
      {/* Draw Button */}
      <button
        className={`flex-shrink-0 w-16 ${getButtonStyles('draw')}`}
        onClick={() => handleOutcomeSelect('draw')}
      >
        ½-½
      </button>
      
      {/* Black Player Button */}
      <button
        className={`flex-1 min-w-0 ${getButtonStyles('black')}`}
        onClick={() => handleOutcomeSelect('black')}
        title={blackPlayer}
      >
        <span className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-bg-primary border border-text-muted/30 flex-shrink-0" />
          <span className="truncate">{getDisplayName(blackPlayer)}</span>
        </span>
      </button>

      {/* Optional game details */}
      {gameDetails && (
        <div className="text-xs text-text-muted mt-2 pl-2">
          {Object.entries(gameDetails).map(([key, value]) => (
            <p key={key} className="truncate">
              <strong className="text-text-secondary">{key}:</strong> {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamePicker;
