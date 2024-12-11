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
  index: number;
  suggestValue: number;
  steamGameId: string;
  circleScale?: number;
  price: number;
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  device: {
    windows: boolean;
    mac: boolean;
  };
  twitchGameId: string;
  title: string;
  genres: string[];
  tags: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  imgURL: string;
  url: string;
  shortDetails: string;
  releaseDate: string;
  developerName: string;
  salePrice: string;
  playTime: string;
  review: { [word: string]: number };
  difficulty: number;
  graphics: number;
  story: number;
  music: number;
  primaryGenre?: string;
  totalViews?: number;
  activeUsers?: number;
}

export type LinkType = {
  source: number;
  target: number;
  index?: number;
  distance?: number;
}

export type SimilarGameType = {
  [key: string]: {
    steamGameId: string;
    twitchGameId: string;
  }[]
}