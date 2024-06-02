import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const GAME_ID = 511224
  const today = new Date()
  const weekBefore = new Date()
  weekBefore.setDate(today.getDate() - 7)
  
  const headers = new Headers();
  if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_ACCESS_TOKEN) {
    headers.append('Client-ID', process.env.TWITCH_CLIENT_ID);
    headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);
  } else {
    return NextResponse.error()
  }

  const res = await fetch(
    `https://api.twitch.tv/helix/clips?game_id=${GAME_ID}&first=5`,
    {
      headers: headers,
    }
  )
  const data = await res.json()
  const clips = data.data.map((clip: any) => {
    return ({
      id: clip.id,
      url: clip.url,
      image: clip.thumbnail_url,
      title: clip.title,
      viewCount: clip.view_count,
    })
  })

  return NextResponse.json(clips)
}