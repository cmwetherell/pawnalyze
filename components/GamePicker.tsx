'use client'
import { useState } from 'react';

interface GamePickerProps {
  whitePlayer: string;
  blackPlayer: string;
  onOutcomeChange: (outcome: 'white' | 'draw' | 'black') => void;
}

const GamePicker = ({ whitePlayer, blackPlayer, onOutcomeChange }: GamePickerProps) => {
  const [selectedOutcome, setSelectedOutcome] = useState<'white' | 'draw' | 'black' | null>(null);

  // Adjusted for responsive design and max-width constraints
  const baseClassName = "border-2 border-black text-black font-bold rounded transition duration-300 ease-in-out text-center"; // Common base styles
  const playerButtonClassName = `${baseClassName} flex-1 min-w-0 max-w-[250px]`; // Max width for player buttons
  const drawButtonClassName = `${baseClassName} flex-1 min-w-0 max-w-[150px]`; // Max width for draw button
  const selectedClassName = "bg-black text-white";
  const defaultClassName = "bg-primary";

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
    <div className="bg-white shadow-md rounded-lg p-2 flex justify-center items-center flex-wrap"> {/* Added flex-wrap for responsiveness */}
      <button style={{ overflowX: "hidden"}}
        className={getButtonClassName('white')}
        onClick={() => handleOutcomeSelect('white')}
      >
        {whitePlayer}
      </button>
      <button style={{ overflowX: "hidden"}}
        className={getButtonClassName('draw')}
        onClick={() => handleOutcomeSelect('draw')}
      >
        Draw
      </button>
      <button style={{ overflowX: "hidden"}}
        className={getButtonClassName('black')}
        onClick={() => handleOutcomeSelect('black')}
      >
        {blackPlayer}
      </button>
    </div>
  );
};

export default GamePicker;
