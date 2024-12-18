import { NextResponse } from "next/server";
// import { getCachedData, setCachedData } from "../../../../lib/cache"; 
import { StreamerListType } from "@/types/NetworkType";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS = 10; // 最大取得数

type Params = {
  params: {
    youtubeChannelName: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const channelName = params.youtubeChannelName;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("Missing YouTube API key");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    // 部分一致でチャンネル検索
    const channelRes = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(channelName)}&maxResults=${MAX_RESULTS}&key=${apiKey}`
    );
    if (!channelRes.ok) {
      console.error("Error fetching channel data:", channelRes.status, await channelRes.text());
      return NextResponse.error();
    }

    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
      console.error("No channels found");
      return NextResponse.json({ error: "No channels found" }, { status: 404 });
    }

    const result: StreamerListType[] = channelData.items.map((channel: any) => ({
      name: channel.snippet.channelTitle,
      id: channel.id.channelId,
      customUrl: 'default',
      platform: 'youtube',
      color: 'default',
      thumbnail: channel.snippet.thumbnails.default.url || "default",
      viewer_count: 'default',
      streamId: ['default'],
      videoId: ['default'],
    }));


    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}