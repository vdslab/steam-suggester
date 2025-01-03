import { GetSteamAllReviewsResponse, RollupType, SteamReviewHistogramApiType } from "@/types/api/countSteamReviewsType";
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

  if(data.success !== 1) {
    return NextResponse.error();
  }
  
  if(data.results.start_date === null) {
    return NextResponse.json([]);
  }

  const reviewsCount:GetSteamAllReviewsResponse[] = data.results.rollups.map((rollup:RollupType) => ({
    date: new Date(rollup.date*1000).toISOString(),
    count: (rollup.recommendations_down + rollup.recommendations_up),
    positiveCount: rollup.recommendations_up,
    negativeCount: rollup.recommendations_down
  }))


  return NextResponse.json(reviewsCount);
}