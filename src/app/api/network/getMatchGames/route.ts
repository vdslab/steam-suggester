import { PG_POOL } from "@/constants/PG_POOL";
import { gameDetailType } from "@/types/api/getMatchGamesType";
import { SteamCategoryType } from "@/types/api/getSteamDetailType";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const dateString = today.toISOString().split('T')[0];

    const query = `
      SELECT gv.get_date, gv.game_title, gv.twitch_id, gv.steam_id, gv.total_views,
             sd.game_title as name, sd.img_url as image, sd.price,
             sd.is_single_player, sd.is_multi_player, sd.is_device_windows, sd.is_device_mac,
             array_agg(json_build_object('id', g.genre_id, 'description', g.genre_name)) as genres
      FROM game_views gv
      JOIN steam_data sd ON gv.steam_id = sd.steam_game_id
      LEFT JOIN steam_data_genres sdg ON sd.steam_game_id = sdg.steam_game_id
      LEFT JOIN genres g ON sdg.genre_id = g.genre_id
      WHERE gv.get_date::date = $1
      GROUP BY gv.get_date, gv.game_title, gv.twitch_id, gv.steam_id,
               sd.game_title, sd.img_url, sd.price, sd.is_single_player, sd.is_multi_player, sd.is_device_windows, sd.is_device_mac
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

    const result: gameDetailType[] = data.map(item => ({
      twitchGameId: item.twitch_id,
      steamGameId: item.steam_id,
      title: item.name,
      imgURL: item.image,
      totalViews: item.total_views,
      genres: item.genres,
      price: item.price,
      isSinglePlayer: item.is_single_player,
      isMultiPlayer: item.is_multi_player,
      device: {
        windows: item.is_device_windows,
        mac: item.is_device_mac,
      }
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching top games:", error);
    return NextResponse.error();
  }
}
