import TwitchToken from "@/app/api/TwitchToken";
import { TwitchClipApiType, TwitchClipDataType, TwitchClipType } from "@/types/api/getTwitchClipType";
import { NextResponse } from "next/server";

type Params = {
  params: {
    twitchGameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const streamerUsername = decodeURIComponent(params.twitchUsername);  // Decode the URL-encoded username
  
  try {
    const token = await TwitchToken();

    const headers = new Headers();
    if (process.env.TWITCH_CLIENT_ID && token) {
      headers.append('Client-ID', process.env.TWITCH_CLIENT_ID);
      headers.append('Authorization', `Bearer ${token}`);
    } else {
      return NextResponse.error();
    }

    // ユーザーIDを取得
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${streamerUsername}`, {
      headers: headers,
    });

    const userData: { data: TwitchUserDataType[] } = await userRes.json();
    if (userData.data.length === 0) {
      return NextResponse.error();
    }

    const userId = userData.data[0].id;

    // ユーザーの過去のストリーム履歴を取得
    const gamesRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
      headers: headers,
    });

    const gamesData: { data: TwitchStreamDataType[] } = await gamesRes.json();

    // ゲームの情報を抽出
    const gamesPlayed = new Set<string>();
    gamesData.data.forEach((stream) => {
      if (stream.game_id) {
        gamesPlayed.add(stream.game_id);  // ゲーム名をSetに追加して重複を避ける
      }
    });

    const resultGames = Array.from(gamesPlayed);

    return NextResponse.json(resultGames);

  } catch (error) {
    console.error('Error fetching user games:', error);
    return NextResponse.error();
  }
}
