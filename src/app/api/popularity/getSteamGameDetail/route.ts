  import { NextResponse } from 'next/server';
  export async function GET(req: Request) {
    const GAME_ID = 438640; // 仮

    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${GAME_ID}&cc=jp`)
    const data = await res.json()
    const result = {
      name: data[`${GAME_ID}`].data.name,
      genres: data[`${GAME_ID}`].data.genres,
      categories: data[`${GAME_ID}`].data.categories,
      priceOverview: parseInt(data[`${GAME_ID}`].data.price_overview.final_formatted.replace(/[^\d]/g, ''), 10)
    }

    return NextResponse.json(result)
  }

// import { NextResponse } from 'next/server';

// export async function GET(req: Request) {
//   const GAME_ID = 438640;// 仮

//   const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${GAME_ID}&cc=jp`)
//   const data = await res.json()
//   const result = {
//     name: data[`${GAME_ID}`].data.name,
//     genres: data[`${GAME_ID}`].data.genres,
//     categories: data[`${GAME_ID}`].data.categories,
//     priceOverview: parseInt(data[`${GAME_ID}`].data.price_overview.final_formatted.replace(/[^\d]/g, ''), 10)
//   }

//   return NextResponse.json(result)
// }
