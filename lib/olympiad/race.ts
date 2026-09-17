import { N_PRIZE_BOARDS, N_ROUNDS } from './config';
import { eligibility, performanceRating, type RatedGame } from './tpr';
import type { BoardRace, BoardRaceRowLite, BoardRaceSummary, FormEntry, Game, OlympiadEvent, Player, PlayerRaceRow, Team } from './types';

interface Roster {
  player: Player;
  team: Team;
}

function scoreFor(result: string, colour: 'w' | 'b'): 0 | 0.5 | 1 | null {
  if (result === '1/2-1/2') return 0.5;
  if (result === '1-0') return colour === 'w' ? 1 : 0;
  if (result === '0-1') return colour === 'w' ? 0 : 1;
  return null;
}

/** Rank order for a board: TPR desc, then games desc (Regs App. 2.III TB1), then name. */
function compareRows(a: { tpr: number | null; games: number; name: string }, b: { tpr: number | null; games: number; name: string }): number {
  if (a.tpr === null || b.tpr === null) return a.tpr === null ? (b.tpr === null ? 0 : 1) : -1;
  return b.tpr - a.tpr || b.games - a.games || a.name.localeCompare(b.name);
}

/**
 * Pure aggregation behind getOlympiadBoardRace. Players are matched to games by FIDE id and
 * to teams through the current roster (ghost roster rows from earlier numberings are excluded
 * by passing only the teams in the current run).
 */
export function buildBoardRace(event: OlympiadEvent, games: Game[], players: Player[], teams: Team[], lastFinalRound: number): BoardRace {
  const teamById = new Map(teams.map(t => [t.teamId, t]));
  const roster = new Map<number, Roster>();
  for (const p of players) {
    const team = teamById.get(p.teamId);
    if (!team || p.fideId === null || roster.has(p.fideId)) continue;
    roster.set(p.fideId, { player: p, team });
  }

  const played = games.filter(g => g.result !== '*');
  const lastRound = played.reduce((m, g) => Math.max(m, g.round), 0);
  const finalRound = Math.max(lastFinalRound, lastRound);

  // Per player: chronological form entries
  const form = new Map<number, FormEntry[]>();
  const ratingOf = new Map<number, number>();
  const push = (fideId: number | null, entry: FormEntry, ownRating: number) => {
    if (fideId === null || !roster.has(fideId)) return;
    (form.get(fideId) ?? form.set(fideId, []).get(fideId)!).push(entry);
    if (!ratingOf.has(fideId)) ratingOf.set(fideId, ownRating);
  };
  for (const g of played) {
    const ws = scoreFor(g.result, 'w');
    if (ws === null) continue;
    const bs = (1 - ws) as 0 | 0.5 | 1;
    const wr = g.blackFideId !== null ? roster.get(g.blackFideId) : undefined;
    const br = g.whiteFideId !== null ? roster.get(g.whiteFideId) : undefined;
    push(g.whiteFideId, {
      round: g.round, colour: 'w', score: ws, oppFideId: g.blackFideId, oppName: g.blackName,
      oppFedCode: wr?.team.fedCode ?? null, oppTeamId: wr?.team.teamId ?? null, oppRating: g.blackElo,
    }, g.whiteElo);
    push(g.blackFideId, {
      round: g.round, colour: 'b', score: bs, oppFideId: g.whiteFideId, oppName: g.whiteName,
      oppFedCode: br?.team.fedCode ?? null, oppTeamId: br?.team.teamId ?? null, oppRating: g.whiteElo,
    }, g.blackElo);
  }

  const rated = (entries: FormEntry[]): RatedGame[] => entries.map(e => ({ oppRating: e.oppRating, score: e.score }));

  const boards: PlayerRaceRow[][] = Array.from({ length: N_PRIZE_BOARDS }, () => []);
  for (const [fideId, { player, team }] of roster) {
    const entries = (form.get(fideId) ?? []).sort((a, b) => a.round - b.round);
    const perf = performanceRating(rated(entries));
    const elig = eligibility(entries.length, finalRound);
    const tprByRound: (number | null)[] = [];
    for (let r = 1; r <= lastRound; r++) {
      const upTo = entries.filter(e => e.round <= r);
      tprByRound.push(performanceRating(rated(upTo))?.tpr ?? null);
    }
    const board = Math.min(Math.max(player.board, 1), N_PRIZE_BOARDS);
    boards[board - 1].push({
      fideId, name: player.name, title: player.title, teamId: team.teamId, teamName: team.name, fedCode: team.fedCode,
      board, rating: ratingOf.get(fideId) ?? player.rating,
      tpr: perf?.tpr ?? null, avgOpp: perf?.avgOpp ?? null, score: perf?.score ?? 0, games: entries.length,
      eligible: elig.eligible, needed: elig.needed, canReach: elig.canReach,
      rank: null, prevRank: null, form: entries, tprByRound, rankByRound: [],
    });
  }

  const ranked: number[] = [];
  for (const rows of boards) {
    rows.sort(compareRows);
    let n = 0;
    rows.forEach(r => { r.rank = r.tpr === null ? null : ++n; });
    ranked.push(n);
    // Ranks after each earlier round (same tiebreak) for trend and movers
    for (let r = 1; r <= lastRound; r++) {
      const snapshot = rows
        .map(row => ({ row, tpr: row.tprByRound[r - 1] ?? null, games: row.form.filter(e => e.round <= r).length, name: row.name }))
        .sort(compareRows);
      let k = 0;
      for (const s of snapshot) s.row.rankByRound[r - 1] = s.tpr === null ? null : ++k;
    }
    if (lastRound >= 2) rows.forEach(r => { r.prevRank = r.rankByRound[lastRound - 2] ?? null; });
  }

  return {
    event, lastRound, lastFinalRound: finalRound, roundsLeft: Math.max(0, N_ROUNDS - finalRound), boards, ranked,
  };
}

export function liteRow(row: PlayerRaceRow): BoardRaceRowLite {
  const { tprByRound: _t, rankByRound: _r, form, ...rest } = row;
  return { ...rest, form: form.map(f => ({ round: f.round, colour: f.colour, score: f.score, oppFedCode: f.oppFedCode, oppRating: f.oppRating })) };
}

/** The compact, client-safe view of a race: podiums, counts and a search index. */
export function summarizeRace(race: BoardRace): BoardRaceSummary {
  return {
    event: race.event,
    lastRound: race.lastRound,
    lastFinalRound: race.lastFinalRound,
    roundsLeft: race.roundsLeft,
    ranked: race.ranked,
    podium: race.boards.map(rows => rows.slice(0, 3).map(liteRow)),
    index: race.boards.flat().map(r => ({ fideId: r.fideId, name: r.name, title: r.title, fedCode: r.fedCode, teamId: r.teamId, board: r.board, tpr: r.tpr })),
  };
}
