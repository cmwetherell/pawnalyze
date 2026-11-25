import { positionOf, sideToMove, type Position } from './input';

const API = 'https://elocator.fly.dev';

const post = (path: string, body: object) => fetch(`${API}/${path}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Score of one position, or the words to show instead of a number. */
export async function fetchComplexity(fen: string): Promise<{ score: number } | { error: string }> {
  try {
    const res = await post('complexity', { fen });
    if (!res.ok) return { error: 'Error fetching complexity score' };
    const { complexity_score: score } = await res.json() as { complexity_score: unknown };
    // The API answers some positions with words; they are never shown as a number.
    const n = typeof score === 'number' ? score : Number(score);
    return Number.isFinite(n) && score !== null && score !== '' ? { score: n } : { error: String(score ?? 'Error fetching complexity score') };
  } catch (error) {
    console.error('Error:', error);
    return { error: 'Error fetching complexity score' };
  }
}

interface GameResponse {
  gameHeaders?: Record<string, string | undefined>;
  positionAnalysis: { fen: string; complexity: number }[];
}

export interface GameAnalysis { white: string | null; black: string | null; event: string | null; positions: Position[] }

/** Scores every position of a game. Moves come from our own replay of it, where that worked. */
export async function analyzeGame(pgn: string, replay: Position[]): Promise<GameAnalysis | { error: string }> {
  const failed = { error: 'Error fetching game analysis. Check the PGN and try again.' };
  try {
    const res = await post('analyze-game', { pgn });
    if (!res.ok) return failed;
    const data = await res.json() as GameResponse;
    if (!data.positionAnalysis?.length) return failed;
    const tag = (name: string) => {
      const v = data.gameHeaders?.[name] ?? data.gameHeaders?.[name.toLowerCase()];
      return v && !/^\?+$/.test(v) ? v : null;
    };
    const known = replay.length === data.positionAnalysis.length;
    return {
      white: tag('White'), black: tag('Black'), event: tag('Event'),
      positions: data.positionAnalysis.map(({ fen, complexity }, ply) => ({ ...(known ? replay[ply] : positionOf(fen)), ply, fen, toMove: sideToMove(fen), complexity })),
    };
  } catch (error) {
    console.error('Error:', error);
    return failed;
  }
}
