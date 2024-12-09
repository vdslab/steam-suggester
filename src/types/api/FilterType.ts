export type Filter = {
  Genres: { [key: string]: boolean};
  Price: { startPrice: number, endPrice: number };
  Mode: {
    isSinglePlayer: boolean,
    isMultiPlayer: boolean
  };
  Device: {
      windows: boolean,
      mac: boolean
  };
  Playtime: { [key: string]: boolean };
}

export type SliderSettings = {
  id: string;
  genreWeight: number;
  graphicWeight: number;
  playstyleWeight: number;
  reviewWeight: number;
  isDetailMode: boolean;
  subGenreWeight: number;
  systemWeight: number;
  visualWeight: number;
  worldviewWeight: number;
  difficultyWeight: number;
  playtimeWeight: number;
  priceWeight: number;
  developerWeight: number;
  deviceWeight: number;
  releaseDateWeight: number;
};