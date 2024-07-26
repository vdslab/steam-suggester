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
      <div className="mb-3 flex">
        <p className="text-lg w-1/3">全体の一致度:</p>
        <PercentBar baseStyle='bg-cyan-300 rounded-lg' txtStyle='text-gray-600' percent={overallMatchPercentage} />
      </div>

      <div className="mb-3 flex">
        <p className="text-lg w-1/3">ジャンル一致度:</p>
        <PercentBar baseStyle='bg-yellow-300 rounded-lg' txtStyle='text-gray-600' percent={genreMatchPercentage} />
      </div>

      <div className="flex mb-3">
        {data.price != 0 ? (
          <p className='select-none w-1/4'>価格(円):</p>
        ) : (
          <p className='select-none w-1/3'>価格(円):</p>
        )}
        {data.price != 0 ? (
          <div className='flex-1'>
            <div className="relative h-5 bg-gray-200 rounded-lg">
              <div>
                <div
                  className={`absolute top-0 left-0 h-full rounded-lg bg-rose-400`}
                  style={{
                    width: `${priceBarPosition(data.price)}%`,
                  }}></div>
                
                <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-lg font-bold text-gray-600`}>
                  ¥{data.price.toLocaleString()}
                </div>
              </div>
            </div>
            {/* bottomの目盛り */}
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>10,000</span>
            </div>
          </div>
          ) : (
            <div
              className="h-5 rounded-lg bg-gray-500 flex items-center justify-center font-bold text-white"
              style={{
                width: '100%',
              }}
            >
              無料
            </div>
          )
        }
      </div>

      <div className="mb-3 select-none">
        <div className='flex'>
        <p className='w-1/4'>プレイモード</p>
        <IsAbleBar isLeft={data.isSinglePlayer} isRight={data.isMultiPlayer} isUserLeft={localFilter.Mode.isSinglePlayer} isUserRight={localFilter.Mode.isMultiPlayer} leftTxt='シングルプレイヤー' rightTxt='マルチプレイヤー' />
        </div>
        
        <div className='flex mt-3'>
          <p className='w-1/4'>対応デバイス</p>
          <IsAbleBar isLeft={data.device.windows} isRight={data.device.mac} isUserLeft={localFilter.Device.windows} isUserRight={localFilter.Device.mac} leftTxt='Windows' rightTxt='mac' />
        </div>
      </div>
    </div>
  );
};

export default MatchIndicator;