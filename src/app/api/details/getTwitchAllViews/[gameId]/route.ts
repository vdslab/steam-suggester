import { PG_POOL } from "@/constants/PG_POOL";
import { GetTwitchAllReviewsResponse } from "@/types/api/getTwitchAllReviewsType";
import { NextResponse } from "next/server"

type Params = {
  params: {
    gameId: string;
  };
};

export async function GET(req: Request, params: Params) {

  const twitch_id = params.params.gameId;
  
  try {
    const client = await PG_POOL.connect();
    const query = `
      SELECT
          get_date,total_views
      FROM
          game_views
      WHERE
          twitch_id = $1
      ORDER BY
          get_date ASC;
    `;

    const result = await client.query(query, [twitch_id]);

    await client.release(true);

    if (result.rows.length === 0) {
      return NextResponse.json([]);
    }
    
    const data: GetTwitchAllReviewsResponse[] = result.rows.map(row => ({
      get_date: row.get_date,
      total_views: row.total_views
    }));

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // 最初と最後の日付を取得
    const startDate = new Date(data[0].get_date);
    const endDate = new Date(data[data.length - 1].get_date);

    // 日付の範囲を生成
    let currentDate = new Date(startDate);
    const allDates = [];
    while (currentDate <= endDate) {
      allDates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 結果データを構築
    const filledData = allDates.map((date) => {
      const existing = data.find((item) => formatDate(new Date(item.get_date)) === date);
      return existing ? existing : { get_date: `${date}T00:00:00.000Z`, total_views: 0 };
    });


    return NextResponse.json(filledData)

  } catch (error) {
    console.error('Error fetching twitch views:', error)
    return NextResponse.error()
  }
}