import { PG_POOL } from "@/constants/PG_POOL";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const steamId = searchParams.get('steamId');
  // TODO: 環境変数から取得するように変更
  // const apiKey = process.env.STEAM_API_KEY;
  const apiKey = '835F4070BDF4C82BEAF49B3EBB06B093';

  if (!steamId) {
    return new Response(JSON.stringify({ error: 'Steam ID is required' }), { status: 400 });
  }

  try {
    // フレンドリストを取得
    const friendsResponse = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v1?key=${apiKey}&steamId=${steamId}&relationship=friend`);
    const friendListData: GetFriendListResponse = await friendsResponse.json();
    const friends: Friends[] = friendListData.friendslist?.friends || [];

    const friendNameMap = new Map<string, string>(); // steamId をキーにフレンド名をマップ

    // フレンドの名前を取得
    const friendIds = friends.map(friend => friend.steamid).join(",");
    const playerSummariesResponse = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?key=${apiKey}&steamids=${friendIds}`);
    const playerSummariesData: GetPlayerSummariesResponse = await playerSummariesResponse.json();
    for (const player of playerSummariesData.response.players) {
      friendNameMap.set(player.steamid, player.personaname);
    }

    const gameFriendMap = new Map<string, { friendsName: string[], gameName: string }>();

    const client = await PG_POOL.connect();

    // 各フレンドのゲームリストを取得
    for (const friend of friends) {
      const gamesResponse = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001?key=${apiKey}&steamId=${friend.steamid}`);
      if (!gamesResponse.ok) {
        continue;
      }
      const gamesData: GetOwnedGamesResponse = await gamesResponse.json();
      if (!gamesData.response?.games) {
        continue;
      }

      for (const game of gamesData.response.games) {
        const appId = game.appid;
        const friendName = friendNameMap.get(friend.steamid) || "Unknown Friend";

        // ゲームタイトルを取得
        const result = await client.query(
          'SELECT game_title FROM steam_game_data WHERE steam_game_id = $1',
          [appId]
        );
        if (!result.rows[0]) {
          // ゲームタイトルが見つからない場合はスキップ
          console.log("Game title not found for appId:", appId);
          continue;
        }
        const gameName = result.rows[0].game_title;

        // 既に存在する場合、フレンド名を追加（重複を防ぐためにチェック）
        if (gameFriendMap.has(appId)) {
          const entry = gameFriendMap.get(appId)!;
          if (!entry.friendsName.includes(friendName)) {
            entry.friendsName.push(friendName);
          }
        } else {
          gameFriendMap.set(appId, {
            friendsName: [friendName],
            gameName
          });
        }
      }
    }
    const response = Array.from(gameFriendMap.values());

    await client.release(true);

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch friends games' }), { status: 500 });
  }
}