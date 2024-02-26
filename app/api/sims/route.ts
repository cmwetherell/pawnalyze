// File: app/api/sims/route.ts

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb"; // Adjust the import path based on your actual project structure
import { Game } from "@/types";

// export const config = {
//   runtime: 'nodejs', // Specify the runtime if necessary, especially if you have specific runtime requirements
// };

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
        whitePlayer: game.whitePlayer,
        blackPlayer: game.blackPlayer,
        outcome: outcome,
      };
    }

    // Convert gameFilters to the expected format
    const convertedGameFilters = gameFilters.map(convertGame);
    console.log(convertedGameFilters);

    const client = await clientPromise;
    const db = client.db("pawnalyze");
    let query = {};
    

    if (convertedGameFilters && convertedGameFilters.length > 0) {
       query = {
        $and: convertedGameFilters.map((filter: Game) => ({
          games: {
            $elemMatch: {
              whitePlayer: filter.whitePlayer,
              blackPlayer: filter.blackPlayer,
              outcome: filter.outcome
            }
          }
        }))
      };
    }

    const sims = await db
      .collection("candidates-2024")
      .aggregate([
        { $match: query }, // Apply your query conditions here
        { $sample: { size: limitSims } } // Randomly sample documents
      ])
      .toArray();

    let totalGames = sims.length;
    let tieCount = 0;
    let winnerCounts: { [key: string]: number } = {}; // Add type annotation for winnerCounts
    let secondCounts: { [key: string]: number } = {}; // Add type annotation for secondCounts

    sims.forEach((sim) => {
      tieCount += sim.tie === 1 ? 1 : 0;
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
