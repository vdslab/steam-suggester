import { Rollups } from '@/types/Popularity/CountSteamReviews';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const GAME_ID = 271590;
  const res = await fetch(`https://store.steampowered.com/appreviewhistogram/${GAME_ID}?json=1&start_offset=0`)
  const data = await res.json()
  const rollups = data.results.rollups
  
  const reviewsCount = rollups.map((item:Rollups) => ({
    date: item.date,
    count: (item.recommendations_down + item.recommendations_up ) / 1000,
  }))

  return NextResponse.json(reviewsCount)
}