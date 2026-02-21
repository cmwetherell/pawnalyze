import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/types";
import { getBaseSimulationData, getSimulatedRoundData, type EventTable, type SimulationFilter } from "@/lib/simulations";

function convertGame(game: Game): SimulationFilter {
    let outcome: number;
    switch (game.outcome) {
        case 'black':
            outcome = 0.0;
            break;
        case 'white':
            outcome = 1.0;
            break;
        case 'draw':
            outcome = 0.5;
            break;
        default:
            outcome = 0.0;
    }
    return {
        gameKey: game.whitePlayer.slice(0, 3) + "|" + game.blackPlayer.slice(0, 3),
        outcome: outcome,
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { gameFilters, limitSims, eventTable } = body;

        if (limitSims > 10000) {
            limitSims = 10000;
        }

        const convertedFilters: SimulationFilter[] = gameFilters.map(convertGame);

        // Both calls are cached — identical arguments return cached results
        const history = await getBaseSimulationData(eventTable as EventTable, limitSims);
        const simulated = await getSimulatedRoundData(eventTable as EventTable, convertedFilters, limitSims);

        const predictions = [...history, ...simulated];

        return NextResponse.json(predictions);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json(
            { error: "Internal Server Error", details: e.message },
            { status: 500 },
        );
    }
}
