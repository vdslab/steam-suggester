import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // ゲーム名の配列
  const gameNames = ["The Lumenites Playtest", "Interstellar Distress"];

  // Steam API からゲームリストを取得
  const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
  const data = await res.json();

  const matchedGames = [];
  // ゲームリストから名前が一致するゲームを検索
  if (data && data.applist && data.applist.apps) {
    for (const game of data.applist.apps) {
      if (gameNames.includes(game.name)) {
        matchedGames.push({ id: game.appid, name: game.name });
      }
    }
  }

  // 結果を JSON として返す
  return NextResponse.json(matchedGames);
}
