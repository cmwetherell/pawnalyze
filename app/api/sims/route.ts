import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/types";

import { createKysely } from "@vercel/postgres-kysely";

interface Database {
  candidates_2024: any; // see github.com/kysely-org/kysely
}

interface Sim {
    winner: string;
    second: string;
    tie: string; // Updated to reflect the string type for tie
}


export async function POST(req: NextRequest) {
    try {
        // Ensure the request is a POST request
        if (req.method !== "POST") {
        return new NextResponse(
            JSON.stringify({ message: "Method Not Allowed" }),
            {
            status: 405,
            headers: {
                "Content-Type": "application/json",
            },
            },
        );
        }
        const body = await req.json();
        let { gameFilters, limitSims } = body;
    
        // cap limitSims to 10000
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
            // gameKey => first 3 letters of white name, |, first 3 letters of black name
            gameKey: game.whitePlayer.slice(0, 3) + "|" + game.blackPlayer.slice(0, 3),
            whitePlayer: game.whitePlayer,
            blackPlayer: game.blackPlayer,
            outcome: outcome,
        };
        }
    
        // Convert gameFilters to the expected format
        const convertedGameFilters = gameFilters.map(convertGame);

        const db = createKysely<Database>();

        // Start with a base query
        let query = db.selectFrom('candidates_2024').select(['winner', 'second', 'tie']);

        // Dynamically add where clauses based on convertedGameFilters
        convertedGameFilters.forEach((filter: { gameKey: any, outcome: any; }) => {
            query = query.where(filter.gameKey, '=', filter.outcome) // Example condition, adjust based on your actual data and requirements
        });

        // Limit the number of returned rows
        query = query.limit(limitSims);

        // Execute the query
        const sims = await query.execute();

        let totalGames = sims.length;

        let tieCount = 0;
        let winnerCounts: { [key: string]: number } = {};
        let secondCounts: { [key: string]: number } = {};

        sims.forEach((sim: Sim) => {
            tieCount += sim.tie === '1' ? 1 : 0; // Updated to compare with string '1'
            winnerCounts[sim.winner] = (winnerCounts[sim.winner] || 0) + 1;
            secondCounts[sim.second] = (secondCounts[sim.second] || 0) + 1;
        });

        let tiePercentage = (tieCount / totalGames) * 100;
        let secondPercentages: { [key: string]: number } = {};
        let winnerPercentages: { [key: string]: number } = {};

        for (let name in winnerCounts) {
            winnerPercentages[name] = (winnerCounts[name] / totalGames) * 100;
        }

        for (let name in secondCounts) {
            secondPercentages[name] = (secondCounts[name] / totalGames) * 100;
        }

        const response = {
            tiePercentage,
            winnerPercentages,
            secondPercentages,
            totalGames,
        };

        return new NextResponse(JSON.stringify(response), {
            status: 200,
            headers: {
            "Content-Type": "application/json",
            },
        });
        } catch (e: any) {
        console.error(e);
        return new NextResponse(
        JSON.stringify({ error: "Internal Server Error", details: e.message }),
        {
            status: 500,
            headers: {
            "Content-Type": "application/json",
            },
        },
        );
    }
    }



// export async function POST(req: NextRequest) {
//     const { rows } = await sql`SELECT * FROM candidates_2024 WHERE "Aba|Fir" = 1`;
//     const response = rows[0];
//     return new NextResponse(JSON.stringify(response), {
//         status: 200,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     }

// export async function POST(req: NextRequest) {
//     try {
//         // Ensure the request is a POST request
//         if (req.method !== "POST") {
//         return new NextResponse(
//             JSON.stringify({ message: "Method Not Allowed" }),
//             {
//             status: 405,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             },
//         );
//         }
//         const body = await req.json();
//         let { gameFilters, limitSims } = body;
    
//         // cap limitSims to 10000
//         if (limitSims > 10000) {
//         limitSims = 10000;
//         }
    
//         const convertGame = (game: Game) => {
//         let outcome: number;
//         switch (game.outcome) {
//             case 'black':
//             outcome = 0.0;
//             break;
//             case 'white':
//             outcome = 1.0;
//             break;
//             case 'draw':
//             outcome = 0.5;
//             break;
//             default:
//             outcome = 0.0;
//         }
        
