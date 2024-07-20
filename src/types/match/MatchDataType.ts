export type MatchDataType = {
  title: string;
  genres: GenreType[];
  price: number;
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  device: DeviceType;
};

export type GenreType = {
  id: number;
  description: string;
};

export type DeviceType = {
  windows: boolean;
  mac: boolean;
};