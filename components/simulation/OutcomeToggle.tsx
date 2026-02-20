'use client';

import { useState } from 'react';

interface OutcomeToggleProps {
  selected: 'white' | 'draw' | 'black' | null;
  onChange: (outcome: 'white' | 'draw' | 'black' | null) => void;
}

export default function OutcomeToggle({ selected, onChange }: OutcomeToggleProps) {
  const handleClick = (value: 'white' | 'draw' | 'black') => {
    onChange(selected === value ? null : value);
  };

  const base = 'flex items-center justify-center font-bold text-sm transition-all duration-150 cursor-pointer select-none';

  return (
    <div className="inline-flex rounded-md overflow-hidden border border-gray-200 shrink-0" style={{ width: 108 }}>
      {/* White wins (1) */}
      <button
        onClick={() => handleClick('white')}
        className={`${base} w-9 h-8 rounded-l-md ${
          selected === 'white'
            ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-300 z-10'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }`}
        title="White wins"
        aria-label="White wins"
      >
        1
      </button>

      {/* Draw (½) */}
      <button
        onClick={() => handleClick('draw')}
        className={`${base} w-[30px] h-8 border-x border-gray-200 ${
          selected === 'draw'
            ? 'bg-gray-500 text-white shadow-inner'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }`}
        title="Draw"
        aria-label="Draw"
      >
        =
      </button>

      {/* Black wins (0) */}
      <button
        onClick={() => handleClick('black')}
        className={`${base} w-9 h-8 rounded-r-md ${
          selected === 'black'
            ? 'bg-gray-900 text-white shadow-md'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }`}
        title="Black wins"
        aria-label="Black wins"
      >
        0
      </button>
    </div>
  );
}