//         return {
//             // gameKey => first 3 letters of white name, |, first 3 letters of black name
//             gameKey: game.whitePlayer.slice(0, 3) + "|" + game.blackPlayer.slice(0, 3),
//             whitePlayer: game.whitePlayer,
//             blackPlayer: game.blackPlayer,
//             outcome: outcome,
//         };
//         }
    
//         // Convert gameFilters to the expected format
//         const convertedGameFilters = gameFilters.map(convertGame);
//         console.log("Hello");
//         console.log(convertedGameFilters);

//         // Construct the WHERE clause dynamically based on the conditions from the request body
//         let whereClauses = convertedGameFilters.map((convertedGameFilters: { gameKey: any, outcome: any;}) => {
//             // Focus on gameKey and outcome, ensuring to escape appropriately to prevent SQL injection
//             const { gameKey, outcome } = convertedGameFilters; // Declare the 'gameKey' variable
//             return `"${gameKey}" = ${outcome}`;
//         });


//         // Join the conditions with 'AND' to form the complete WHERE clause
//         const whereClause = whereClauses.join(' AND ');
        
//         // Use the constructed WHERE clause in your SQL query
//         const query = `* FROM candidates_2024 WHERE ${whereClause}`;

//         console.log(query)

//         const { rows } = await sql`SELECT ${query} LIMIT ${limitSims}`;
//         console.log('Hello')
//         console.log(rows);

//         return new NextResponse(JSON.stringify(rows), {
//             status: 200,
//             headers: {
//             "Content-Type": "application/json",
//             },
//         });
    
//         // // const client = await clientPromise;
//         // // const db = client.db("pawnalyze");
//         // // let query = {};
        
    
//         // // if (convertedGameFilters && convertedGameFilters.length > 0) {
//         // //     query = {
//         // //     $and: convertedGameFilters.map((filter: Game) => ({
//         // //     games: {
//         // //         $elemMatch: {
//         // //         whitePlayer: filter.whitePlayer,
//         // //         blackPlayer: filter.blackPlayer,
//         // //         outcome: filter.outcome
//         // //         }
//         // //     }
//         // //     }))
//         // // };
//         // // }
    
//         // // const sims = await db
//         // // .collection("candidates-2024")
//         // // .aggregate([
//         // //     { $match: query }, // Apply your query conditions here
//         // //     { $sample: { size: limitSims } } // Randomly sample documents
//         // // ])
//         // // .toArray();
    
//         // let totalGames = sims.length;
//         // let tieCount = 0;
//         // let winnerCounts: { [key: string]: number } = {}; // Add type annotation for winnerCounts
//         // let secondCounts: { [key: string]: number } = {}; // Add type annotation for secondCounts
    
//         // sims.forEach((sim) => {
//         // tieCount += sim.tie === 1 ? 1 : 0;
//         // winnerCounts[sim.winner] = (winnerCounts[sim.winner] || 0) + 1;
//         // secondCounts[sim.second] = (secondCounts[sim.second] || 0) + 1;
//         // });
    
//         // let tiePercentage = (tieCount / totalGames) * 100;
//         // let secondPercentages: { [key: string]: number } = {};
//         // let winnerPercentages: { [key: string]: number } = {};
    
//         // for (let name in winnerCounts) {
//         // winnerPercentages[name] = (winnerCounts[name] / totalGames) * 100;
//         // }
    
//         // for (let name in secondCounts) {
//         // secondPercentages[name] = (secondCounts[name] / totalGames) * 100;
//         // }
    
//         // const response = {
//         // tiePercentage,
//         // winnerPercentages,
//         // secondPercentages,
//         // totalGames,
//         // };
    
//         // return new NextResponse(JSON.stringify(response), {
//         // status: 200,
//         // headers: {
//         //     "Content-Type": "application/json",
//         // },
//         // });
//     } catch (e: any) {
//         console.error(e);
//         return new NextResponse(
//         JSON.stringify({ error: "Internal Server Error", details: e.message }),
//         {
//             status: 500,
//             headers: {
//             "Content-Type": "application/json",
//             },
//         },
//         );
//     }
//     }