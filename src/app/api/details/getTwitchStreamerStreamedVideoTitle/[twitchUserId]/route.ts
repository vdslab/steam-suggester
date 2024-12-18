import TwitchToken from "@/app/api/TwitchToken";
import { NextResponse } from "next/server";
import { TwitchUserDataType, TwitchStreamDataType, TwitchVideoDataType } from "@/types/api/TwitchTypes";
import { StreamerListType } from "@/types/NetworkType";

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
      return NextResponse.json({ error: "Missing token or client ID" }, { status: 500 });
    }

    const headers = new Headers({
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    });

    // ユーザー情報の取得
    const userRes = await fetch(`https://api.twitch.tv/helix/users?id=${streamerUserId}`, { headers });

    if (!userRes.ok) {
      console.error("Error fetching user data:", userRes.status, await userRes.text());
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData: { data: TwitchUserDataType[] } = await userRes.json();
    if (userData.data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userData.data[0];
    const streamerName = user.display_name;
    const customUrl = user.login;
    const streamerId = user.id;
    const thumbnail = user.profile_image_url;
    const view_count = user.view_count;

    // 現在配信中のゲームIDを取得
    const gamesRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${streamerId}`, { headers });

    if (!gamesRes.ok) {
      console.error("Error fetching stream data:", gamesRes.status, await gamesRes.text());
      return NextResponse.json({ error: "Failed to fetch stream data" }, { status: 500 });
    }

    const gamesData: { data: TwitchStreamDataType[] } = await gamesRes.json();
    const currentStreamGames = new Set<string>();

    gamesData.data.forEach((stream) => {
      if (stream.game_id) {
        currentStreamGames.add(stream.game_id);
      }
    });

    // 過去の配信データを取得
    let paginationCursor: string | undefined = undefined;
    const pastVideosGames = new Set<string>();
    let i = 0;

    do {
      const videosRes = await fetch(`https://api.twitch.tv/helix/videos?user_id=${streamerId}&after=${paginationCursor || ''}`, {
        headers,
      });

      if (!videosRes.ok) {
        console.error("Error fetching video data:", videosRes.status, await videosRes.text());
        return NextResponse.json({ error: "Failed to fetch video data" }, { status: 500 });
      }

      const videosData: { data: TwitchVideoDataType[], pagination?: { cursor: string } } = await videosRes.json();

      videosData.data.forEach((video) => {
        if (video.title) {
          pastVideosGames.add(video.title);
        }
      });

      paginationCursor = videosData.pagination?.cursor;

      i += videosData.data.length;
      if (i >= 1000) { // 安全策として最大1000件
        break;
      }
    } while (paginationCursor);

    // 結果の整形
    const result: StreamerListType = {
      name: streamerName,
      customUrl: customUrl,
      id: streamerId,
      platform: 'twitch',
      color: 'defaultColor',
      thumbnail: thumbnail || 'default',
      viewer_count: view_count,
      streamId: Array.from(currentStreamGames),
      videoId: Array.from(pastVideosGames),
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching streamer details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}