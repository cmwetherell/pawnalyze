interface ComplexityBarProps {
  score: number;
}

const ComplexityBar: React.FC<ComplexityBarProps> = ({ score }) => {
  const getBarColor = (score: number) => {
    if (score >= 1 && score <= 3) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (score >= 4 && score <= 5) return 'bg-gradient-to-r from-yellow-500 to-amber-400';
    if (score >= 6 && score <= 7) return 'bg-gradient-to-r from-orange-500 to-orange-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  const getLabel = (score: number) => {
    if (score >= 1 && score <= 3) return 'Low';
    if (score >= 4 && score <= 5) return 'Medium';
    if (score >= 6 && score <= 7) return 'High';
    return 'Extreme';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-obsidian-400 text-xs uppercase tracking-wider">Complexity Level</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          score <= 3 ? 'bg-emerald-400/10 text-emerald-400' :
          score <= 5 ? 'bg-yellow-400/10 text-yellow-400' :
          score <= 7 ? 'bg-orange-400/10 text-orange-400' :
          'bg-red-400/10 text-red-400'
        }`}>
          {getLabel(score)}
        </span>
      </div>
      
      <div className="relative h-3 w-full bg-obsidian-900 rounded-full overflow-hidden">
        {/* Background segments */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r border-obsidian-800" />
          <div className="flex-1 border-r border-obsidian-800" />
          <div className="flex-1 border-r border-obsidian-800" />
          <div className="flex-1" />
        </div>
        
        {/* Progress bar */}
        <div 
          className={`absolute inset-y-0 left-0 ${getBarColor(score)} rounded-full transition-all duration-500 ease-out-expo`}
          style={{ width: `${Math.min(score * 10, 100)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        </div>
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-obsidian-500 text-xs">
        <span>1</span>
        <span>3</span>
        <span>5</span>
        <span>7</span>
        <span>10</span>
      </div>
    </div>
  );
};

export default ComplexityBar;
