'use client';
import React, { useState } from 'react';
import ChessBoard from './ChessBoard';
import ComplexityBar from './ComplexityBar';
import DisplayEval from './DisplayEval';
import ChessButton from '../Button';

interface GameHeaders {
    event?: string;
    site?: string;
    date?: string;
    round?: string;
    white?: string;
    black?: string;
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

type InputType = 'fen' | 'pgn' | 'error' | null;

function detectInputType(input: string): 'fen' | 'pgn' | 'error' {
    const trimmed = input.trim();
    if (!trimmed) return 'error';

    // FEN: first token has 8 ranks separated by /, with valid piece characters
    const firstLine = trimmed.split('\n')[0].trim();
    const fenParts = firstLine.split(/\s+/);
    const ranks = fenParts[0].split('/');
    if (ranks.length === 8 && /^[rnbqkpRNBQKP1-8]+$/.test(ranks.join(''))) {
        return 'fen';
    }

    // PGN: has headers like [Event "..."] or move numbers like "1."
    if (/\[\w+\s+"[^"]*"\]/.test(trimmed) || /\d+\./.test(trimmed)) {
        return 'pgn';
    }

    return 'error';
}

const UnifiedAnalyzer: React.FC = () => {
    const startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    const [input, setInput] = useState('');
    const [inputType, setInputType] = useState<InputType>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // FEN state
    const [fen, setFen] = useState(startingFEN);
    const [complexityScore, setComplexityScore] = useState('');

    // PGN state
    const [currentFEN, setCurrentFEN] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [analysisData, setAnalysisData] = useState<GameAnalysisResponse | null>(null);

    const fetchComplexityScore = async (fenStr: string) => {
        const url = 'https://elocator.fly.dev/complexity/';
        fenStr = fenStr === '' ? startingFEN : fenStr;
        const data = JSON.stringify({ fen: fenStr });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: data,
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                setComplexityScore(`${jsonResponse.complexity_score}`);
            } else {
                setComplexityScore('Error fetching complexity score');
            }
        } catch (error) {
            console.error('Error:', error);
            setComplexityScore('Error fetching complexity score');
        }
    };

    const fetchGameAnalysis = async (pgn: string) => {
        const url = 'https://elocator.fly.dev/analyze-game/';
        const data = JSON.stringify({ pgn });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: data,
            });

            if (response.ok) {
                const jsonData: GameAnalysisResponse = await response.json();
                setAnalysisData(jsonData);
                setCurrentFEN(jsonData.positionAnalysis[0].fen);
                setCurrentIndex(0);
            } else {
                console.error('Error fetching game analysis');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAnalyze = async () => {
        setErrorMessage('');
        const detected = detectInputType(input);
        setInputType(detected);

        if (detected === 'error') {
            setErrorMessage('Could not detect input format. Please enter a valid FEN string or PGN game.');
            return;
        }

        setIsAnalyzing(true);
        if (detected === 'fen') {
            const fenStr = input.trim().split('\n')[0].trim();
            setFen(fenStr);
            await fetchComplexityScore(fenStr);
        } else {
            await fetchGameAnalysis(input);
        }
        setIsAnalyzing(false);
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
            <p className="text-2xl font-bold">Enter a FEN or PGN to analyze below.</p>
            <textarea
                className="w-full max-w-[400px] h-32 p-4 rounded-lg border-2 border-gray-300 text-black"
                placeholder="Paste a FEN or PGN here"
                value={input}
                onChange={(e) => { setInput(e.target.value); setErrorMessage(''); }}
            />
            {errorMessage && (
                <p className="text-red-500 font-semibold mt-2">{errorMessage}</p>
            )}
            <ChessButton
                text={isAnalyzing ? 'Analyzing...' : 'Analyze'}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
            />

            {/* Default starting position when no analysis has run */}
            {inputType === null && (
                <div className="mt-3">
                    <ChessBoard fen={startingFEN} />
                </div>
            )}

            {/* FEN result */}
            {inputType === 'fen' && (
                <>
                    <div className="mt-3"></div>
                    <ChessBoard fen={fen} />
                    <div id="complexityScore" style={{ marginTop: '10px' }}>
                        {complexityScore !== '' ? (
                            <>
                                Complexity Score: {complexityScore}
                                <ComplexityBar score={Number(complexityScore)} />
                            </>
                        ) : (
                            'Complexity score not available'
                        )}
                    </div>
                    <div>Current FEN: {fen}</div>
                </>
            )}

            {/* PGN result */}
            {inputType === 'pgn' && (
                <>
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
            )}
        </>
    );
};

export default UnifiedAnalyzer;
