import { TwitchTopGameType } from '@/types/TwitchTopGame';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const TWITCH_API_URL = 'https://api.twitch.tv/helix/games/top?first=100'
  
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


    // // 1~100件目のデータを取得
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
  } catch (error) {
    console.error('Error fetching top games:', error)
    return NextResponse.error()
  }
}