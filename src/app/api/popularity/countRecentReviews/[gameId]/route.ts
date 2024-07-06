import { Rollups } from "@/types/Popularity/CountSteamReviews";
import { NextResponse } from "next/server";

type Params = {
  params: {
    gameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {

  const gameID = params.gameId;
  const response = await fetch(`https://store.steampowered.com/appreviewhistogram/${gameID}?json=1`)
  const data = await response.json()

  const reviewsCount = data.results.recent.map((rollup:Rollups) => ({
    date: rollup.date,
    count: (rollup.recommendations_down + rollup.recommendations_up),
  }))


  return NextResponse.json(reviewsCount);
}