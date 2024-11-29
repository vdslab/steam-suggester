import { PG_POOL } from "@/constants/PG_POOL";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const steamId = searchParams.get('steamId');
  // TODO: 環境変数から取得するように変更
  // const apiKey = process.env.STEAM_API_KEY;
  const apiKey = '970E6032D117FC823447B2036CD34E54';


  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Steam API Key is required' }), { status: 500 });
  }

  if (!steamId) {
    return new Response(JSON.stringify({ error: 'Steam ID is required' }), { status: 400 });
  }

  try {
    const friendsResponse = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v1?key=${apiKey}&steamId=${steamId}`);
    const data:GetOwnedGamesResponse = await friendsResponse.json();
    const games = data.response.games;

    const client = await PG_POOL.connect();
    const result = [];
    for (const game of games) {
      const appId = game.appid;
      const queryResult = await client.query(
        'SELECT game_title FROM steam_game_data WHERE steam_game_id = $1',
        [appId]
      );
      result.push(queryResult.rows[0].game_title);
    }
    await client.release(true);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch friends games' }), { status: 500 });
  }
}
