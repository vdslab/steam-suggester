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
    'SELECT total_views FROM game_views WHERE twitch_id = $1 ORDER BY get_date DESC ',
      [twitch_id]
    );

    await client.release(true);

    Object.values(result.rows)
  

    return NextResponse.json(Object.values(result.rows))

  } catch (error) {
    console.error('Error fetching clips:', error)
    return NextResponse.error()
  }
}