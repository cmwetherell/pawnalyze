import type { Game } from '@/types';

export interface GameRound { round: number; games: Game[] }
export type Outcome = 'white' | 'draw' | 'black';

export const isPlayed = (r: GameRound): boolean => r.games.every(g => g.outcome !== undefined && g.outcome !== null);

export const SCORE: Record<string, string> = { white: '1–0', draw: '½–½', black: '0–1' };

/** 9.5 is "9½" */
export const pointsWord = (n: number): string => (n % 1 === 0 ? String(n) : `${Math.floor(n) || ''}½`);

/** Points a player has from the games played. */
export const scoreOf = (rounds: GameRound[], name: string): number =>
  rounds.flatMap(r => r.games).reduce((sum, g) => sum + (g.outcome === 'draw' && (g.whitePlayer === name || g.blackPlayer === name) ? 0.5 : (g.outcome === 'white' && g.whitePlayer === name) || (g.outcome === 'black' && g.blackPlayer === name) ? 1 : 0), 0);

/** "3 games selected across 2 rounds" */
export function pickedWords(picks: Game[]): string | null {
  if (picks.length === 0) return null;
  const rounds = new Set(picks.map(g => g.round)).size;
  return `${picks.length} game${picks.length === 1 ? '' : 's'} selected${rounds > 1 ? ` across ${rounds} rounds` : ''}`;
}

/** Sets, changes or (null) takes back the pick of one game. */
export function withPick(picks: Game[], game: Game, outcome: Outcome | null): Game[] {
  const rest = picks.filter(g => g.id !== game.id);
  return outcome === null ? rest : [...rest, { ...game, outcome }];
}
