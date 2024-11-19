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
    const streamerId = user.id;
    const thumbnail = user.profile_image_url;
    const view_count = user.view_count;
    // console.log(user);

    // 現在配信されているゲームIDを取得
    const gamesRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${streamerId}`, { headers });

    if (!gamesRes.ok) {
      console.error("Error fetching stream data:", gamesRes.status, await gamesRes.text());
      return NextResponse.error();
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
        return NextResponse.error();
      }

      const videosData: { data: TwitchVideoDataType[], pagination?: { cursor: string } } = await videosRes.json();

      videosData.data.forEach((video) => {
        if (video.title) {
          pastVideosGames.add(video.title);
        }
      });

      paginationCursor = videosData.pagination?.cursor;

      i += videosData.data.length;
      if (i >= 1000) {
        break;
      }
    } while (paginationCursor);

    // 最終結果の作成
    const result = {
      name: streamerName,
      id: streamerId,
      color: 'defaultColor',
      thumbnail: thumbnail,
      twitchStreamId: Array.from(currentStreamGames),
      twitchVideoId: Array.from(pastVideosGames),
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
