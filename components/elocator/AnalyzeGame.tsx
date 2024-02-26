'use client';
import React, { useState } from 'react';
import ChessBoard from "./ChessBoard";
import DisplayEval from './DisplayEval';
import ChessButton from '../Button';


interface GameHeaders {
    event?: string;
    site?: string;
    date?: string;
    round?: string;
    white?: string;
    black?: string;
    // Add any other optional properties as needed.
}

interface PositionAnalysis {
    fen: string;
    complexity: number;
    evaluation: number;
}

interface GameAnalysisResponse {
    gameHeaders: GameHeaders;
    positionAnalysis: PositionAnalysis[];
}

const AnalyzeGame: React.FC = () => {
    const [pgn, setPgn] = useState("");
    const [currentFEN, setCurrentFEN] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [analysisData, setAnalysisData] = useState<GameAnalysisResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false); // Added state to track API call status

    const fetchGameAnalysis = async () => {
        setIsAnalyzing(true); // Start of API call
        const url = 'https://elocator.fly.dev/analyze-game/';
        const data = JSON.stringify({ pgn: pgn });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data,
            });

            if (response.ok) {
                const jsonData: GameAnalysisResponse = await response.json();
                setAnalysisData(jsonData);
                setCurrentFEN(jsonData.positionAnalysis[0].fen);
                setCurrentIndex(0); // Reset to the first position
            } else {
                console.error('Error fetching game analysis');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setIsAnalyzing(false); // End of API call
    };

    const moveToPosition = (index: number) => {
        if (analysisData) {
            const newIndex = Math.min(Math.max(index, 0), analysisData.positionAnalysis.length - 1);
            setCurrentIndex(newIndex);
            setCurrentFEN(analysisData.positionAnalysis[newIndex].fen);
        }
    };
    const buttonStyle = "w-12 bg-primary border-2 border-black text-black font-bold py-2 px-4 rounded hover:bg-black hover:text-white transition duration-300 ease-in-out";

    return (
        <>
            <p className="text-2xl font-bold">Enter the PGN for the game to analyze.</p>
            <textarea
                className="w-3/4 h-32 p-4 rounded-lg border-2 border-gray-300 text-black"
                placeholder="Paste PGN here"
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
            />
            <ChessButton
                text={isAnalyzing ? 'Analyzing Game...' : 'Get Game Analysis'}
                onClick={fetchGameAnalysis}
                disabled={isAnalyzing} // Button is disabled when API call is in progress
            >
                
            </ChessButton>

            <div className="flex flex-col items-center justify-between p-4">
                <ChessBoard fen={currentFEN} />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button className={buttonStyle} onClick={() => moveToPosition(0)}>&lt;&lt;</button>
                <button className={buttonStyle} onClick={() => moveToPosition(currentIndex - 1)}>&lt;</button>
                <button className={buttonStyle} onClick={() => moveToPosition(currentIndex + 1)}>&gt;</button>
                <button className={buttonStyle} onClick={() => moveToPosition(analysisData ? analysisData.positionAnalysis.length - 1 : 0)}>&gt;&gt;</button>
            </div>
            <div style={{ minWidth: '300px', marginTop: '10px' }}>
                Current FEN: {currentFEN}<br />
                Complexity Score: {analysisData?.positionAnalysis[currentIndex]?.complexity || "N/A"}<br />
                Position Evaluation: {analysisData?.positionAnalysis[currentIndex]?.evaluation || "N/A"}
            </div>
            {analysisData && <DisplayEval positionAnalysis={analysisData.positionAnalysis} />}

        </>
    );
}

export default AnalyzeGame;
