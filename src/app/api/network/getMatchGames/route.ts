import { steamGameCategoryType } from "@/types/api/steamDataType";
import { NextResponse } from "next/server";

export async function GET() {

  try {

    const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getCurrentTopGames`);
    const data = await res.json();  

    const result = [];
    for(let i = 0; i < data.length; i += 1) {

      const twitchGameId = data[i].twitch_id;
      const steamGameId = data[i].steam_id;


      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamGameId}&cc=jp`);
      const responseJson = await response.json();
      if (!responseJson[steamGameId].success) {
        console.error('Failed to fetch game detail data:', steamGameId);
        continue;
      }
      const gameDetailData = responseJson[steamGameId].data

      result.push({
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
      })
    }
    

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching top games:", error);
    return NextResponse.error();
  }
}