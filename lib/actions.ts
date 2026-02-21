'use server'

import { Game } from '@/types'
import { getBaseSimulationData, getSimulatedRoundData, type EventTable, type SimulationFilter, type SimulationRow } from './simulations'

function convertGame(game: Game): SimulationFilter {
  let outcome: number
  switch (game.outcome) {
    case 'black':
      outcome = 0.0
      break
    case 'white':
      outcome = 1.0
      break
    case 'draw':
      outcome = 0.5
      break
    default:
      outcome = 0.0
  }
  return {
    gameKey: game.whitePlayer.slice(0, 3) + '|' + game.blackPlayer.slice(0, 3),
    outcome,
  }
}

export async function fetchSimulationData(
  gameFilters: Game[],
  limitSims: number,
  eventTable: string,
): Promise<SimulationRow[]> {
  if (limitSims > 10000) limitSims = 10000

  const convertedFilters = gameFilters.map(convertGame)

  const history = await getBaseSimulationData(eventTable as EventTable, limitSims)
  const simulated = await getSimulatedRoundData(eventTable as EventTable, convertedFilters, limitSims)

  return [...history, ...simulated]
}
