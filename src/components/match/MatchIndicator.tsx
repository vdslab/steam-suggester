"use client"; 
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { getFilterData } from '@/hooks/indexedDB';
import { Filter } from '@/types/api/FilterType';
import { SteamDetailsDataType, SteamDeviceType, SteamGenreType } from '@/types/api/getSteamDetailType';
import React, { useState, useEffect, use } from 'react';
import { calcAllMatchPercentage, calcGenresPercentage } from '../common/CalcMatch';

type Props = {
  data: SteamDetailsDataType;
};

const MatchIndicator = ( props:Props ) => {
  const { data } = props;
  const [localFilter, setLocalFilter] = useState<Filter>(DEFAULT_FILTER);
  const [genreMatchPercentage, setGenreMatchPercentage] = useState<number>(0);
  const [overallMatchPercentage, setOverallMatchPercentage] = useState<number>(0);

  useEffect(() => {
    (async() => {
      const d = await getFilterData('unique_id');
      if(d) {
        setLocalFilter(d);

        setGenreMatchPercentage( calcGenresPercentage(d, data.genres) );
        setOverallMatchPercentage( calcAllMatchPercentage(d, data) );
      }
    })();
  }, [])

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
            <div key={genre.id} className="inline-block bg-white text-gray-700 rounded-md px-2 py-0 my-0.5 cursor-pointer">
              <small>{genre.description}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p>価格(円)</p>
        <div className="relative w-full h-8 bg-gray-200 rounded-lg mb-1 mt-4">
          {data.price ? (
            data.price != 0 ? (
              <div>
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
        </div>
        {data.price && data.price != 0 ? (
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