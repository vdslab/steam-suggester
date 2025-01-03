import { PG_POOL } from "@/constants/PG_POOL";
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
      'SELECT get_date,total_views FROM game_views WHERE twitch_id = $1 ORDER BY get_date DESC',
      [twitch_id]
    );

    await client.release(true);
    const data = result.rows

    const formatData =[]

    for(let i = 0; i < 9; i++) {

      const date = new Date();
      // 指定日の0時0分0秒
      date.setDate(date.getDate() - i -1);
      const unixStart = Math.floor( date.setHours(0, 0, 0, 0) /1000 )
      // 1日後の0時0分0秒
      date.setDate(date.getDate() + 1)
      const unixEnd = Math.floor( date.setHours(0, 0, 0, 0) /1000)

      // 1日分のデータがない場合は0を入れる
      if (data[i] === undefined) {
        formatData.push({
          date: Math.floor((unixStart+unixEnd)/2),
          count: 0
        })
        continue
      }

      formatData.push({
        date: Math.floor(data[i].get_date.getTime() / 1000),
        count: data[i].total_views
      })
    }

    formatData.reverse()

    return NextResponse.json(formatData)

  } catch (error) {
    console.error('Error fetching clips:', error)
    return NextResponse.error()
  }
}