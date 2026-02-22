'use client';

interface OutcomeToggleProps {
  selected: 'white' | 'draw' | 'black' | null;
  onChange: (outcome: 'white' | 'draw' | 'black' | null) => void;
}

export default function OutcomeToggle({ selected, onChange }: OutcomeToggleProps) {
  const handleClick = (value: 'white' | 'draw' | 'black') => {
    onChange(selected === value ? null : value);
  };

  const base = 'flex-1 flex items-center justify-center font-bold text-sm transition-all duration-150 cursor-pointer select-none h-8';

  return (
    <div className="inline-flex rounded-lg overflow-hidden shrink-0 bg-[var(--bg-surface-1)] border border-[var(--border)] w-[96px] sm:w-[108px]">
      {/* White wins (1) */}
      <button
        onClick={() => handleClick('white')}
        className={`${base} rounded-l-md ${
          selected === 'white'
            ? 'bg-gray-200 text-gray-900'
            : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-secondary)]'
        }`}
        title="White wins"
        aria-label="White wins"
      >
        1
      </button>

      {/* Draw (=) */}
      <button
        onClick={() => handleClick('draw')}
        className={`${base} border-x border-[var(--border)] ${
          selected === 'draw'
            ? 'bg-chess-gold/20 text-chess-gold'
            : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-secondary)]'
        }`}
        title="Draw"
        aria-label="Draw"
      >
        =
      </button>

      {/* Black wins (0) */}
      <button
        onClick={() => handleClick('black')}
        className={`${base} rounded-r-md ${
          selected === 'black'
            ? 'bg-gray-800 text-white'
            : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-secondary)]'
        }`}
        title="Black wins"
        aria-label="Black wins"
      >
        0
      </button>
    </div>
  );
}
