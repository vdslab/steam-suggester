import { PG_POOL } from "@/constants/PG_POOL";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const steamId = searchParams.get('steamId');
  const apiKey = process.env.STEAM_API_KEY;


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
    const result:GetSteamOwnedGamesResponse[] = [];
    for (const game of games) {
      const appId = game.appid;
      const queryResult = await client.query(
        'SELECT game_title FROM steam_game_data WHERE steam_game_id = $1',
        [appId]
      );

      if (queryResult.rows.length > 0 && queryResult.rows[0].game_title) {
        result.push({
          id: appId,
          title: queryResult.rows[0].game_title,
      });
      }
    }
    await client.release(true);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch friends games' }), { status: 500 });
  }
}
