export type MatchDataType = {
  title: string;
  genres: GenreType[];
  price: number;
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  platforms: PlatformsType
};

export type GenreType = {
  id: number;
  description: string;
};

export type PlatformsType = {
  windows: boolean;
  mac: boolean;
  linux: boolean;
};