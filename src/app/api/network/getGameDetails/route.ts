import { gameDetailType } from '@/types/api/gameDetailsType';
import { steamGamePlatformType, steamGameGenreType, steamGameCategoryType } from '@/types/api/steamDataType';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {

  const response = await fetch(`http://localhost:3000/api/getTopGames`)
  const twitchGameNames = await response.json()

  const resultArray: gameDetailType[] = [];

  for (const game of twitchGameNames) {

    // steamAPIでゲームタイトルからタイトル、steamID、画像URL、価格、プラットフォームを取得
    const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${game.title}&cc=JP`)
    const resJson = await res.json()
    const firstMatchGame = resJson.items[0]
    // steamAPIでゲームタイトルから取得できなかった場合は次のゲームに移る
    if (!firstMatchGame) {
      continue
    }
    // 上記の情報を宣言
    const steamGameId:string  = firstMatchGame.id
    const title: string       = firstMatchGame.name
    const imgURL: string      = firstMatchGame.header_image
    const price:number        = firstMatchGame.price ? firstMatchGame.price.final : 0
    const platforms:steamGamePlatformType = {
      windows: firstMatchGame.platforms.windows,
      mac: firstMatchGame.platforms.mac,
      linux: firstMatchGame.platforms.linux
    }
    

    // steamAPIでゲームIDからジャンル、プレイヤー数がどうか、プレイ時間、カテゴリーを取得
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamGameId}&cc=jp`)
    const responseJson = await response.json()
    const gameDetailData = responseJson[steamGameId].data
    // 上記の情報を宣言。２はシングルプレイヤー、１はマルチプレイヤー
    const genres: string[]        = gameDetailData.genres.map( (genre: steamGameGenreType) => genre.description)
    const isSinglePlayer: boolean = gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 2)
    const isMultiPlayer: boolean  = gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 1)

    // 結果を配列に格納
    resultArray.push({
      twitchGameId: game.twitchGameId,
      steamGameId: steamGameId,
      title: title,
      imgURL: imgURL,
      gameData: {
        genres : genres,
        price: price,
        isSinglePlayer: isSinglePlayer,
        isMultiPlayer: isMultiPlayer,
        platforms: platforms,
      }
    })
    
  }

  return NextResponse.json(resultArray);
}