import { SteamDeviceType, SteamGenreType } from "./api/getSteamDetailType";

export type IconType = {
  title: string;
  imgURL: string;
  index: number;
  steamGameId: string;
  twitchGameId: string;
  circleScale: number;
}

export type SteamListType = {
  steamGameId: string;
  title: string;
}

export type NodeType = {
  steamGameId: string;
  twitchGameId: string;
  totalViews?: number;
  title: string;
  genres : SteamGenreType[];
  price: number;
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  device: SteamDeviceType;
  imgURL: string;
  url: string;

  index: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  circleScale?: number;
}

export type LinkType = {
  source: number | NodeType;
  target: number | NodeType;
  index: number;
}