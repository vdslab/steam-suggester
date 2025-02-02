import { PG_POOL } from "@/constants/PG_POOL";
import { NextResponse } from "next/server";

type Params = {
  params: {
    steamGameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const steamGameId = params.steamGameId;

  try {
    const today = new Date(2025, 0, 21);
    // 過去一週間のデータを取得（昨日までの7日間）
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 7);

    const endDateString = endDate.toISOString().split("T")[0];
    const startDateString = startDate.toISOString().split("T")[0];

    // **1. steam_game_data から基本情報を取得**
    const baseQuery = `
      SELECT 
          sd.steam_game_id, 
          sd.twitch_game_id, 
          sd.game_title AS name, 
          sd.webpage_url AS url, 
          sd.img_url AS image, 
          sd.price,
          sd.is_single_player, 
          sd.is_multi_player, 
          sd.is_device_windows, 
          sd.is_device_mac,
          sd.genres,
          sd.tags,
          sd.short_details,
          sd.release_date,
          sd.developer_name,
          sd.review_text,
          sd.similar_games,
          sd.feature_vector,
          sd.background,
          sd.screenshots,
          sd.mp4_movies
      FROM 
          steam_game_data sd
      WHERE 
          sd.steam_game_id = $1;
    `;

    const { rows: baseRows } = await PG_POOL.query(baseQuery, [steamGameId]);

    if (baseRows.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const baseData = baseRows[0];

    // **2. game_views から統計情報を取得**
    const statsQuery = `
      SELECT 
        gv.steam_id,
        MAX(gv.twitch_id) AS twitch_id,
        SUM(gv.total_views) AS total_views,
        COALESCE(SUM(sa.active_user), 0) AS total_active_users
      FROM 
        game_views gv
      LEFT JOIN
        steam_active_users sa
        ON gv.steam_id = CAST(sa.steam_id AS TEXT) AND gv.get_date::date = sa.get_date
      WHERE 
        gv.steam_id = CAST($3 AS TEXT) AND
        gv.get_date::date BETWEEN $1 AND $2
      GROUP BY
        gv.steam_id;
    `;

    const { rows: statsRows } = await PG_POOL.query(statsQuery, [
      startDateString,
      endDateString,
      steamGameId
    ]);

    let similarGames: string[] = [];
    similarGames = [
      ...new Set(baseData.similar_games["released"] as string[]),
    ];

    if (statsRows.length === 0) {
      // **統計データがない場合は baseData のみを返す**
      return NextResponse.json({
        twitchGameId: baseData.twitch_game_id,
        steamGameId: baseData.steam_game_id,
        title: baseData.name,
        imgURL: baseData.image,
        url: baseData.url,
        totalViews: 0,
        activeUsers: 0,
        genres: baseData.genres || [],
        price: baseData.price,
        isSinglePlayer: baseData.is_single_player,
        isMultiPlayer: baseData.is_multi_player,
        device: {
          windows: baseData.is_device_windows,
          mac: baseData.is_device_mac,
        },
        tags: baseData.tags || [],
        shortDetails: baseData.short_details,
        releaseDate: baseData.release_date,
        developerName: baseData.developer_name,
        review: baseData.review_text,
        similarGames: similarGames || [],
        featureVector: baseData.feature_vector || [],
        background: baseData.background || "",
        screenshots: baseData.screenshots || [],
        mp4Movies: baseData.mp4_movies || [],
      });
    }

    const statsData = statsRows[0];

    // **3. データを統合して返す**
    const result = {
      twitchGameId: baseData.twitch_game_id,
      steamGameId: baseData.steam_game_id,
      title: baseData.name,
      imgURL: baseData.image,
      url: baseData.url,
      totalViews: parseInt(statsData.total_views, 10),
      activeUsers: parseInt(statsData.total_active_users, 10),
      genres: baseData.genres || [],
      price: baseData.price,
      isSinglePlayer: baseData.is_single_player,
      isMultiPlayer: baseData.is_multi_player,
      device: {
        windows: baseData.is_device_windows,
        mac: baseData.is_device_mac,
      },
      tags: baseData.tags || [],
      shortDetails: baseData.short_details,
      releaseDate: baseData.release_date,
      developerName: baseData.developer_name,
      review: baseData.review_text,
      similarGames: similarGames || [],
      featureVector: baseData.feature_vector || [],
      background: baseData.background || "",
      screenshots: baseData.screenshots || [],
      mp4Movies: baseData.mp4_movies || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching game details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
