import TwitchToken from "@/app/api/TwitchToken";
import { NextResponse } from "next/server";
import { TwitchUserDataType, TwitchStreamDataType, TwitchVideoDataType } from "@/types/api/TwitchTypes";

type Params = {
  params: {
    twitchUserId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const streamerUserId = params.twitchUserId;

  try {
    // Twitch APIに必要なトークンを取得
    const token = await TwitchToken();
    if (!token || !process.env.TWITCH_CLIENT_ID) {
      console.error("Missing token or client ID");
      return NextResponse.error();
    }

    const headers = new Headers({
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    });

    // ユーザーIDでの検索を試みる
    let userRes = await fetch(`https://api.twitch.tv/helix/users?login=${streamerUserId}`, {
      headers,
    });

    let userData: { data: TwitchUserDataType[] } | null = null;

    if (userRes.ok) {
      userData = await userRes.json();
    }

    // ユーザーが見つからなければ、チャンネル名で検索
    if (!userData || userData.data.length === 0) {
      console.log("User not found by ID, searching by channel name...");
      userRes = await fetch(`https://api.twitch.tv/helix/search/channels?query=${streamerUserId}`, {
        headers,
      });

      if (!userRes.ok) {
        console.error("Error fetching channel search data:", userRes.status, await userRes.text());
        return NextResponse.error();
      }

      userData = await userRes.json();

      if (!userData || userData.data.length === 0) {
        console.error("Channel not found");
        return NextResponse.json({ error: "User or channel not found" }, { status: 404 });
      }
    }

    const channel = userData.data[0];
    const streamerName = channel.display_name;
    const streamerId = channel.id;
    const thumbnail = channel.thumbnail_url;
    const userId = channel.id;

    // 現在配信されているゲームIDを取得
    const gamesRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, { 
      headers,
    });

    if (!gamesRes.ok) {
      console.error("Error fetching stream data:", gamesRes.status, await gamesRes.text());
      return NextResponse.error();
    }

    const gamesData: { data: TwitchStreamDataType[] } = await gamesRes.json();
    const currentStreamGames = new Set<string>();

    // 現在配信中のゲームIDを取得
    gamesData.data.forEach((stream) => {
      if (stream.game_id) {
        currentStreamGames.add(stream.game_id);
      }
    });

    // 過去の配信データを取得
    let paginationCursor: string | undefined = undefined;
    const pastVideosGames = new Set<string>();

    do {
      const videosRes = await fetch(`https://api.twitch.tv/helix/videos?user_id=${userId}&after=${paginationCursor || ''}`, {
        headers,
      });

      if (!videosRes.ok) {
        console.error("Error fetching video data:", videosRes.status, await videosRes.text());
        return NextResponse.error();
      }

      const videosData: { data: TwitchVideoDataType[], pagination?: { cursor: string } } = await videosRes.json();

      // 過去の配信タイトルを追加
      videosData.data.forEach((video) => {
        if (video.title) {
          pastVideosGames.add(video.title);
        }
      });

      // 次のページがあれば、paginationCursorを更新
      paginationCursor = videosData.pagination?.cursor;
    } while (paginationCursor); // 次のページがあれば続ける

    // 最終的な結果を作成
    const result = {
      name: streamerName,
      id: streamerId,
      color: 'defaultColor',  // 色は固定で設定
      thumbnail: thumbnail,
      twitchStreamId: Array.from(currentStreamGames), // 現在配信中のゲームID
      twitchVideoId: Array.from(pastVideosGames),    // 過去の配信タイトル
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching user or channel data:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
