import { PG_POOL } from "@/constants/PG_POOL";
import { TwitchViews } from "@/types/api/getTwitchClipType";
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
    const result = await client.query(
    'SELECT get_date,total_views FROM game_views WHERE twitch_id = $1 ORDER BY get_date DESC ',
      [twitch_id]
    );

    await client.release(true);

    const data = result.rows

    const formatData = data.map((d: TwitchViews) => {
      const date = new Date(d.get_date)
      const unixTime = Math.floor(date.getTime() / 1000)
      return {
        date: unixTime,
        count: d.total_views
      }
    }).sort((d1, d2) => d1.date - d2.date);

    return NextResponse.json(formatData)

  } catch (error) {
    console.error('Error fetching clips:', error)
    return NextResponse.error()
  }
}