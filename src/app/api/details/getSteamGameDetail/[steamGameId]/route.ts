import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { NextResponse } from "next/server";
import { PG_POOL } from "@/constants/PG_POOL";

type Params = {
  params: {
    steamGameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const steamGameId = params.steamGameId;

  try {
    const client = await PG_POOL.connect();

    const query = `
      SELECT sd.steam_game_id, sd.game_title as name, sd.webpage_url as url, sd.img_url as image, sd.price,
             sd.is_single_player, sd.is_multi_player, sd.is_device_windows, sd.is_device_mac,
             array_agg(json_build_object('id', g.genre_id, 'description', g.genre_name)) as genres
      FROM steam_data sd
      LEFT JOIN steam_data_genres sdg ON sd.steam_game_id = sdg.steam_game_id
      LEFT JOIN genres g ON sdg.genre_id = g.genre_id
      WHERE sd.steam_game_id = $1
      GROUP BY sd.steam_game_id;
    `;

    const result = await client.query(query, [steamGameId]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const gameDetailData = result.rows[0];

    const formattedResult: SteamDetailsDataType = {
      // マッチ度で使用
      title: gameDetailData.name,
      genres: gameDetailData.genres,
      price: gameDetailData.price,
      isSinglePlayer: gameDetailData.is_single_player,
      isMultiPlayer: gameDetailData.is_multi_player,
      device: {
        windows: gameDetailData.is_device_windows,
        mac: gameDetailData.is_device_mac,
      },

      // 類似度で使用
      name: gameDetailData.name,
      image: gameDetailData.image,
      url: gameDetailData.url,
    };

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('Error fetching game details:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}