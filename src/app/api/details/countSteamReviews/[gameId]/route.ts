import { RollupType, SteamReviewHistogramApiType } from "@/types/api/countSteamReviewsType";
import { NextResponse } from "next/server";

type Params = {
  params: {
    gameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {

  const gameID = params.gameId;
  const response = await fetch(`https://store.steampowered.com/appreviewhistogram/${gameID}?json=1`)
  const data:SteamReviewHistogramApiType = await response.json()

  const reviewsCount = data.results.rollups.map((rollup:RollupType) => ({
    date: rollup.date,
    count: (rollup.recommendations_down + rollup.recommendations_up),
  }))


  return NextResponse.json(reviewsCount);
}