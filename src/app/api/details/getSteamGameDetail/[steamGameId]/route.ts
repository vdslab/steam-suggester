import { steamGameCategoryType } from "@/types/api/steamDataType";
import { MatchDataType } from "@/types/match/MatchDataType";
import { NextResponse } from "next/server";

type Params = {
  params: {
    steamGameId: string;
  };
};

export async function GET(req: Request, {params}: Params) {
  const steamGameId = params.steamGameId;


  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamGameId}&cc=jp&l=japanese`);
  const responseJson = await response.json();
  const gameDetailData = responseJson[steamGameId].data

  const result:MatchDataType = {
    title: gameDetailData.name,
    description: gameDetailData.short_description,
    header_image: gameDetailData.header_image,
    genres: gameDetailData.genres,
    price: gameDetailData.price_overview ? gameDetailData.price_overview.final / 100 : 0,
    isSinglePlayer: gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 2),
    isMultiPlayer: gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 1),
    device: {
      windows: gameDetailData.platforms.windows,
      mac: gameDetailData.platforms.mac,
    }
  }

  return NextResponse.json(result);
}
