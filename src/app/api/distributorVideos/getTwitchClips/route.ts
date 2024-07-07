import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const GAME_ID = 511224
  const today = new Date()
  const weekBefore = new Date()
  weekBefore.setDate(today.getDate() - 7)
  
  try {
    // TwitchのAPIにアクセスするためのトークンを取得
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getTwitchToken`);
    if (!tokenResponse.ok) {
      return NextResponse.error()
    }
    const token = await tokenResponse.json();

    // TwitchのAPIにアクセスするためのヘッダーを作成
    const headers = new Headers();
    if (process.env.TWITCH_CLIENT_ID && token) {
      headers.append('Client-ID', process.env.TWITCH_CLIENT_ID);
      headers.append('Authorization', `Bearer ${token}`);
    } else {
      return NextResponse.error()
    }

    const res = await fetch(
      `https://api.twitch.tv/helix/clips?game_id=${GAME_ID}&first=3`,
      {
        headers: headers,
      }
    )
    const data = await res.json()
    const clips = data.data.map((clip: any) => {
      return ({
        id: clip.id,
        url: clip.url,
        embedUrl: clip.embed_url,
        image: clip.thumbnail_url,
        title: clip.title,
      })
    })

    return NextResponse.json(clips)

  } catch (error) {
    console.error('Error fetching clips:', error)
    return NextResponse.error()
  }
}