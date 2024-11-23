'use client';
import { useState, useEffect } from 'react';

interface GamePickerProps {
  whitePlayer: string;
  blackPlayer: string;
  onOutcomeChange: (outcome: 'white' | 'draw' | 'black') => void;
  gameDetails?: { [key: string]: any }; // Optional prop for additional game data
}

const GamePicker = ({ whitePlayer, blackPlayer, onOutcomeChange, gameDetails }: GamePickerProps) => {
  const [selectedOutcome, setSelectedOutcome] = useState<'white' | 'draw' | 'black' | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to update state based on screen width
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // 768px is a common breakpoint for mobile devices
    };

    // Set initial state based on current screen width
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to truncate player name to 7 characters for mobile screens
  const getDisplayName = (name: string) => (isMobile ? name.substring(0, 7) : name);

  // Adjusted for responsive design and max-width constraints
  const baseClassName =
    'border-2 border-black text-black font-bold rounded transition duration-300 ease-in-out text-center'; // Common base styles
  const playerButtonClassName = `${baseClassName} flex-1 min-w-0 max-w-[250px]`; // Max width for player buttons
  const drawButtonClassName = `${baseClassName} flex-1 min-w-0 max-w-[150px]`; // Max width for draw button
  const selectedClassName = 'bg-black text-white';
  const defaultClassName = 'bg-primary';

  const getButtonClassName = (outcome: 'white' | 'draw' | 'black') => {
    let specificClassName = outcome === 'draw' ? drawButtonClassName : playerButtonClassName;
    return `${specificClassName} ${selectedOutcome === outcome ? selectedClassName : defaultClassName}`;
  };

  const handleOutcomeSelect = (outcome: 'white' | 'draw' | 'black') => {
    const newOutcome = selectedOutcome === outcome ? null : outcome;
    setSelectedOutcome(newOutcome);
    onOutcomeChange(newOutcome as 'white' | 'draw' | 'black');
  };

  return (
    <div className="bg-white p-2 flex justify-center items-center flex-wrap"> {/* Added flex-wrap for responsiveness */}
      <button
        style={{ overflowX: 'hidden' }}
        className={getButtonClassName('white')}
        onClick={() => handleOutcomeSelect('white')}
      >
        {getDisplayName(whitePlayer)}
      </button>
      <button
        style={{ overflowX: 'hidden' }}
        className={getButtonClassName('draw')}
        onClick={() => handleOutcomeSelect('draw')}
      >
        Draw
      </button>
      <button
        style={{ overflowX: 'hidden' }}
        className={getButtonClassName('black')}
        onClick={() => handleOutcomeSelect('black')}
      >
        {getDisplayName(blackPlayer)}
      </button>

      {/* Optional section to display additional game details */}
      {gameDetails && (
        <div className="text-sm text-gray-600 mt-2">
          {Object.entries(gameDetails).map(([key, value]) => (
            <p key={key} className="truncate">
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamePicker;
