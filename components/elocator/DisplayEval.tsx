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

  return (
    <>
      <h2>Game Evaluation</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={evaluationDataCapped} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Move" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Evaluation" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <h2>White Position Complexity</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataForWhite} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Move" />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="WhiteComplexity" stroke="#82ca9d" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <h2>Black Position Complexity</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataForBlack} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Move" />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="BlackComplexity" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div>
        <h3>White Average Complexity: {whiteGameComplexityAvg.toFixed(2)}</h3>
        <h3>Black Average Complexity: {blackGameComplexityAvg.toFixed(2)}</h3>
      </div>
    
      
    </>
  );
};

export default DisplayEval;
