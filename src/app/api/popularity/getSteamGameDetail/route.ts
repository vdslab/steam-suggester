import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const GAME_ID = 271590;
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${GAME_ID}&cc=jp`)
  const data = await res.json()

  return NextResponse.json(data[GAME_ID].data.genres.map((genre: { id: number }) => genre.id.toString()))//test
}