import TwitchToken from "@/app/api/TwitchToken";
import { 
  TwitchClipApiType, 
  TwitchClipDataType, 
  TwitchClipType, 
  TwitchUserDataType, 
  TwitchStreamDataType 
} from "@/types/api/getTwitchClipType";
import { NextResponse } from "next/server";

type Params = {
  params: {
    twitchUsername: string;
    twitchGameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const streamerUsername = decodeURIComponent(params.twitchUsername);  // Decode the URL-encoded username
  const ClipCount = 3;
  const gameId = params.twitchGameId;

  // 一ヶ月前の日付を取得
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const startedAtRFC3339 = oneMonthAgo.toISOString(); // RFC3339形式に変換

  try {
    // TwitchのAPIにアクセスするためのトークンを取得
    const token = await TwitchToken();

    // TwitchのAPIにアクセスするためのヘッダーを作成
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
    const streamsRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
      headers: headers,
    });

    const streamsData: { data: TwitchStreamDataType[] } = await streamsRes.json();

    // ゲームの情報を抽出
    const gamesPlayed = new Set<string>();
    streamsData.data.forEach((stream) => {
      if (stream.game_id) {
        gamesPlayed.add(stream.game_id);  // ゲームIDをSetに追加して重複を避ける
      }
    });

    // TwitchのAPIからクリップを取得
    const clipsRes = await fetch(
      `https://api.twitch.tv/helix/clips?game_id=${gameId}&started_at=${startedAtRFC3339}&is_featured=true&first=50`,
      {
        headers: headers,
      }
    );
    const clipsData: TwitchClipApiType = await clipsRes.json();

    // 同じ配信者のクリップを除外、日本語のクリップを取得、3件に制限
    // 日本語のクリップで3件に満たない場合、英語のクリップを追加
    const seenCreatorIds = new Set<string>();
    const uniqueClips = clipsData.data.filter((clip: TwitchClipDataType) => {
      if (seenCreatorIds.has(clip.broadcaster_id)) {
        return false;
      } else {
        seenCreatorIds.add(clip.broadcaster_id);
        return true;
      }
    });

    const japaneseUniqueClips = uniqueClips.filter((clip: TwitchClipDataType) => clip.language === 'ja');
    const japaneseUniqueClipsLimited = japaneseUniqueClips.slice(0, ClipCount);

    if (japaneseUniqueClipsLimited.length < ClipCount) {
      const englishUniqueClips = uniqueClips
        .filter((clip: TwitchClipDataType) => clip.language !== 'ja')
        .slice(0, ClipCount - japaneseUniqueClipsLimited.length);
      japaneseUniqueClipsLimited.push(...englishUniqueClips);
    }

    const resultClips: TwitchClipType[] = japaneseUniqueClipsLimited.map((clip: TwitchClipDataType) => ({
      id: clip.id,
      url: clip.url,
      embedUrl: clip.embed_url,
      image: clip.thumbnail_url,
      title: clip.title,
    }));

    return NextResponse.json(resultClips);

  } catch (error) {
    console.error('Error fetching user games or clips:', error);
    return NextResponse.error();
  }
}
