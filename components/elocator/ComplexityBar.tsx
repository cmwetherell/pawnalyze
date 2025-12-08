'use client';

interface ComplexityBarProps {
    score: number;
  }
  
const ComplexityBar: React.FC<ComplexityBarProps> = ({ score }) => {
  const getBarColor = (value: number) => {
    if (value <= 3) return 'var(--color-mint)';
    if (value <= 5) return 'var(--color-brass)';
    if (value <= 7) return '#f09383';
    return 'var(--color-ember)';
  };

  const widthPercent = Math.max(0, Math.min(score, 10)) * 10;

  return (
    <div className="h-3 w-full rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${widthPercent}%`, backgroundColor: getBarColor(score) }}
      />
    </div>
  );
};
  
  export default ComplexityBar;