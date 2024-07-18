import { NextResponse } from 'next/server';

type Params = {
  params: {
    gameId: string;
  };
}

export async function GET(req: Request, { params }:Params) {
  const gameId = params.gameId

  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=jp`)
  const data = await res.json()

  const gameDetail = {
    name: data[gameId].data.name,
    image: data[gameId].data.header_image,
    url: `https://store.steampowered.com/app/${gameId}`,
  }

  return NextResponse.json(gameDetail)
}