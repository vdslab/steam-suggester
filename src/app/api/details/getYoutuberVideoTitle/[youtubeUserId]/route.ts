import { NextResponse } from "next/server";
// import { getCachedData, setCachedData } from "../../../../lib/cache";
import { StreamerListType } from "@/types/NetworkType";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS = 20; // 最大取得数
const GAMING_CATEGORY_ID = "20"; // GamingカテゴリID

type Params = {
  params: {
    youtubeUserId: string;
  };
};

// YouTube API のレスポンス用の型定義
interface ChannelResponse {
  items: Array<{
    id: string;
    snippet: {
      customUrl: string;
      title: string;
      thumbnails: {
        default: { url: string };
      };
    };
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }>;
}

interface SearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: any;
  }>;
}

interface PlaylistItemsResponse {
  items: Array<{
    contentDetails: {
      videoId: string;
    };
  }>;
  nextPageToken?: string;
}

interface VideoDetailsResponse {
  items: Array<{
    snippet: {
      categoryId: string;
      title: string;
    };
  }>;
}

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

    const channelData: ChannelResponse = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
      console.error("Channel not found");
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channel = channelData.items[0];
    const streamerName = channel.snippet.title;
    const customUrl = channel.snippet.customUrl;
    const streamerId = channel.id;
    const thumbnail = channel.snippet.thumbnails.default.url;
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;


    if (!uploadsPlaylistId) {
      console.error("Uploads playlist ID not found");
      return NextResponse.json({ error: "Uploads playlist ID not found" }, { status: 500 });
    }

    // 現在配信中の情報を取得
    const liveStreamRes = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${encodeURIComponent(userId)}&eventType=live&type=video&key=${apiKey}`
    );
    if (!liveStreamRes.ok) {
      console.error("Error fetching live stream data:", liveStreamRes.status, await liveStreamRes.text());
      return NextResponse.error();
    }

    const liveStreamData: SearchResponse = await liveStreamRes.json();
    const currentStreamGames = new Set<string>();
    if (liveStreamData.items.length > 0) {
      // 1つのライブストリームを想定
      const liveStream = liveStreamData.items[0];
      const liveVideoId = liveStream.id.videoId;

      if (liveVideoId) {
        // 動画の詳細情報を取得
        const liveVideoRes = await fetch(
          `${YOUTUBE_API_BASE}/videos?part=snippet&id=${encodeURIComponent(liveVideoId)}&key=${apiKey}`
        );
        if (!liveVideoRes.ok) {
          console.error("Error fetching live video details:", liveVideoRes.status, await liveVideoRes.text());
          return NextResponse.error();
        }

        const liveVideoData: VideoDetailsResponse = await liveVideoRes.json();
        if (liveVideoData.items.length > 0) {
          const liveVideo = liveVideoData.items[0];
          const categoryId = liveVideo.snippet.categoryId;

          // ゲームカテゴリ名を取得
          if (categoryId) {
            const categoryRes = await fetch(
              `${YOUTUBE_API_BASE}/videoCategories?part=snippet&id=${encodeURIComponent(categoryId)}&key=${apiKey}`
            );
            if (categoryRes.ok) {
              const categoryData = await categoryRes.json();
              if (categoryData.items && categoryData.items.length > 0) {
                const categoryName = categoryData.items[0].snippet.title;
                currentStreamGames.add(categoryName);
              }
            } else {
              console.warn("Error fetching category data:", categoryRes.status, await categoryRes.text());
            }
          }
        }
      }
    }

    // 過去の動画タイトルを取得（Gaming カテゴリ限定）
    const pastVideosGames = new Set<string>();
    let nextPageToken: string | undefined = undefined;

    do {
      // URLSearchParams を使用してクエリパラメータを構築
      const params = new URLSearchParams({
        part: "contentDetails",
        playlistId: uploadsPlaylistId,
        maxResults: MAX_RESULTS.toString(),
        key: apiKey,
      });
      if (nextPageToken) {
        params.append("pageToken", nextPageToken);
      }

      const playlistItemsUrl = `${YOUTUBE_API_BASE}/playlistItems?${params.toString()}`;

      const videosRes = await fetch(playlistItemsUrl);
      if (!videosRes.ok) {
        console.error("Error fetching videos data:", videosRes.status, await videosRes.text());
        return NextResponse.error();
      }

      const videosData: PlaylistItemsResponse = await videosRes.json();

      if (!videosData.items || !Array.isArray(videosData.items)) {
        console.error("Invalid videos data structure");
        return NextResponse.json({ error: "Invalid videos data structure" }, { status: 500 });
      }

      const videoIds = videosData.items
        .map((item) => item.contentDetails.videoId)
        .filter((videoId): videoId is string => typeof videoId === "string")
        .join(",");

      if (videoIds) {
        // 動画ごとの詳細情報を取得
        const detailsRes = await fetch(
          `${YOUTUBE_API_BASE}/videos?part=snippet&id=${encodeURIComponent(videoIds)}&key=${apiKey}`
        );
        if (!detailsRes.ok) {
          console.error("Error fetching video details:", detailsRes.status, await detailsRes.text());
          return NextResponse.error();
        }

        const detailsData: VideoDetailsResponse = await detailsRes.json();
        detailsData.items.forEach((video) => {
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
      customUrl: customUrl,
      platform: 'youtube',
      color: 'defaultColor',
      thumbnail: thumbnail || 'default',
      viewer_count: 'default',
      streamId: Array.from(currentStreamGames),
      videoId: Array.from(pastVideosGames),
    };


    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
