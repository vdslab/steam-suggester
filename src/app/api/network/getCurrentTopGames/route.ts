import { NextResponse } from 'next/server';
import { PG_POOL } from "@/constants/PG_POOL";

export async function GET(req: Request) {
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

    const filteredRows = rows
                        .sort((a, b) => b.total_views - a.total_views)
                        .slice(0, 120)
                        .filter((item, index, self) => (
                          index === self.findIndex((t) => (
                            t.steam_id === item.steam_id
                          ))
                        ));


    return NextResponse.json(filteredRows);
  } catch (error) {
    console.error('Error fetching top games:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}