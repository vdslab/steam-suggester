export type MatchDataType = {
  title: string;
  genres: GenreType[];
  price: number;
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  device: DeviceType;
  description: string;
  header_image: string;
};

export type GenreType = {
  id: number;
  description: string;
};

export type DeviceType = {
  windows: boolean;
  mac: boolean;
};