import { NextRequest, NextResponse } from "next/server";
import { createKysely } from "@vercel/postgres-kysely";
import { sql } from "kysely";

const MAX_RECORDS = 10000;

interface Database {
  wcc24: {
    winner: string;
    tie: number;
    round: any;
    // Dynamic columns for each game and round, e.g., "Din|Guk|1", "Guk|Din|2", etc.
  };
}

export async function POST(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return new NextResponse(
        JSON.stringify({ message: "Method Not Allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const db = createKysely<Database>();
    const table = "wcc24";

    const body = await req.json();
    const { filters } = body;

    // Step 1: Find the maximum round
    const maxRoundResult = await db
      .selectFrom(table)
      .select("round")
      .orderBy("round", "desc")
      .limit(1)
      .execute();

    if (maxRoundResult.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "No data available" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const maxRound = maxRoundResult[0].round;

    // Sample up to 10k random records for base data
    const baseResults = await db
      .selectFrom(table)
      .select(["winner", "tie", "round"])
      .orderBy(sql`RANDOM()`)
      .limit(MAX_RECORDS)
      .execute();

    // Aggregate data by round for unfiltered results
    const roundsData = baseResults.reduce((acc, row) => {
      const round = row.round;
      if (!acc[round]) {
        acc[round] = {
          winCounts: {},
          tieCount: 0,
          nSims: 0,
        };
      }

      acc[round].winCounts[row.winner] = (acc[round].winCounts[row.winner] || 0) + 1;
      acc[round].tieCount += row.tie;
      acc[round].nSims += 1;

      return acc;
    }, {} as Record<number, { winCounts: Record<string, number>; tieCount: number; nSims: number }>);

    // Prepare base response with existing rounds
    const response = {
      byRound: Object.entries(roundsData).map(([round, data]) => ({
        round: parseInt(round, 10),
        winPercentages: Object.entries(data.winCounts).map(([winner, count]) => ({
          winner,
          percentage: ((count as number / data.nSims) * 100).toFixed(2),
        })),
        tiePercentage: ((data.tieCount / data.nSims) * 100).toFixed(2),
        nSims: data.nSims,
      })),
      highestRound: maxRound,
      tiePercentageForHighestRound: ((roundsData[maxRound].tieCount / roundsData[maxRound].nSims) * 100).toFixed(2),
      nSimsForHighestRound: roundsData[maxRound].nSims,
    };

    // If filters are provided, add a "Sim" round with filtered data from the highest round
    if (filters && filters.length > 0) {
      // Add dynamic columns for filters
      const selectColumns = ["winner", "tie", "round", ...filters.map((filter: string) => filter.split('|').slice(0, 3).join('|'))];
      
      // Fetch in random order, filter in JS, then take up to 10k
      const filteredResults = await db
        .selectFrom(table)
        .select(selectColumns)
        .orderBy(sql`RANDOM()`)
        .execute()
        .then(results => results.filter((row) =>
          filters.every((filter: string) => {
            const [gameId_a, gameId_b, roundStr, outcome] = filter.split("|");
            const gameId = `${gameId_a}|${gameId_b}`;
            const round = parseInt(roundStr, 10);
            const columnName = `${gameId}|${round}`;
            const columnValue = row[columnName];

            if (outcome === "w") return columnValue === 1.0;
            if (outcome === "b") return columnValue === 0.0;
            if (outcome === "d") return columnValue === 0.5;
            return false;
          })
        ))
        .then((results: any[]) => results.filter(row => row.round === maxRound))
        .then((results: any[]) => results.slice(0, MAX_RECORDS));

      if (filteredResults.length > 0) {
        const simRoundData = filteredResults.reduce((acc, row) => {
          acc.winCounts[row.winner] = (acc.winCounts[row.winner] || 0) + 1;
          acc.tieCount += row.tie;
          acc.nSims += 1;
          return acc;
        }, {
          winCounts: {},
          tieCount: 0,
          nSims: 0
        });

        const simRound = {
          round: 100,
          winPercentages: Object.entries(simRoundData.winCounts).map(([winner, count]) => ({
            winner,
            percentage: ((count as number / simRoundData.nSims) * 100).toFixed(2),
          })),
          tiePercentage: ((simRoundData.tieCount / simRoundData.nSims) * 100).toFixed(2),
          nSims: simRoundData.nSims,
        };

        response.byRound.push(simRound);

        // Update nSimsForHighestRound with the Sim round's nSims
        response.nSimsForHighestRound = simRoundData.nSims;
        response.tiePercentageForHighestRound = ((simRoundData.tieCount / simRoundData.nSims) * 100).toFixed(2);
             
      }
    }

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: e.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}