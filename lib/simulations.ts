import { cacheLife, cacheTag } from 'next/cache'
import { createKysely } from '@vercel/postgres-kysely'
import { sql } from 'kysely'

interface Database {
  candidates_2024: any;
  womens_candidates_2024: any;
  candidates_2026: any;
  womens_candidates_2026: any;
}

export type EventTable = 'candidates_2024' | 'womens_candidates_2024' | 'candidates_2026' | 'womens_candidates_2026'

export type SimulationRow = {
  winner: string;
  Round: string;
  win_count: number;
}

export type SimulationFilter = {
  gameKey: string;
  outcome: number;
}

/**
 * Fetch simulation data for a tournament with no game filters applied.
 * Cached with 'hours' profile via Next.js Cache Components.
 */
export async function getBaseSimulationData(
  eventTable: EventTable,
  limitSims: number = 10000
): Promise<SimulationRow[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(`sims-${eventTable}`)

  const db = createKysely<Database>()

  const numberedSubquery = db
    .selectFrom(eventTable)
    .selectAll()
    .select(sql`ROW_NUMBER() OVER (PARTITION BY "Round" ORDER BY RANDOM())`.as('rn'))
    .as('numbered')

  const results = await db.selectFrom(numberedSubquery)
    .select(({ fn }) => [
      'winner',
      'Round',
      fn.count<number>('winner').as('win_count'),
    ])
    .where('rn', '<=', limitSims)
    .groupBy(['winner', 'Round'])
    .execute()

  return results as SimulationRow[]
}

/**
 * Fetch filtered simulation data for a specific set of game outcome filters.
 * Returns only the "Simulated" round — combine with getBaseSimulationData() for full results.
 * Cached with 'hours' profile; cache key auto-generated from serialized arguments.
 */
export async function getSimulatedRoundData(
  eventTable: EventTable,
  filters: SimulationFilter[],
  limitSims: number = 10000
): Promise<SimulationRow[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(`sims-filtered-${eventTable}`)

  if (filters.length === 0) return []

  const db = createKysely<Database>()

  // Find the highest round to filter against
  const roundsUnique = await db.selectFrom(eventTable).select('Round').distinct().execute()
  const highestRound = Math.max(...roundsUnique.map(({ Round }: any) => Round.match(/\d+/)?.[0] || 0).map(Number))
  const highestRoundStr = highestRound === 0 ? 'Pre' : String(highestRound)

  // Build filtered subquery: apply game outcome filters, then sample up to limitSims
  let simSubquery = db.selectFrom(eventTable).selectAll() as any
  filters.forEach((filter) => {
    simSubquery = simSubquery.where(filter.gameKey, '=', filter.outcome)
  })
  simSubquery = simSubquery
    .where('Round', '=', highestRoundStr)
    .orderBy(sql`RANDOM()`)
    .limit(limitSims)

  const simulated = await (db.selectFrom(simSubquery.as('sim_sub')) as any)
    .select(({ fn, val }: any) => [
      'winner',
      val('Simulated').as('Round'),
      fn.count('winner').as('win_count'),
    ])
    .groupBy(['winner', 'Round'])
    .execute()

  return simulated as SimulationRow[]
}
