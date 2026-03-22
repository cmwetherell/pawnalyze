interface ComplexityBarProps {
  score: number;
}

const ComplexityBar: React.FC<ComplexityBarProps> = ({ score }) => {
  const getConfig = (score: number) => {
    if (score >= 1 && score <= 25) return { color: 'bg-emerald-500', glow: 'shadow-emerald-500/30', label: 'Simple' };
    if (score >= 26 && score <= 50) return { color: 'bg-amber-500', glow: 'shadow-amber-500/30', label: 'Moderate' };
    if (score >= 51 && score <= 75) return { color: 'bg-orange-500', glow: 'shadow-orange-500/30', label: 'Complex' };
    return { color: 'bg-red-500', glow: 'shadow-red-500/30', label: 'Extreme' };
  };

  const { color, glow, label } = getConfig(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="text-[var(--text-secondary)] font-medium">{score} / 100</span>
      </div>
      <div className="w-full h-3 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} ${glow} shadow-lg transition-all duration-500 ease-in-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ComplexityBar;
