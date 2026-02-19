import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/types";
import { createKysely } from "@vercel/postgres-kysely";

interface Database {
  candidates_2024: any; // see github.com/kysely-org/kysely
  womens_candidates_2024: any;
  candidates_2026: any;
  womens_candidates_2026: any;
}

interface Sim {
    winner: string;
    second: string;
    tie: string;
    Round: string; // Added to include the "Round" field from the database
}


export async function POST(req: NextRequest) {
    const startTime = Date.now();
    try {
        if (req.method !== "POST") {
            return new NextResponse(JSON.stringify({ message: "Method Not Allowed" }), {
                status: 405,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const body = await req.json();
        let { gameFilters, limitSims, eventTable } = body;
    
        if (limitSims > 10000) {
            limitSims = 10000;
        }
    
        const convertGame = (game: Game) => {
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
                whitePlayer: game.whitePlayer,
                blackPlayer: game.blackPlayer,
                outcome: outcome,
            };
        }

        // some ntoes to myself: if the converted game filters length is more than 4 * n-1 rounds (exclude pre), then do simulation stuff, otherwise, sample 10k records from each roubnd and concatenate?
    
        const convertedGameFilters = gameFilters.map(convertGame);

        // print len of convertedGameFilters
        console.log("filters: ", convertedGameFilters)

        const db = createKysely<Database>();

        let queryRounds = db.selectFrom(eventTable).select('Round').distinct();
        
        const RoundsUnique = await queryRounds.execute();
        const highestRound = Math.max(...RoundsUnique.map(({ Round }) => Round.match(/\d+/)?.[0] || 0).map(Number));
        const highestRoundStr = highestRound === 0 ? 'Pre' : String(highestRound);
        const countOfRounds = RoundsUnique.length;

        limitSims *= countOfRounds;

        let subquery = db
            .selectFrom(eventTable)
            .selectAll()
            // .limit(limitSims)
            .as('sub');

        let query = db.selectFrom(subquery).select(({ fn, val, ref }) => [
            'winner',
            'Round',
            fn.count<number>('winner').as('win_count'),
        ]);
    
        // convertedGameFilters.forEach((filter: { gameKey: any, outcome: any; }) => {
        //     query = query.where(filter.gameKey, '=', filter.outcome)
        // });
        
        query = query.groupBy(['winner', 'Round']);

        const history = await query.execute();

        let predictions = []

        //  write code for if len gameFilters > 0
        if (convertedGameFilters.length > 0) {
            let querySim = db.selectFrom(eventTable).select(({ fn, val, ref }) => [
                'winner',
                val("Simulated").as('Round'),
                fn.count<number>('winner').as('win_count'),
            ]);
            convertedGameFilters.forEach((filter: { gameKey: any, outcome: any; }) => {
                querySim = querySim.where(filter.gameKey, '=', filter.outcome)
            });
            querySim = querySim.where('Round', '=', highestRoundStr);
            querySim = querySim.groupBy(['winner', 'Round']);
            const simulated = await querySim.execute();

            // concatenate history and simulated into new object called "predictions"

            predictions = history.concat(simulated);
        }
        else {
            predictions = history;
        }

        // console.log(predictions);

        const endTime = Date.now(); // Capture end time
        // console.log(`Request to response time: ${endTime - startTime} ms`); // Log the time difference

        return new NextResponse(JSON.stringify(predictions), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (e: any) {
        console.error(e);
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error", details: e.message }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }
}
