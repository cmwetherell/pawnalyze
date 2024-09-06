import { NextRequest, NextResponse } from "next/server";
import { createKysely } from "@vercel/postgres-kysely";

interface Database {
  olympiad_2024: {
    gold: string;
    silver: string;
    bronze: string;
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

    // Fetch the simulation results from the database
    const results = await db
      .selectFrom(table)
      .select(({ fn }) => [
        "gold",
        "silver",
        "bronze",
        fn.count<number>("gold").as("gold_count"),
        fn.count<number>("silver").as("silver_count"),
        fn.count<number>("bronze").as("bronze_count"),
      ])
      .groupBy(["gold", "silver", "bronze"])
      .execute();

    // Calculate the total number of simulations
    const totalSimulations = results.reduce(
      (acc, row) => acc + parseInt(String(row.gold_count)),
      0
    );

    // Calculate the percentage for each medal type
    const goldPercentages = results.reduce((acc, row) => {
      acc[row.gold] = (acc[row.gold] || 0) + parseInt(String(row.gold_count));
      return acc;
    }, {} as Record<string, number>);

    const silverPercentages = results.reduce((acc, row) => {
      acc[row.silver] = (acc[row.silver] || 0) + parseInt(String(row.silver_count));
      return acc;
    }, {} as Record<string, number>);

    const bronzePercentages = results.reduce((acc, row) => {
      acc[row.bronze] = (acc[row.bronze] || 0) + parseInt(String(row.bronze_count));
      return acc;
    }, {} as Record<string, number>);

    // Prepare the response with calculated percentages
    const response = {
      gold: Object.entries(goldPercentages).map(([country, count]) => ({
        country,
        percentage: ((count / totalSimulations) * 100).toFixed(2),
      })),
      silver: Object.entries(silverPercentages).map(([country, count]) => ({
        country,
        percentage: ((count / totalSimulations) * 100).toFixed(2),
      })),
      bronze: Object.entries(bronzePercentages).map(([country, count]) => ({
        country,
        percentage: ((count / totalSimulations) * 100).toFixed(2),
      })),
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
