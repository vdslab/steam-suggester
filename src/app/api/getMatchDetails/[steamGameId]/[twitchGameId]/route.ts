import { gameDetailType } from "@/types/api/gameDetailsType";
import { steamGameGenreType, steamGameCategoryType } from "@/types/api/steamDataType";
import { NextResponse } from "next/server";

type Params = {
  params: {
    steamGameId: string;
    twitchGameId: string;
  }
};

export async function GET(req: Request, params: Params) {

  const { steamGameId, twitchGameId } = params.params;

  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamGameId}&cc=jp`)
  const responseJson = await response.json()
  const gameDetailData = responseJson[steamGameId].data

  const result: gameDetailType = {
    twitchGameId: twitchGameId,
    steamGameId: steamGameId,
    title: gameDetailData.name,
    imgURL: gameDetailData.header_image,
    gameData: {
      genres: gameDetailData.genres.map((genre: steamGameGenreType) => genre.description),
      price: gameDetailData.price_overview.final,
      isSinglePlayer: gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 2),
      isMultiPlayer: gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 1),
      platforms: {
        windows: gameDetailData.platforms.windows,
        mac: gameDetailData.platforms.mac,
        linux: gameDetailData.platforms.linux
      }
    }
  }

  let test = result




  return NextResponse.json(test);
}