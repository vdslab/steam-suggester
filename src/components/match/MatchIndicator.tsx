"use client"; 
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { getFilterData } from '@/hooks/indexedDB';
import { Filter } from '@/types/api/FilterType';
import { SteamDetailsDataType, SteamDeviceType, SteamGenreType } from '@/types/api/getSteamDetailType';
import React, { useState, useEffect, use } from 'react';
import { calcAllMatchPercentage, calcGenresPercentage } from '../common/CalcMatch';
import LocalFilterPrice from './LocalFilterPrice';
import IsAbleBar from './IsAbleBar';
import PercentBar from './PercentBar';

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

  const startPricePosition = priceBarPosition(localFilter.Price.startPrice);
  const endPricePosition = priceBarPosition(localFilter.Price.endPrice);


  return (
    <div className='text-white'>
      <div className="mb-4">
        <p className="text-lg font-bold">全体の一致度</p>
        <PercentBar baseStyle='bg-match-all-bg rounded-lg' txtStyle='text-match-all' percent={overallMatchPercentage} />
      </div>

      <div className="mb-4">
        <p className="text-lg">ジャンル一致度</p>
        <PercentBar baseStyle='bg-match-genre-bg rounded-t-lg' txtStyle='text-match-genre' percent={genreMatchPercentage} />
        
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
                  }}></div>
                
                <LocalFilterPrice startPrice={localFilter.Price.startPrice} endPrice={localFilter.Price.endPrice} startPricePosition={startPricePosition} endPricePosition={endPricePosition} />
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
              className="h-full rounded-lg bg-gray-400 flex items-center justify-center text-white text-xs"
              style={{
                width: '100%',
              }}
            >
              0円
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
        <IsAbleBar isLeft={data.isSinglePlayer} isRight={data.isMultiPlayer} leftTxt='シングルプレイヤー' rightTxt='マルチプレイヤー' />
        <p className='mt-3'>対応デバイス</p>
        <IsAbleBar isLeft={data.device.windows} isRight={data.device.mac} leftTxt='Windows' rightTxt='mac' />
      </div>
    </div>
  );
};

export default MatchIndicator;