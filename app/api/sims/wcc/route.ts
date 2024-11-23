import { NextRequest, NextResponse } from "next/server";
import { createKysely } from "@vercel/postgres-kysely";
import { RESPONSE_LIMIT_DEFAULT } from "next/dist/server/api-utils";
import internal from "stream";

interface Database {
  wcc24: {
    winner: string;
    tie: number;
    round: number;
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
  
      if (!filters || !Array.isArray(filters)) {
        return new NextResponse(
          JSON.stringify({ message: "Invalid filters provided" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      const selectColumns = ["winner", "tie", "round", ...filters.map(filter => filter.split('|').slice(0, 3).join('|'))];
  
      const results = await db
        .selectFrom(table)
        .select(selectColumns)
        .execute();
  
      // Filter results based on the filters logic
      const filteredResults = results.filter((row) =>
        filters.every((filter) => {
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
      );
  
      const totalSimulations = filteredResults.length;
  
      if (totalSimulations === 0) {
        return new NextResponse(
          JSON.stringify({ message: "No results match the given filters." }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      // Aggregate data by round
      const roundsData = filteredResults.reduce((acc, row) => {
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
  
      // Identify the highest round
      const highestRound = Math.max(...Object.keys(roundsData).map(Number));
  
      // Build the response
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
        highestRound,
        tiePercentageForHighestRound: ((roundsData[highestRound].tieCount / roundsData[highestRound].nSims) * 100).toFixed(2),
        nSimsForHighestRound: roundsData[highestRound].nSims,
      };
  
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
  