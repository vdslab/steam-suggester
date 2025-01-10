import { PG_POOL } from "@/constants/PG_POOL";
import { NextResponse } from "next/server";
import { GAME_COUNT } from "@/constants/NETWORK_DATA";

export async function GET() {
  const COUNT = GAME_COUNT + 50;
  try {
    const today = new Date();
    // 過去一週間のデータを取得（昨日までの7日間）
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 7);

    const endDateString = endDate.toISOString().split('T')[0];
    const startDateString = startDate.toISOString().split('T')[0];

    const query = `
      SELECT 
          gv.steam_id,
          MAX(gv.twitch_id) AS twitch_id,
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
          sd.sale_price,
          sd.play_time,
          sd.review_text,
          sd.difficulty,
          sd.graphics,
          sd.story,
          sd.music,
          sd.similar_games,
          sd.feature_vector,
          SUM(gv.total_views) AS total_views,
          COALESCE(SUM(sa.active_user), 0) AS total_active_users
      FROM 
          game_views gv
      JOIN 
          steam_game_data sd 
          ON gv.steam_id = sd.steam_game_id
      LEFT JOIN
          steam_active_users sa
          ON gv.steam_id = CAST(sa.steam_id AS TEXT) AND gv.get_date::date = sa.get_date
      WHERE 
          gv.get_date::date BETWEEN $1 AND $2
      GROUP BY
          gv.steam_id, sd.game_title, sd.webpage_url, sd.img_url, sd.price,
          sd.is_single_player, sd.is_multi_player, sd.is_device_windows, sd.is_device_mac,
          sd.genres, sd.tags, sd.short_details, sd.release_date, sd.developer_name,
          sd.sale_price, sd.play_time, sd.review_text, sd.difficulty, sd.graphics,
          sd.story, sd.music, sd.similar_games, sd.feature_vector
      ORDER BY
          SUM(sa.active_user) DESC
      LIMIT $3;
    `;

    // クエリ実行時のパラメータ
    const { rows } = await PG_POOL.query(query, [startDateString, endDateString, COUNT]);

    // クエリ結果をマッピング
    const result = rows.map(item => {
      let similarGames: string[] = [];
      similarGames = [...new Set(item.similar_games["released"] as string[])];

      return {
        twitchGameId: item.twitch_id,
        steamGameId: item.steam_id,
        title: item.name,
        imgURL: item.image,
        url: item.url,
        totalViews: parseInt(item.total_views, 10),
        activeUsers: parseInt(item.total_active_users, 10),
        genres: item.genres || [],
        price: item.price,
        isSinglePlayer: item.is_single_player,
        isMultiPlayer: item.is_multi_player,
        device: {
          windows: item.is_device_windows,
          mac: item.is_device_mac,
        },
        tags: item.tags || [],
        shortDetails: item.short_details,
        releaseDate: item.release_date,
        developerName: item.developer_name,
        salePrice: item.sale_price,
        playTime: item.play_time,
        review: item.review_text,
        difficulty: item.difficulty,
        graphics: item.graphics,
        story: item.story,
        music: item.music,
        similarGames: similarGames,
        featureVector: item.feature_vector || [],
      };
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching top games:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
