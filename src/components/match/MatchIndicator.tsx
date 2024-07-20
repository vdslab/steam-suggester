"use client"; 
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { getFilterData } from '@/hooks/indexedDB';
import { Filter } from '@/types/api/FilterType';
import { steamGameGenreType } from '@/types/api/steamDataType';
import { DeviceType } from '@/types/match/MatchDataType';
import * as d3 from 'd3';
import React, { useState, useEffect } from 'react';

interface Genre {
  id: string;
  description: string;
}

interface Category {
  id: number;
  description: string;
}

interface MatchIndicatorProps {
  data: {
    name: string;
    imgURL: string;
    genres: Genre[];
    categories: Category[];
    isSinglePlayer: boolean;
    isMultiPlayer: boolean;
    price: number;
    device: DeviceType;
  }
};

const MatchIndicator: React.FC<MatchIndicatorProps> = ( props ) => {
  const data = props.data;
  const [localFilter, setLocalFilter] = useState<Filter>(DEFAULT_FILTER);
  const [genreMatchPercentage, setGenreMatchPercentage] = useState<number>(0);
  const [overallMatchPercentage, setOverallMatchPercentage] = useState<number>(0);

  useEffect(() => {
    (async() => {
      const d = await getFilterData('unique_id');
      if(d) {
        setLocalFilter(d);
      }
    })();
  }, [])

  useEffect(() => {
    // 一致度を計算（ジャンル）
    const genreMatchPercent = calcGenresPercentage(localFilter, data.genres);

    // 一致度を計算(価格)
    const priceMatchPercent = calcPricePercentage(localFilter, data.price);

    // 一致度を計算(ゲームモード)
    const modeMatchPercent = calcModePercentage(localFilter, {isSinglePlayer: data.isSinglePlayer, isMultiPlayer: data.isMultiPlayer});

    // 一致度を計算(対応デバイス)
    const deviceMatchPercent = calcDevicePercentage(localFilter, data.device);

    // 一致度を計算(全体)
    const overallMatchPercentage = parseFloat(((genreMatchPercent + priceMatchPercent + modeMatchPercent + deviceMatchPercent) / 4).toFixed(1));

    setGenreMatchPercentage(parseFloat(genreMatchPercent.toFixed(1)));
    setOverallMatchPercentage(overallMatchPercentage);
  }, [data, localFilter]);

  const calcGenresPercentage = (filter: Filter, genres: steamGameGenreType[]) => {
    let genreCount = 0;
  
    genres.forEach((genre: steamGameGenreType) => {
      if(filter.Categories[genre.id]) {
        genreCount++;
      }
    });
  
    return (genreCount / genres.length) * 100;
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
  
  const calcDevicePercentage = (filter: Filter, devices: DeviceType) => {
    let deviceCount = 0;
    Object.keys(devices).forEach((device: string) => {
      if((device === "windows" && filter.Device.windows) || (device === "mac" && filter.Device.mac)) {
        deviceCount++;
      }
    });
  
    return (deviceCount / 2) * 100;
  }

  const priceBarPosition = (price: number) => {
    const maxPrice = calculateUserSelectedPrice() === 0 ? 1000 : calculateUserSelectedPrice() * 2;
    const adjustedPrice = Math.min(price, maxPrice);
    return (adjustedPrice / maxPrice) * 100;
  };

  const calculateUserSelectedPrice = () => {
    let price = 0;
    Object.keys(localFilter.Price).forEach((key, index) => {
      price = index === 0 ? 0 : (index + 1) * 1000;
    });
    return price;
  };

  return (
    <div className='text-white'>
      <div className="mb-4">
        <p className="text-lg font-bold">全体の一致度</p>
        <div className="w-full bg-gray-200 rounded-lg h-8 mb-1 relative">
          <div className="bg-purple-600 h-8 rounded-lg match-all-bgcolor" style={{ width: `${overallMatchPercentage}%` }}></div>
          <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-lg font-bold match-all-color`}>
            {overallMatchPercentage}%
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-lg">ジャンル一致度</p>
        <div className="w-full bg-gray-200 rounded-t-lg h-8 relative">
          <div className="bg-blue-600 h-8 rounded-t-lg match-genre-bgcolor" style={{ width: `${genreMatchPercentage}%` }}></div>
          <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-lg font-bold match-genre-color`}>
            {genreMatchPercentage}%
          </div>
        </div>
        <div className="w-full bg-gray-300 rounded-b-lg pt-0 pb-1 pl-2 pr-1 ">
          {data.genres.map((genre) => (
            <small key={genre.id} className="text-gray-700">
              {genre.description}&nbsp;
            </small>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p>価格</p>
        <div className="relative w-full h-4 bg-gray-200 rounded-lg mb-1">
          {data.price ? (
            data.price != 0 ? (
              <div>
                <div
                  className={`absolute top-0 left-0 h-full rounded-lg bg-orange-400`}
                  style={{
                    width: `${priceBarPosition(data.price)}%`,
                  }}
                ></div>
                 {Object.keys(localFilter.Price).map((key) => {
                    const minPrice = Math.max((Number(key) - 2), 0) * 1000;
                    const maxPrice = Math.min((Number(key) - 1), 10) * 1000;

                    // バーの位置と幅を計算
                    const barWidth = (maxPrice - minPrice) / (calculateUserSelectedPrice() * 2) * 100;
                    const barLeft = (minPrice / (calculateUserSelectedPrice() * 2)) * 100;

                    return (
                      <div
                        key={key}
                        className="absolute top-0 left-0 h-full"
                        style={{
                          width: `${barWidth}%`,
                          left: `${barLeft}%`,
                          backgroundColor: 'rgba(0, 165, 0, 0.5)',
                        }}
                      ></div>
                    );
                })}
                {/* <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-black"></div> */}
                <div className="absolute top-0 left-0 transform -translate-x-1/2 h-full w-0.5 bg-black"></div>
                <div className="absolute top-0 right-0 transform translate-x-1/2 h-full w-0.5 bg-black"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-black">
                  <span className="absolute top-full -translate-x-1/2 mt-1 text-xs"  style={{ whiteSpace: 'nowrap' }}>
                    {calculateUserSelectedPrice() != 0 ? calculateUserSelectedPrice().toLocaleString() + "円" : "1000円"}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="h-4 rounded-lg bg-gray-400 flex items-center justify-center text-white text-xs"
                style={{
                  width: '100%',
                }}
              >
                無料
              </div>
            )
          ):
            <div
              className="h-4 rounded-lg bg-gray-400 flex items-center justify-center text-white text-xs"
              style={{
                width: '100%',
              }}
            >
              データがありません
            </div>
          }
        </div>
        <div className="flex justify-between text-xs">
          <span>0円</span>
          <span>{(calculateUserSelectedPrice() * 2).toLocaleString()}円</span>
        </div>
        {data.price ? <small className="text-gray-400">価格:{data.price.toLocaleString()}円</small> : null}
      </div>

      <div className="mb-4">
        <p>プレイモード</p>
        {data.isMultiPlayer ?
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded">マルチプレイヤー</span>
          : <span className="px-2 py-1 bg-gray-400 text-green-800 rounded">マルチプレイヤー</span>}
        {data.isSinglePlayer ?
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded mr-1">シングルプレイヤー</span>
          : <span className="px-2 py-1 bg-gray-400 text-green-800 rounded mr-1">シングルプレイヤー</span>}

        <p className='mt-3'>対応デバイス</p>
        {data.device.windows ? (
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded">Windows</span>
        ) : (
          <span className="px-2 py-1 bg-gray-400 text-green-800 rounded">Windows</span>
        )}
        {data.device.mac ? (
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded">mac</span>
        ) : (
          <span className="px-2 py-1 bg-gray-400 text-green-800 rounded">mac</span>
        )}
      </div>
    </div>
  );
};

export default MatchIndicator;