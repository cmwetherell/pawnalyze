import { cacheLife, cacheTag } from 'next/cache'
import { createKysely } from '@vercel/postgres-kysely'
import { sql } from 'kysely'

interface Database {
  candidates_2024: any;
  womens_candidates_2024: any;
  candidates_2026: any;
  womens_candidates_2026: any;
}

export type SimulationRow = {
  winner: string;
  Round: string;
  win_count: number;
}

/**
 * Fetch simulation data for a tournament with no game filters applied.
 * Cached with 'hours' profile via Next.js Cache Components.
 */
export async function getBaseSimulationData(
  eventTable: 'candidates_2024' | 'womens_candidates_2024' | 'candidates_2026' | 'womens_candidates_2026',
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
