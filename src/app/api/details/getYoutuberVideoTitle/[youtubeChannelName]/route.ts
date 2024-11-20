import { NextResponse } from "next/server";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS = 20; // 最大取得数
const GAMING_CATEGORY_ID = "20"; // Gaming カテゴリ ID

type Params = {
  params: {
    youtubeUserId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const userId = params.youtubeUserId;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("Missing YouTube API key");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    // チャンネル情報取得
    const channelRes = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=snippet,contentDetails&id=${encodeURIComponent(userId)}&key=${apiKey}`
    );
    if (!channelRes.ok) {
      console.error("Error fetching channel data:", channelRes.status, await channelRes.text());
      return NextResponse.error();
    }

    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
      console.error("Channel not found");
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channel = channelData.items[0];
    const streamerName = channel.snippet.title;
    const streamerId = channel.id;
    const thumbnail = channel.snippet.thumbnails.default.url;
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // 現在配信中の情報
    const currentStreamGames = new Set<string>();
    // ライブストリーム情報取得のロジックを追加可能

    // 過去の動画タイトルを取得（Gaming カテゴリ限定）
    const pastVideosGames = new Set<string>();
    let nextPageToken: string | undefined = undefined;

    do {
      const videosRes = await fetch(
        `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${MAX_RESULTS}&pageToken=${nextPageToken || ''}&key=${apiKey}`
      );
      if (!videosRes.ok) {
        console.error("Error fetching videos data:", videosRes.status, await videosRes.text());
        return NextResponse.error();
      }

      const videosData = await videosRes.json();
      const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId).join(",");

      // 動画ごとの詳細情報を取得
      const detailsRes = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=snippet&id=${videoIds}&key=${apiKey}`
      );
      if (!detailsRes.ok) {
        console.error("Error fetching video details:", detailsRes.status, await detailsRes.text());
        return NextResponse.error();
      }

      const detailsData = await detailsRes.json();
      detailsData.items.forEach((video: any) => {
        if (video.snippet.categoryId === GAMING_CATEGORY_ID) {
          pastVideosGames.add(video.snippet.title);
        }
      });

      nextPageToken = videosData.nextPageToken;
    } while (nextPageToken);

    // 結果を整形
    const result = {
      name: streamerName,
      id: streamerId,
      color: "defaultColor",
      thumbnail: thumbnail,
      viewer_count: -1,
      youtubeStreamId: Array.from(currentStreamGames),
      youtubeVideoId: Array.from(pastVideosGames),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
