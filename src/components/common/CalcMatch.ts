import { Filter } from "@/types/api/FilterType";
import { SteamDeviceType } from "@/types/api/getSteamDetailType";
import * as d3 from "d3";

export const calcGenresPercentage = (filter: Filter, genres: string[]) => {
  let genreCount = 0;

  genres.forEach((genre: string) => {
    if(filter.Genres[genre]) {
      genreCount++;
    }
  });

  return parseFloat(((genreCount / genres.length) * 100).toFixed(1));
}

const calcPricePercentage = (filter: Filter, price: number) => {
  const startPrice = filter.Price.startPrice;
  const endPrice = filter.Price.endPrice;
  const diffPrice = endPrice - startPrice;
  const diffScale = d3.scaleLinear()
                  .domain([0, diffPrice])
                  .range([100, 0]);

  if(startPrice <= price && price <= endPrice) {
    return 100;
  } else if(price < startPrice) {
    const diff = startPrice - price;
    return diffScale(diff) >= 0 ? diffScale(diff) : 0;
  } else {
    const diff = price - endPrice;
    return diffScale(diff) >= 0 ? diffScale(diff) : 0;
  }
}

const calcModePercentage = (filter: Filter, modes: {isSinglePlayer: boolean, isMultiPlayer: boolean}) => {
  let modeCount = 0;
  Object.keys(modes).forEach((mode: string) => {
    if(mode === "isSinglePlayer" && filter.Mode.isSinglePlayer || mode === "isMultiPlayer" && filter.Mode.isMultiPlayer) {
      modeCount++;
    }
  });

  return (modeCount / 2) * 100;
}

export const calcDevicePercentage = (filter: Filter, devices: SteamDeviceType) => {
  let deviceCount = 0;
  Object.keys(devices).forEach((device: string) => {
    if((device === "windows" && filter.Device.windows) || (device === "mac" && filter.Device.mac)) {
      deviceCount++;
    }
  });

  return (deviceCount / 2) * 100;
}

export const calcAllMatchPercentage = (filter: Filter, data: {
  genres : string[],
  price: number,
  isSinglePlayer: boolean,
  isMultiPlayer: boolean,
  device: SteamDeviceType,
}) => {
  const genreMatchPercent = calcGenresPercentage(filter, data.genres);
  const priceMatchPercent = calcPricePercentage(filter, data.price);
  const modeMatchPercent = calcModePercentage(filter, {isSinglePlayer: data.isSinglePlayer, isMultiPlayer: data.isMultiPlayer});
  const deviceMatchPercent = calcDevicePercentage(filter, data.device);

  return parseFloat(((genreMatchPercent + priceMatchPercent + modeMatchPercent + deviceMatchPercent) / 4).toFixed(1));
}