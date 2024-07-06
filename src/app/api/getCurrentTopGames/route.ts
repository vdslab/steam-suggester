import { NextResponse } from 'next/server';
import { PG_POOL } from "@/constants/PG_POOL";

export async function GET(req: Request) {
  try {
    const today = new Date();
    // 7/7時点で昨日のデータがないため本日のデータ取得に一時変更
    // today.setDate(today.getDate() - 1); 
    const dateString = today.toISOString().split('T')[0];

    const query = `
      SELECT get_date, game_title, twitch_id, steam_id, total_views
      FROM game_views
      WHERE get_date::date = $1
    `;
    const { rows } = await PG_POOL.query(query, [dateString]);

    const filteredRows = rows
                        .sort((a, b) => b.total_views - a.total_views)
                        .slice(0, 120);

    console.log('Fetched rows:', filteredRows);

    return NextResponse.json(filteredRows);
  } catch (error) {
    console.error('Error fetching top games:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}