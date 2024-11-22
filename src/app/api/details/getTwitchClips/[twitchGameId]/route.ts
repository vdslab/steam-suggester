import TwitchToken from "@/app/api/TwitchToken";
import { TwitchClipApiType, TwitchClipDataType, TwitchClipType } from "@/types/api/getTwitchClipType";
import { NextResponse } from "next/server";

type Params = {
  params: {
    twitchGameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const ClipCount = 3;

  const gameId = params.twitchGameId;

  // 一ヶ月前の日付を取得
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const startedAtRFC3339 = oneMonthAgo.toISOString();// RFC3339形式に変換


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
    const data:TwitchClipApiType  = await res.json()

    // 同じ配信者のクリップを除外、日本語のクリップを取得、３件に制限
    // 日本語のクリップで3件に満たない場合、英語のクリップを追加
    const seenCreatorIds = new Set();
    const uniqueClips = data.data.filter((clip: TwitchClipDataType) => {
      if (seenCreatorIds.has(clip.broadcaster_id)) {
        return false;
      } else {
        seenCreatorIds.add(clip.broadcaster_id);
        return true;
      }
    })
    const japaneseUniqueClips = uniqueClips.filter((clip: TwitchClipDataType) => clip.language === 'ja');
    const japaneseUniqueClipsLimited = japaneseUniqueClips.slice(0, ClipCount);
    if(japaneseUniqueClipsLimited.length !== ClipCount) {
      const englishUniqueClips = uniqueClips.filter((clip: TwitchClipDataType) => clip.language !== 'ja').slice(0, ClipCount-japaneseUniqueClips.length);
      japaneseUniqueClipsLimited.push(...englishUniqueClips);
    }
    const resultClips:TwitchClipType[] = japaneseUniqueClipsLimited.map((clip: TwitchClipDataType) => {
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