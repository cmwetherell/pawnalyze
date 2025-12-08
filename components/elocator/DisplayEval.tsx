'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';

interface PositionAnalysis {
  fen: string;
  complexity: number;
  evaluation: number;
}

interface DisplayEvalProps {
  positionAnalysis: PositionAnalysis[];
}

const DisplayEval: React.FC<DisplayEvalProps> = ({ positionAnalysis }) => {
  // Prepare separate data for white and black complexities
  const dataForWhite = positionAnalysis
    .filter((_, index) => index % 2 === 0) // White's moves
    .map((position, index) => ({
      Move: index * 2 + 1, // Adjust move number for display
      WhiteComplexity: position.complexity,
    }));

  const dataForBlack = positionAnalysis
    .filter((_, index) => index % 2 !== 0) // Black's moves
    .map((position, index) => ({
      Move: index * 2 + 2, // Adjust move number for display
      BlackComplexity: position.complexity,
    }));

  const evaluationData = positionAnalysis.map((position, index) => ({
    Move: index + 1,
    Evaluation: position.evaluation,
  }));

  const evaluationDataCapped = positionAnalysis.map((position, index) => ({
    Move: index + 1,
    Evaluation: Math.max(Math.min(position.evaluation, 1000), -1000),
  }));

  const whiteGameComplexitySum = dataForWhite.reduce((sum, position) => sum + position.WhiteComplexity, 0);
  const whiteGameComplexityAvg = whiteGameComplexitySum / dataForWhite.length;
  
  const blackGameComplexitySum = dataForBlack.reduce((sum, position) => sum + position.BlackComplexity, 0);
  const blackGameComplexityAvg = blackGameComplexitySum / dataForBlack.length;

  const gridColor = 'rgba(255,255,255,0.12)';
  const axisColor = '#f4efe4';
  const tooltipStyle = {
    backgroundColor: 'rgba(4,5,12,0.95)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl uppercase tracking-[0.35em] text-paper">Game evaluation</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evaluationDataCapped} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="Move" tick={{ fill: axisColor }} stroke={gridColor} />
            <YAxis tick={{ fill: axisColor }} stroke={gridColor} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: axisColor }} />
            <Line type="monotone" dataKey="Evaluation" stroke="#72f5c7" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="font-display text-xl uppercase tracking-[0.35em] text-paper">White position complexity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataForWhite} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="Move" tick={{ fill: axisColor }} stroke={gridColor} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: axisColor }} stroke={gridColor} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: axisColor }} />
            <Line type="monotone" dataKey="WhiteComplexity" stroke="#f6c177" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="font-display text-xl uppercase tracking-[0.35em] text-paper">Black position complexity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataForBlack} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="Move" tick={{ fill: axisColor }} stroke={gridColor} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: axisColor }} stroke={gridColor} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: axisColor }} />
            <Line type="monotone" dataKey="BlackComplexity" stroke="#a0e9ff" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-slate">
        <p>White average complexity: {whiteGameComplexityAvg.toFixed(2)}</p>
        <p>Black average complexity: {blackGameComplexityAvg.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default DisplayEval;
