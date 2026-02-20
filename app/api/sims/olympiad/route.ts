import { NextRequest, NextResponse } from "next/server";
import { createKysely } from "@vercel/postgres-kysely";
import { sql } from "kysely";

const MAX_RECORDS = 10000;

interface Database {
  olympiad_2024: {
    gold: string;
    silver: string;
    bronze: string;
    round: string;
    future_results: string;
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
    const table = "olympiad_2024";

    // Fetch the unique rounds list and find the max round
    const rounds = await db
      .selectFrom(table)
      .select("round")
      .distinct()
      .execute();

    const maxRound = Math.max(
      ...rounds.map(({ round }) =>
        parseInt(round.replace("Round ", "").replace("Pre", "0"))
      )
    );

    // Sample up to 10k random records, then aggregate
    const subquery = db
      .selectFrom(table)
      .selectAll()
      .orderBy(sql`RANDOM()`)
      .limit(MAX_RECORDS)
      .as('sub');

    const results = await db
      .selectFrom(subquery)
      .select(({ fn }) => [
        "round",
        "gold",
        "silver",
        "bronze",
        fn.count<number>("gold").as("gold_count"),
        fn.count<number>("silver").as("silver_count"),
        fn.count<number>("bronze").as("bronze_count"),
      ])
      .groupBy(["round", "gold", "silver", "bronze"])
      .execute();

    results.forEach((row) => {
      row.round = row.round.replace("Round ", "").replace("Pre", "0");
    });

    // Calculate total simulations by round
    const simulationsByRound = results.reduce((acc, row) => {
      acc[row.round] = (acc[row.round] || 0) + parseInt(String(row.gold_count));
      return acc;
    }, {} as Record<string, number>);

    // Calculate percentages by round
    const medalPercentagesByRound = results.reduce((acc, row) => {
      if (!acc[row.round]) {
        acc[row.round] = {
          gold: {},
          silver: {},
          bronze: {},
        };
      }

      acc[row.round].gold[row.gold] =
        (acc[row.round].gold[row.gold] || 0) +
        parseInt(String(row.gold_count));
      acc[row.round].silver[row.silver] =
        (acc[row.round].silver[row.silver] || 0) +
        parseInt(String(row.silver_count));
      acc[row.round].bronze[row.bronze] =
        (acc[row.round].bronze[row.bronze] || 0) +
        parseInt(String(row.bronze_count));

      return acc;
    }, {} as Record<string, { gold: Record<string, number>; silver: Record<string, number>; bronze: Record<string, number> }>);

    // Calculate nSims only for the latest round
    const nSims = simulationsByRound[maxRound];

    // Prepare the response with calculated percentages by round
    const response = {
      rounds: Object.entries(medalPercentagesByRound).map(([round, data]) => ({
        round,
        gold: Object.entries(data.gold).map(([country, count]) => ({
          country,
          percentage: ((count / simulationsByRound[round]) * 100).toFixed(2),
        })),
        silver: Object.entries(data.silver).map(([country, count]) => ({
          country,
          percentage: ((count / simulationsByRound[round]) * 100).toFixed(2),
        })),
        bronze: Object.entries(data.bronze).map(([country, count]) => ({
          country,
          percentage: ((count / simulationsByRound[round]) * 100).toFixed(2),
        })),
      })),
      nSims,
      highestRound: maxRound,
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
