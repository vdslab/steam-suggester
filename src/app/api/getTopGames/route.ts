import { TwitchTopGameType } from '@/types/TwitchTopGame';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const TWITCH_API_URL = 'https://api.twitch.tv/helix/games/top?first=100'
  
  const headers = new Headers();
  if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_ACCESS_TOKEN) {
    headers.append('Client-ID', process.env.TWITCH_CLIENT_ID);
    headers.append('Authorization', `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`);
  } else {
    return NextResponse.error()
  }

  // 1~100件目のデータを取得
  const firstRes = await fetch(TWITCH_API_URL,{headers: headers,})
  const firstData = await firstRes.json()
  const pageCursor = firstData.pagination.cursor
  const firstGames = firstData.data.map((game: TwitchTopGameType) => {
    return ({
      twitchGameId: game.id,
      title: game.name,
    })
  })

  // 100~200件目のデータを取得
  const secondRes = await fetch(
    `${TWITCH_API_URL}&after=${pageCursor}`,
    {
      headers: headers,
    }
  )
  const secondData = await secondRes.json()
  const secondGames = secondData.data.map((game: TwitchTopGameType) => {
    return ({
      twitchGameId: game.id,
      title: game.name,
    })
  })

  const games = firstGames.concat(secondGames)

  return NextResponse.json(games)
}