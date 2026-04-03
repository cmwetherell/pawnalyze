'use client';
import React, { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from './ChessBoard';
import ComplexityBar from './ComplexityBar';
import DisplayEval from './DisplayEval';

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

    const firstLine = trimmed.split('\n')[0].trim();
    const fenParts = firstLine.split(/\s+/);
    const ranks = fenParts[0].split('/');
    if (ranks.length === 8 && /^[rnbqkpRNBQKP1-8]+$/.test(ranks.join(''))) {
        return 'fen';
    }

    if (/\[\w+\s+"[^"]*"\]/.test(trimmed) || /\d+\./.test(trimmed)) {
        return 'pgn';
    }

    return 'error';
}

function parsePgnToFens(pgn: string): string[] {
    try {
        const game = new Chess();
        game.loadPgn(pgn);
        const moves = game.history();
        const replay = new Chess();
        const fens = [replay.fen()];
        for (const move of moves) {
            replay.move(move);
            fens.push(replay.fen());
        }
        return fens;
    } catch {
        return [];
    }
}

const UnifiedAnalyzer: React.FC = () => {
    const startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    const [input, setInput] = useState('');
    const [inputType, setInputType] = useState<InputType>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [fen, setFen] = useState(startingFEN);
    const [complexityScore, setComplexityScore] = useState('');

    const [currentFEN, setCurrentFEN] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [analysisData, setAnalysisData] = useState<GameAnalysisResponse | null>(null);

    // Preview state: positions parsed client-side before analysis
    const [previewFens, setPreviewFens] = useState<string[]>([]);

    const handleInputChange = useCallback((value: string) => {
        setInput(value);
        setErrorMessage('');

        const detected = detectInputType(value);
        if (value.trim() === '') {
            setInputType(null);
            setPreviewFens([]);
            setFen(startingFEN);
            return;
        }

        if (detected === 'fen') {
            const fenStr = value.trim().split('\n')[0].trim();
            setInputType('fen');
            setFen(fenStr);
            setPreviewFens([]);
            setAnalysisData(null);
        } else if (detected === 'pgn') {
            const fens = parsePgnToFens(value);
            if (fens.length > 0) {
                setInputType('pgn');
                setPreviewFens(fens);
                setCurrentFEN(fens[0]);
                setCurrentIndex(0);
            }
        }
    }, [startingFEN]);

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

        if (detected === 'error') {
            setInputType('error');
            setErrorMessage('Could not detect input format. Please enter a valid FEN string or PGN game.');
            return;
        }

        setIsAnalyzing(true);
        if (detected === 'fen') {
            const fenStr = input.trim().split('\n')[0].trim();
            await fetchComplexityScore(fenStr);
        } else {
            await fetchGameAnalysis(input);
        }
        setIsAnalyzing(false);
    };

    const moveToPosition = (index: number) => {
        // Use analysis data if available, otherwise use preview fens
        const positions = analysisData?.positionAnalysis;
        const totalPositions = positions ? positions.length : previewFens.length;
        if (totalPositions === 0) return;

        const newIndex = Math.min(Math.max(index, 0), totalPositions - 1);
        setCurrentIndex(newIndex);
        setCurrentFEN(positions ? positions[newIndex].fen : previewFens[newIndex]);
    };

    const navBtnClass = "w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-chess-gold hover:border-chess-gold/30 transition-colors font-bold text-sm";

    return (
        <div className="space-y-6">
            {/* Input */}
            <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Enter a FEN or PGN to analyze
                </label>
                <textarea
                    className="w-full h-32 p-4 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-chess-gold/40 focus:border-chess-gold/40 transition-colors"
                    placeholder="Paste a FEN or PGN here..."
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
            </div>

            {errorMessage && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {errorMessage}
                </div>
            )}

            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isAnalyzing
                        ? 'bg-[var(--bg-surface-3)] text-[var(--text-muted)] cursor-not-allowed'
                        : 'bg-chess-gold text-chess-dark hover:bg-chess-gold-light hover:shadow-gold'
                }`}
            >
                {isAnalyzing && (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>

            {/* Default starting position */}
            {inputType === null && (
                <div className="flex justify-center">
                    <ChessBoard fen={startingFEN} />
                </div>
            )}

            {/* FEN result */}
            {inputType === 'fen' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex justify-center">
                        <ChessBoard fen={fen} />
                    </div>
                    <div className="space-y-4">
                        {complexityScore !== '' ? (
                            <>
                                <div>
                                    <p className="text-sm text-[var(--text-muted)] mb-1">Complexity Score</p>
                                    <p className="text-4xl font-heading text-[var(--text-primary)]">
                                        {complexityScore} <span className="text-lg text-[var(--text-muted)]">/ 100</span>
                                    </p>
                                </div>
                                <ComplexityBar score={Number(complexityScore)} />
                            </>
                        ) : (
                            <p className="text-[var(--text-muted)]">Click Analyze to get the complexity score</p>
                        )}
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">FEN</p>
                            <code className="text-xs text-[var(--text-secondary)] font-mono break-all">{fen}</code>
                        </div>
                    </div>
                </div>
            )}

            {/* PGN result */}
            {inputType === 'pgn' && (() => {
                const totalPositions = analysisData?.positionAnalysis.length || previewFens.length;
                return (
                <div className="space-y-6">
                    {/* Game header info */}
                    {analysisData?.gameHeaders && (
                        <div className="flex flex-wrap gap-2">
                            {analysisData.gameHeaders.white && (
                                <span className="px-3 py-1 rounded-full text-xs bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border)]">
                                    {analysisData.gameHeaders.white} vs {analysisData.gameHeaders.black}
                                </span>
                            )}
                            {analysisData.gameHeaders.event && (
                                <span className="px-3 py-1 rounded-full text-xs bg-[var(--bg-surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                                    {analysisData.gameHeaders.event}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Board + nav */}
                    <div className="flex flex-col items-center gap-4">
                        <ChessBoard fen={currentFEN} />
                        <div className="flex items-center gap-2">
                            <button className={navBtnClass} onClick={() => moveToPosition(0)}>&laquo;</button>
                            <button className={navBtnClass} onClick={() => moveToPosition(currentIndex - 1)}>&lsaquo;</button>
                            <span className="px-3 text-sm text-[var(--text-muted)]">
                                {currentIndex + 1} / {totalPositions}
                            </span>
                            <button className={navBtnClass} onClick={() => moveToPosition(currentIndex + 1)}>&rsaquo;</button>
                            <button className={navBtnClass} onClick={() => moveToPosition(totalPositions - 1)}>&raquo;</button>
                        </div>
                    </div>

                    {/* Stats panel */}
                    {analysisData && (
                    <div className="surface-card p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-[var(--text-muted)]">Complexity</p>
                                <p className="text-lg font-heading text-[var(--text-primary)]">
                                    {analysisData.positionAnalysis[currentIndex]?.complexity ?? "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-muted)]">Evaluation</p>
                                <p className="text-lg font-heading text-[var(--text-primary)]">
                                    {analysisData.positionAnalysis[currentIndex]?.evaluation ?? "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-muted)]">Move</p>
                                <p className="text-lg font-heading text-[var(--text-primary)]">
                                    {currentIndex + 1}
                                </p>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Charts */}
                    {analysisData && <DisplayEval positionAnalysis={analysisData.positionAnalysis} />}
                </div>
                );
            })()}
        </div>
    );
};

export default UnifiedAnalyzer;
