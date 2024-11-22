import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "../../../../lib/cache";
import { StreamerListType } from "@/types/NetworkType";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS = 20; // 最大取得数
const GAMING_CATEGORY_ID = "20"; // GamingカテゴリID

type Params = {
  params: {
    youtubeUserId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const userId = params.youtubeUserId;
  const apiKey = "";//process.env.YOUTUBE_API_KEY
  const cacheKey = `youtubeUserId-${userId}`;

  if (!apiKey) {
    console.error("Missing YouTube API key");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  // キャッシュチェック
  const cached = getCachedData(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
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

    // 現在配信中の情報を取得
    const liveStreamRes = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${userId}&eventType=live&type=video&key=${apiKey}`
    );
    if (!liveStreamRes.ok) {
      console.error("Error fetching live stream data:", liveStreamRes.status, await liveStreamRes.text());
      return NextResponse.error();
    }

    const liveStreamData = await liveStreamRes.json();
    const currentStreamGames = new Set<string>();
    if (liveStreamData.items.length > 0) {
      // 1つのライブストリームを想定
      const liveStream = liveStreamData.items[0];
      const liveVideoId = liveStream.id.videoId;

      // 動画の詳細情報を取得
      const liveVideoRes = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=snippet&id=${liveVideoId}&key=${apiKey}`
      );
      if (!liveVideoRes.ok) {
        console.error("Error fetching live video details:", liveVideoRes.status, await liveVideoRes.text());
        return NextResponse.error();
      }

      const liveVideoData = await liveVideoRes.json();
      if (liveVideoData.items.length > 0) {
        const liveVideo = liveVideoData.items[0];
        const categoryId = liveVideo.snippet.categoryId;

        // ゲームカテゴリ名を取得
        if (categoryId) {
          const categoryRes = await fetch(
            `${YOUTUBE_API_BASE}/videoCategories?part=snippet&id=${categoryId}&key=${apiKey}`
          );
          if (categoryRes.ok) {
            const categoryData = await categoryRes.json();
            if (categoryData.items.length > 0) {
              const categoryName = categoryData.items[0].snippet.title;
              currentStreamGames.add(categoryName);
            }
          }
        }
      }
    }

    // 過去の動画タイトルを取得（Gaming カテゴリ限定）
    const pastVideosGames = new Set<string>();
    let nextPageToken: string | undefined = undefined;

    do {
      const videosRes = await fetch(
        `${YOUTUBE_API_BASE}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${MAX_RESULTS}&pageToken=${nextPageToken || ''}&key=${apiKey}`
      );
      if (!videosRes.ok) {
        console.error("Error fetching videos data:", videosRes.status, await videosRes.text());
        return NextResponse.error();
      }

      const videosData = await videosRes.json();
      const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId).join(",");

      if (videoIds) {
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
      }

      nextPageToken = videosData.nextPageToken;
    } while (nextPageToken);

    const result: StreamerListType = {
      name: streamerName,
      id: streamerId,
      platform: 'youtube',
      color: 'defaultColor',
      thumbnail: thumbnail || 'default',
      viewer_count: 'default',
      streamId: Array.from(currentStreamGames),
      videoId: Array.from(pastVideosGames),
    };

    // キャッシュに保存
    setCachedData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
