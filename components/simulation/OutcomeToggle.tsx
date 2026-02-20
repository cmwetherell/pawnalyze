'use client';

interface OutcomeToggleProps {
  selected: 'white' | 'draw' | 'black' | null;
  onChange: (outcome: 'white' | 'draw' | 'black' | null) => void;
}

export default function OutcomeToggle({ selected, onChange }: OutcomeToggleProps) {
  const handleClick = (value: 'white' | 'draw' | 'black') => {
    onChange(selected === value ? null : value);
  };

  const base = 'flex items-center justify-center font-bold text-sm transition-all duration-150 cursor-pointer select-none h-8';
  const ring = 'ring-2 ring-gray-900 ring-inset z-10';

  return (
    <div className="inline-flex rounded-lg overflow-hidden shrink-0 bg-gray-100" style={{ width: 108 }}>
      {/* White wins (1) */}
      <button
        onClick={() => handleClick('white')}
        className={`${base} w-9 rounded-l-lg ${
          selected === 'white'
            ? `bg-white text-gray-900 ${ring}`
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }`}
        title="White wins"
        aria-label="White wins"
      >
        1
      </button>

      {/* Draw (½) */}
      <button
        onClick={() => handleClick('draw')}
        className={`${base} w-[30px] ${
          selected === 'draw'
            ? `bg-gray-500 text-white ${ring}`
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }`}
        title="Draw"
        aria-label="Draw"
      >
        =
      </button>

      {/* Black wins (0) */}
      <button
        onClick={() => handleClick('black')}
        className={`${base} w-9 rounded-r-lg ${
          selected === 'black'
            ? `bg-gray-900 text-white ${ring}`
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }`}
        title="Black wins"
        aria-label="Black wins"
      >
        0
      </button>
    </div>
  );
}
