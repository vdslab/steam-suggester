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
    const maxPrice = 10000;
    const adjustedPrice = Math.min(price, maxPrice);
    return (adjustedPrice / maxPrice) * 100;
  };

  const localFilterPrice = () => {
    const startPricePosition = priceBarPosition(localFilter.Price.startPrice);
    const endPricePosition = priceBarPosition(localFilter.Price.endPrice);
  
    const startLabelStyle = {
      left: `${startPricePosition}%`,
      whiteSpace: 'nowrap',
      transform: startPricePosition < 5 ? 'none' : 'translateX(-50%)'
    };
  
    const endLabelStyle = {
      left: `${endPricePosition}%`,
      whiteSpace: 'nowrap',
      transform: endPricePosition > 95 ? 'translateX(-100%)' : 'translateX(-50%)'
    };
  
    return (
      <>
        <div
          className="absolute top-0 transform -translate-x-1/2 h-full w-0.5 bg-orange-800"
          style={{ left: `${startPricePosition}%` }}
        >
          <span
            className="absolute -top-5 mt-1 text-xs text-orange-400"
            style={startLabelStyle}
          >
            {localFilter.Price.startPrice.toLocaleString()}
          </span>
        </div>
        <div
          className="absolute top-0 transform -translate-x-1/2 h-full w-0.5 bg-orange-800"
          style={{ left: `${endPricePosition}%` }}
        >
          <span
            className="absolute -top-5 mt-1 text-xs text-orange-400"
            style={endLabelStyle}
          >
            {localFilter.Price.endPrice.toLocaleString()}
          </span>
        </div>
  
        <div
          className="absolute top-0 h-full bg-orange-800/20"
          style={{
            left: `${startPricePosition}%`,
            width: `${endPricePosition - startPricePosition}%`,
          }}
        ></div>
      </>
    );  
  };
  

  return (
    <div className='text-white'>
      <div className="mb-4">
        <p className="text-lg font-bold">全体の一致度</p>
        <div className="w-full bg-gray-200 rounded-lg h-8 mb-1 relative">
          <div className="bg-purple-600 h-8 rounded-lg bg-[#aa64fa]" style={{ width: `${overallMatchPercentage}%` }}></div>
          <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-lg font-bold text-[#8a00b8]`}>
            {overallMatchPercentage}%
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-lg">ジャンル一致度</p>
        <div className="w-full bg-gray-200 rounded-t-lg h-8 relative">
          <div className="bg-blue-600 h-8 rounded-t-lg bg-[#6496fa]" style={{ width: `${genreMatchPercentage}%` }}></div>
          <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-lg font-bold text-[#0037b8]`}>
            {genreMatchPercentage}%
          </div>
        </div>
        <div className="w-full bg-gray-300 rounded-b-lg pt-0.5 pb-1 pl-2 pr-1 ">
          {data.genres.map((genre) => (
            <div key={genre.id} className="inline-block bg-white text-gray-700 rounded-md px-2 py-0 my-0.5 cursor-pointer">
              <small>{genre.description}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p>価格(円)</p>
          {data.price ? (
            data.price > 0 ? (
              <div className="relative w-full h-8 bg-gray-200 rounded-lg mb-1 mt-4">
                <div
                  className={`absolute top-0 left-0 h-full rounded-lg bg-orange-400`}
                  style={{
                    width: `${priceBarPosition(data.price)}%`,
                  }}
                ></div>
                
                {localFilterPrice()}
                <div className="absolute top-0 left-0 transform -translate-x-1/2 h-full w-0.5 bg-black"></div>
                <div className="absolute top-0 right-0 transform translate-x-1/2 h-full w-0.5 bg-black"></div>
                <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-lg font-bold text-orange-700`}>
                  {data.price.toLocaleString()}
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
        {data.price && data.price > 0 ? (
          <div className="flex justify-between text-xs">
            <span>0</span>
            <span>10,000</span>
          </div>
        ) : null}
      </div>

      <div className="mb-4">
        <p>プレイモード</p>
        <div className="flex">
          <span className={`flex-1 px-2 py-1 rounded cursor-pointer text-center ${data.isSinglePlayer ? 'bg-green-200 text-green-800' : 'bg-gray-400 text-green-800'}`}>
            シングルプレイヤー
          </span>
          <span className={`flex-1 px-2 py-1 rounded cursor-pointer text-center ${data.isMultiPlayer ? 'bg-green-200 text-green-800' : 'bg-gray-400 text-green-800'}`}>
            マルチプレイヤー
          </span>
        </div>

        <p className='mt-3'>対応デバイス</p>
        <div className="flex">
          <span className={`flex-1 px-2 py-1 rounded cursor-pointer text-center ${data.device.windows ? 'bg-green-200 text-green-800' : 'bg-gray-400 text-green-800'}`}>
            Windows
          </span>
          <span className={`flex-1 px-2 py-1 rounded cursor-pointer text-center ${data.device.mac ? 'bg-green-200 text-green-800' : 'bg-gray-400 text-green-800'}`}>
            mac
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchIndicator;