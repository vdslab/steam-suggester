import { SteamDeviceType } from "./api/getSteamDetailType";

export type IconType = {
  title: string;
  imgURL: string;
  index: number;
  steamGameId: string;
  twitchGameId: string;
  circleScale: number;
  suggestValue: number;
}

export type SteamListType = {
  steamGameId: string;
  title: string;
}

export type StreamerListType = {
  name: string;
  id: string;
  platform: 'twitch' | 'youtube';
  color: string;
  thumbnail: string;
  viewer_count: number | 'default';
  streamId: string[];
  videoId: string[];
};

export type NodeType = {
  steamGameId: string;
  twitchGameId: string;
  totalViews?: number;
  title: string;
  genres : string[];
  tags: string[];
  price: number;
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  device: SteamDeviceType;
  imgURL: string;
  url: string;
  shortDetails: string;
  releaseDate: string;
  developerName: string;
  salePrice: string;
  playTime: string;
  review: object;
  difficulty: number;
  graphics: number;
  story: number;
  music: number;
  suggestValue: number;

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