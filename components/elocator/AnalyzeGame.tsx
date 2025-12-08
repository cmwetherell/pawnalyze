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
    const navButtonStyle =
        "flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-paper transition hover:border-mint/60 hover:text-mint";

    return (
        <div className="space-y-4">
            <p className="text-center text-sm uppercase tracking-[0.4em] text-slate">Paste PGN to analyze entire games</p>
            <textarea
                className="h-32 w-full rounded-2xl border border-white/15 bg-black/30 p-4 text-paper placeholder:text-slate focus:border-mint/60 focus:outline-none"
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

            <div className="flex flex-col items-center justify-between rounded-2xl border border-white/10 bg-ink-soft/70 p-4">
                <ChessBoard fen={currentFEN} />
            </div>
            <div className="mt-4 flex justify-center gap-3">
                <button className={navButtonStyle} onClick={() => moveToPosition(0)}>&lt;&lt;</button>
                <button className={navButtonStyle} onClick={() => moveToPosition(currentIndex - 1)}>&lt;</button>
                <button className={navButtonStyle} onClick={() => moveToPosition(currentIndex + 1)}>&gt;</button>
                <button className={navButtonStyle} onClick={() => moveToPosition(analysisData ? analysisData.positionAnalysis.length - 1 : 0)}>&gt;&gt;</button>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate">
                <p className="font-mono text-xs text-paper">Current FEN: {currentFEN || "N/A"}</p>
                <p>Complexity score: {analysisData?.positionAnalysis[currentIndex]?.complexity || "N/A"}</p>
                <p>Position evaluation: {analysisData?.positionAnalysis[currentIndex]?.evaluation || "N/A"}</p>
            </div>
            {analysisData && <DisplayEval positionAnalysis={analysisData.positionAnalysis} />}

        </div>
    );
}

export default AnalyzeGame;
