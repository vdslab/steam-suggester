import TwitchToken from "@/app/api/TwitchToken";
import { NextResponse } from "next/server";

type Params = {
  params: {
    twitchGameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {

  const gameId = params.twitchGameId;

  // 一週間前の日付を取得
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const startedAtRFC3339 = oneWeekAgo.toISOString();// RFC3339形式に変換


  try {
    // TwitchのAPIにアクセスするためのトークンを取得
    const token = await TwitchToken();

    // TwitchのAPIにアクセスするためのヘッダーを作成
    const headers = new Headers();
    if (process.env.TWITCH_CLIENT_ID && token) {
      headers.append('Client-ID', process.env.TWITCH_CLIENT_ID);
      headers.append('Authorization', `Bearer ${token}`);
    } else {
      return NextResponse.error()
    }

    // 英語のクリップが多すぎるから５０件取得
    const res = await fetch(
      `https://api.twitch.tv/helix/clips?game_id=${gameId}&started_at=${startedAtRFC3339}&is_featured=true&first=50`,
      {
        headers: headers,
      }
    )
    const data = await res.json()

    // 同じ配信者のクリップを除外、日本語のクリップを取得、３件に制限
    const seenCreatorIds = new Set();
    const uniqueClips = data.data.filter((clip: any) => {
      if (seenCreatorIds.has(clip.broadcaster_id)) {
        return false;
      } else {
        seenCreatorIds.add(clip.broadcaster_id);
        return true;
      }
    })
    const japaneseUniqueClips = uniqueClips.filter((clip: any) => clip.language === 'ja');
    const japaneseUniqueClipsLimited = japaneseUniqueClips.slice(0, 3);
    const resultClips = japaneseUniqueClipsLimited.map((clip: any) => {
      return ({
        id: clip.id,
        url: clip.url,
        embedUrl: clip.embed_url,
        image: clip.thumbnail_url,
        title: clip.title,
      })
    })

    return NextResponse.json(resultClips)

  } catch (error) {
    console.error('Error fetching clips:', error)
    return NextResponse.error()
  }
}