import { NextRequest, NextResponse } from "next/server";
import { getBaseSimulationData, getSimulatedRoundData, type EventTable, type SimulationFilter } from "@/lib/simulations";

const VALID_TABLES = new Set(['candidates_2024', 'womens_candidates_2024', 'candidates_2026', 'womens_candidates_2026']);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const eventTable = searchParams.get('eventTable');
        const filtersParam = searchParams.get('filters');
        let limitSims = parseInt(searchParams.get('limit') || '10000', 10);

        if (!eventTable || !VALID_TABLES.has(eventTable)) {
            return NextResponse.json({ error: "Invalid eventTable" }, { status: 400 });
        }

        if (limitSims > 10000) limitSims = 10000;

        // Parse filters from "gameKey:outcome,gameKey:outcome" format (already sorted by client)
        const filters: SimulationFilter[] = [];
        if (filtersParam) {
            for (const pair of filtersParam.split(',')) {
                const lastColon = pair.lastIndexOf(':');
                if (lastColon === -1) continue;
                filters.push({
                    gameKey: pair.slice(0, lastColon),
                    outcome: parseFloat(pair.slice(lastColon + 1)),
                });
            }
        }

        const history = await getBaseSimulationData(eventTable as EventTable, limitSims);
        const simulated = await getSimulatedRoundData(eventTable as EventTable, filters, limitSims);

        return NextResponse.json([...history, ...simulated], {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json(
            { error: "Internal Server Error", details: e.message },
            { status: 500 },
        );
    }
}
