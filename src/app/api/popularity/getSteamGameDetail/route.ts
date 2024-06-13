import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const GAME_ID = 438640;
  const gameNames = ["Apex", "Interstellar Distress"];

  const resultArray: any[] = [];
  for(const game of gameNames){
    const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${game}&cc=JP`)
    const data = await res.json()
    const gameId = data.items[0].id;

    const res2 = await fetch(`https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=jp`)
    const data2 = await res2.json()
    const result = {/*name: data2.items[0].name, */
      name: data2[`${gameId}`].data.name,
      genres: data2[`${gameId}`].data.genres,
      categories: data2[`${gameId}`].data.categories
    }
    resultArray.push(result);
  }

  return NextResponse.json(resultArray)
}