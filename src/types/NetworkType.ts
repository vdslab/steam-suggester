export type IconType = {
  title: string;
  imgURL: string;
  index: number;
  steamGameId: string;
  twitchGameId: string;
  circleScale: number;
  isHovered: boolean;
  selectedIndex: number;
  similarGamesLinkList: LinkType[];
};

export type SteamListType = {
  steamGameId: string;
  title: string;
  index?: number;
};

export type StreamerListType = {
  name: string;
  id: string;
  customUrl: string;
  platform: "twitch" | "youtube";
  color: string;
  thumbnail: string;
  viewer_count: number | "default";
  streamId: string[];
  videoId: string[];
};

export type NodeType = {
  index: number;
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
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  imgURL: string;
  url: string;
  shortDetails: string;
  releaseDate: string;
  developerName: string;
  review: {
    name: string;
    score: number;
    tfidf: number;
  }[];
  primaryGenre?: string;
  totalViews?: number;
  activeUsers?: number;
  similarGames?: string[];
  featureVector?: number[];
  background?: string;
  screenshots?: string[];
  mp4Movies?: string[];
};

export type LinkType = {
  source: NodeType;
  target: NodeType;
  index?: number;
  distance?: number;
  similarity?: number;
  elementScores?: number[];
};

export type SimilarGameType = {
  [key: string]: {
    steamGameId: string;
    twitchGameId: string;
  }[];
};
