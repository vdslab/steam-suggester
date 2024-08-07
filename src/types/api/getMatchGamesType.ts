import { SteamDeviceType } from "./getSteamDetailType"

export type gameDetailType = {
  twitchGameId: string,
  steamGameId: string,
  title: string,
  imgURL: string,
  totalViews: number,
  gameData: {
    genres : string[],
    price: number,
    isSinglePlayer: boolean,
    isMultiPlayer: boolean,
    device: SteamDeviceType,
  }
}