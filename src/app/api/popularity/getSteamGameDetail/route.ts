import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const gameNames2 = {
    "data": [
      {
        "id": "000000",
        "name": "fall guys"
      },
      {
        "id": "000000",
        "name": "Apex"
      }
    ]
  };

  const resultArray: string[] = [];

  for (const game of gameNames2.data) {
    const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${game.name}&cc=JP`);
    const data = await res.json();
    if (data.items.length > 0) {
      const gameId = data.items[0].id;

      const res2 = await fetch(`https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=jp`);
      const data2 = await res2.json();
      if (data2[`${gameId}`]?.data) {
        const result = {
          name: data2[`${gameId}`].data.name,
          genres: data2[`${gameId}`].data.genres,
          categories: data2[`${gameId}`].data.categories
        };
        resultArray.push(result);
      }
    }
  }

  return NextResponse.json(resultArray);
}
