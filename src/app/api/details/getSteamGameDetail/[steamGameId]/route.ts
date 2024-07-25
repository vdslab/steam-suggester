import { SteamCategoryType, SteamDetailApiType, SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { NextResponse } from "next/server";

type Params = {
  params: {
    steamGameId: string;
  };
};

export async function GET(req: Request, {params}: Params) {
  const steamGameId = params.steamGameId;


  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamGameId}&cc=jp`);
  const responseJson = await response.json();
  const gameDetailData:SteamDetailApiType = responseJson[steamGameId].data

  const result:SteamDetailsDataType = {

    // マッチ度で使用
    title: gameDetailData.name,
    genres: gameDetailData.genres,
    price: gameDetailData.price_overview ? gameDetailData.price_overview.final / 100 : 0,
    isSinglePlayer: gameDetailData.categories.some((category: SteamCategoryType) => category.id === 2),
    isMultiPlayer: gameDetailData.categories.some((category: SteamCategoryType) => category.id === 1),
    device: {
      windows: gameDetailData.platforms.windows,
      mac: gameDetailData.platforms.mac,
    },

    // 類似度で使用
    name: gameDetailData.name,
    image: gameDetailData.header_image,
    url: `https://store.steampowered.com/app/${steamGameId}`,

    // 説明欄で使用
    short_description: gameDetailData.short_description,
    header_image: gameDetailData.header_image,
    
  }

  return NextResponse.json(result);
}
