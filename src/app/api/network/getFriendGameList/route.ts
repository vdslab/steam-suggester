import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const steamId = searchParams.get('steamId');
  // const apiKey = process.env.STEAM_API_KEY;
  const apiKey = '970E6032D117FC823447B2036CD34E54';

  if (!steamId) {
    return new Response(JSON.stringify({ error: 'Steam ID is required' }), { status: 400 });
  }

  try {
    // フレンドリストを取得
    const friendsResponse = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v1?key=${apiKey}&steamId=${steamId}&relationship=friend`);
    const data = await friendsResponse.json();
    const friends = data.friendslist?.friends || [];

    const friendsGames = [];

    // 各フレンドのゲームリストを取得
    for (const friend of friends) {
      const gamesResponse = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v1?key=${apiKey}&steamId=${friend.steamId}`);
      if (!gamesResponse.ok) {
        continue;
      }
      const data = await gamesResponse.json();

      friendsGames.push({ steamid: data.steamid, games: data.response.games });
    }

    return NextResponse.json(friends);
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch friends games' }), { status: 500 });
  }
}
