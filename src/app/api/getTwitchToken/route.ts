import { PG_POOL } from '@/constants/PG_POOL';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式の今日の日付を取得
    
    // 今日の日付のデータを取得するクエリ
    const query = `
      SELECT get_date, game_title, twitch_id, steam_id, total_views
      FROM game_views
      WHERE get_date::date = $1;
    `;

    const { rows } = await PG_POOL.query(query, [today]);

    // データが取得できたら JSON 形式で返す
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}