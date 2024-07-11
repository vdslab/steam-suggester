import { NextResponse } from 'next/server';

type Params = {
  params: {
    gameId: string;
  };
}

export async function GET(req: Request, { params }:Params) {

  const gameId = params.gameId
  const GAME_IDS = [1172470, 1938090, 730, 359550];

  const gameDetails = [];

  for( let i = 0; i < GAME_IDS.length; i++ ) {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${GAME_IDS[i]}&cc=jp`)
    const data = await res.json()
    gameDetails.push({
      name: data[GAME_IDS[i]].data.name,
      image: data[GAME_IDS[i]].data.header_image,
      url: `https://store.steampowered.com/app/${GAME_IDS[i]}`,
    })
  }
  

  return NextResponse.json(gameDetails)
}