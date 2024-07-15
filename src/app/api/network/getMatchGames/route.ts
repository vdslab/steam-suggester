import { gameDetailType } from "@/types/api/gameDetailsType";
import { steamGameCategoryType } from "@/types/api/steamDataType";
import { NextResponse } from "next/server";

export async function GET() {

  try {

    const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getCurrentTopGames`);
    const data = await res.json();
  
    const twitchGameId = data[0].twitchGameId;
    const steamGameId = data[0].steamGameId;

    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamGameId}&cc=jp`);
    const responseJson = await response.json();
    const gameDetailData = responseJson[steamGameId]?.data;

    if (!gameDetailData) {
      throw new Error(`Game details not found for Steam Game ID: ${steamGameId}`);
    }

    const result: gameDetailType = {
      twitchGameId: twitchGameId,
      steamGameId: steamGameId,
      title: gameDetailData.name,
      imgURL: gameDetailData.header_image,
      gameData: {
        genres: gameDetailData.genres,
        price: gameDetailData.price_overview ? gameDetailData.price_overview.final : 0,
        isSinglePlayer: gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 2),
        isMultiPlayer: gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 1),
        platforms: {
          windows: gameDetailData.platforms.windows,
          mac: gameDetailData.platforms.mac,
          linux: gameDetailData.platforms.linux
        }
      }
    };

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching top games:", error);
    return NextResponse.error();
  }
}