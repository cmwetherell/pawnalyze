import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PositionAnalysis {
  fen: string;
  complexity: number;
  evaluation: number;
}

interface DisplayEvalProps {
  positionAnalysis: PositionAnalysis[];
}

function useChartColors() {
  const [colors, setColors] = useState({
    grid: '',
    axisText: '',
    whiteComplexity: '',
    blackComplexity: '',
    tooltipBg: '',
    tooltipBorder: '',
    tooltipText: '',
  });

  useEffect(() => {
    const update = () => {
      const s = getComputedStyle(document.documentElement);
      setColors({
        grid: s.getPropertyValue('--chart-grid').trim(),
        axisText: s.getPropertyValue('--text-muted').trim(),
        whiteComplexity: s.getPropertyValue('--chart-line-white').trim(),
        blackComplexity: s.getPropertyValue('--chart-line-black').trim(),
        tooltipBg: s.getPropertyValue('--chart-tooltip-bg').trim(),
        tooltipBorder: s.getPropertyValue('--chart-tooltip-border').trim(),
        tooltipText: s.getPropertyValue('--text-secondary').trim(),
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

const DisplayEval: React.FC<DisplayEvalProps> = ({ positionAnalysis }) => {
  const colors = useChartColors();
  const tooltipStyle = {
    backgroundColor: colors.tooltipBg,
    border: `1px solid ${colors.tooltipBorder}`,
    borderRadius: '8px',
    color: colors.tooltipText,
  };
  const dataForWhite = positionAnalysis
    .filter((_, index) => index % 2 === 0)
    .map((position, index) => ({
      Move: index * 2 + 1,
      WhiteComplexity: position.complexity,
    }));

  const dataForBlack = positionAnalysis
    .filter((_, index) => index % 2 !== 0)
    .map((position, index) => ({
      Move: index * 2 + 2,
      BlackComplexity: position.complexity,
    }));

  const evaluationDataCapped = positionAnalysis.map((position, index) => ({
    Move: index + 1,
    Evaluation: Math.max(Math.min(position.evaluation, 1000), -1000),
  }));

  const whiteGameComplexityAvg = dataForWhite.reduce((sum, p) => sum + p.WhiteComplexity, 0) / dataForWhite.length;
  const blackGameComplexityAvg = dataForBlack.reduce((sum, p) => sum + p.BlackComplexity, 0) / dataForBlack.length;

  return (
    <div className="space-y-6">
      {/* Evaluation */}
      <div className="surface-card p-4">
        <h3 className="text-sm font-heading text-[var(--text-primary)] mb-4">Game Evaluation</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={evaluationDataCapped} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="Move" stroke={colors.axisText} tick={{ fill: colors.axisText, fontSize: 11 }} />
            <YAxis stroke={colors.axisText} tick={{ fill: colors.axisText, fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: colors.axisText, fontSize: 12 }} />
            <Line type="monotone" dataKey="Evaluation" stroke="#C9A84C" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Complexity side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="surface-card p-4">
          <h3 className="text-sm font-heading text-[var(--text-primary)] mb-4">White Complexity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dataForWhite} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="Move" stroke={colors.axisText} tick={{ fill: colors.axisText, fontSize: 11 }} />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke={colors.axisText} tick={{ fill: colors.axisText, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="WhiteComplexity" stroke={colors.whiteComplexity} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-4">
          <h3 className="text-sm font-heading text-[var(--text-primary)] mb-4">Black Complexity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dataForBlack} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="Move" stroke={colors.axisText} tick={{ fill: colors.axisText, fontSize: 11 }} />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke={colors.axisText} tick={{ fill: colors.axisText, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="BlackComplexity" stroke={colors.blackComplexity} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average stats */}
      <div className="surface-card p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-[var(--text-muted)]">White Avg Complexity</p>
            <p className="text-xl font-heading text-[var(--text-primary)]">{whiteGameComplexityAvg.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Black Avg Complexity</p>
            <p className="text-xl font-heading text-[var(--text-primary)]">{blackGameComplexityAvg.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayEval;
