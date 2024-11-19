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

export type StreamerListType = {
  name: string;
  id: string;
  twitchStreamId: string[];
  twitchVideoId: string[];
  color: string;
  thumbnail: string;
  viewer_count: number;
}

export type NodeType = {
  twitchVideoTitle: string;
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
  source: NodeType | number;
  target: NodeType | number;
  index?: number;
}

export type SimilarGameType = {
  [key: string]: {
    steamGameId: string;
    twitchGameId: string;
  }[]
}