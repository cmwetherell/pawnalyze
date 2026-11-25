import { START_FEN } from '@/lib/live/pgn';
import goc from './game-of-the-century.json';
import { sideToMove, type Position } from './input';

export interface ExamplePosition { label: 'Low' | 'Medium' | 'High'; name: string; fen: string; /** From the Elocator API. */ score: number }

export const EXAMPLE_POSITIONS: ExamplePosition[] = [
  { label: 'Low', name: 'Start position', fen: START_FEN, score: 3 },
  { label: 'Medium', name: 'Middlegame', fen: 'r1bq1nk1/4r2p/pp2pNpQ/2ppP3/8/2PB4/PP3PPP/R3R1K1 b - - 2 21', score: 58 },
  { label: 'High', name: 'Sharp position', fen: '2kr3r/ppqb4/3p1b1p/2pPnpp1/NPP1p1nP/6PB/PB2PPN1/2RQ1RK1 w - - 0 1', score: 100 },
];

const TAGS = `[Event "Third Rosenwald Trophy"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[EventDate "1956.10.07"]
[Round "8"]
[Result "0-1"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[ECO "D92"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "82"]`;

const LINES = `1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5
6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4
11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3
16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+
21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1
26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5
31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+
36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+
41. Kc1 Rc2# 0-1`;

const positions = (goc as { ply: number; san?: string; from?: string; to?: string; fen: string; c: number }[]).map((p): Position => ({
  ply: p.ply, san: p.san ?? null, from: p.from ?? null, to: p.to ?? null, fen: p.fen, toMove: sideToMove(p.fen), complexity: p.c,
}));

/** Byrne against Fischer, with Elocator's score of every position. */
export const EXAMPLE_GAME = {
  title: 'The Game of the Century',
  players: 'Donald Byrne vs. Robert James Fischer',
  event: 'Third Rosenwald Trophy, 1956',
  pgn: `${TAGS}\n\n${LINES}`,
  moves: LINES.replace(/\n/g, ' '),
  positions,
  /** The hardest position of the game: after 17. Kf1. */
  showcasePly: 33,
};
