export type Filter = {
  Categories: { [key: string]: boolean };
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