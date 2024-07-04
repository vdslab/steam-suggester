import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const gameNames2 = {
    "data": [
      {
        "id": "000000",
        "name": "LEGO® Star Wars"
      },
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
      const gameId = data.items[0].id; // 先頭の要素を対象

      const res2 = await fetch(`https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=jp`);
      const data2 = await res2.json();
      if (data2[`${gameId}`]?.data) {
        let setIsSinglePlayer = false;
        const hasSinglePlayer = data2[`${gameId}`].data.categories.some(category => category.id === 2);
        if (hasSinglePlayer) {
          setIsSinglePlayer = true;
        }

        let setIsMultiPlayer = false;
        const hasMultiPlayer = data2[`${gameId}`].data.categories.some(category => category.id === 1);
        if (hasMultiPlayer) {
          setIsMultiPlayer = true;
        }

        const result = {
          steamGameID: gameId,
          title: data2[`${gameId}`].data.name,
          imgURL: data2[`${gameId}`].data.header_image,
          gameData: {
            genres: data2[`${gameId}`].data.genres,
            categories: data2[`${gameId}`].data.categories,
            isSinglePlayer: setIsSinglePlayer,
            isMultiPlayer: setIsMultiPlayer,
            priceOverview: data.items[0].price?.initial / 100 ?? -1,
            salePriceOverview: data.items[0].price?.final / 100 ?? -1,
            platforms: {
              windows: data.items[0].platforms?.windows ?? false,
              mac: data.items[0].platforms?.mac ?? false,
              linux: data.items[0].platforms?.linux ?? false
            }
          }
        };
        resultArray.push(result);
      }
    }
  }

  return NextResponse.json(resultArray);
}
