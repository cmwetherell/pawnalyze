import type { Game } from '@/types';

/**
 * The 14 games of Ding vs Gukesh, Singapore 2024. The results are the ones the final simulations in the `wcc24` table were
 * run from: every stored simulation after round 14 has exactly these.
 */
const RESULTS = ['black', 'draw', 'white', 'draw', 'draw', 'draw', 'draw', 'draw', 'draw', 'draw', 'white', 'white', 'draw', 'black'] as const;

/** Gukesh has White in the odd games. A game after the last simulated round has no result here: it can still be picked. */
export function games2024(roundsPlayed: number): Game[] {
  return RESULTS.map((result, i) => ({
    id: `game${i + 1}`,
    whitePlayer: i % 2 === 0 ? 'Gukesh D' : 'Ding Liren',
    blackPlayer: i % 2 === 0 ? 'Ding Liren' : 'Gukesh D',
    outcome: i < roundsPlayed ? result : null,
    round: i + 1,
  }));
}
