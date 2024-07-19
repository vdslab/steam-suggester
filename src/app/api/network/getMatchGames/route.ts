import { PG_POOL } from "@/constants/PG_POOL";
import { steamGameCategoryType } from "@/types/api/steamDataType";
import { NextResponse } from "next/server";

export async function GET() {

  try {

    const today = new Date();
    today.setDate(today.getDate() -1);
    const dateString = today.toISOString().split('T')[0];

    const query = `
      SELECT get_date, game_title, twitch_id, steam_id, total_views
      FROM game_views
      WHERE get_date::date = $1
    `;
    const { rows } = await PG_POOL.query(query, [dateString]);

    const data = rows
                        .sort((a, b) => b.total_views - a.total_views)
                        .slice(0, 120)
                        .filter((item, index, self) => (
                          index === self.findIndex((t) => (
                            t.steam_id === item.steam_id
                          ))
                        ));

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