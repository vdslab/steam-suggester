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
        <PercentBar baseStyle='bg-[#aa64fa] rounded-lg' txtStyle='text-[#8a00b8]' percent={overallMatchPercentage} />
      </div>

      <div className="mb-4">
        <p className="text-lg">
          ジャンル一致度
        </p>
        <PercentBar baseStyle='bg-[#6496fa] rounded-t-lg' txtStyle='text-[#2f37b8]' percent={genreMatchPercentage} />
        
        <div className="w-full bg-gray-500 rounded-b-lg pt-0.5 pb-1 pl-2 pr-1 ">
          {data.genres.map((genre) => (
            <div
              key={genre.id}
              className={`border border-solid border-gray-400 inline-block text-blue-100 rounded-md px-2 py-0 my-0.5 mx-0.5 cursor-pointer border-b-2 ${
                localFilter.Categories[genre.id] ? 'border-green-500' : ''
              }`}
            >
              <small>{genre.description}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p>価格(円)</p>
          {data.price != 0 ? (
            <div>
              <div className="relative w-full h-8 bg-gray-200 rounded-lg mb-1 mt-4">
                <div>
                  <div
                    className={`absolute top-0 left-0 h-full rounded-lg bg-orange-400`}
                    style={{
                      width: `${priceBarPosition(data.price)}%`,
                    }}></div>
                  
                  <LocalFilterPrice startPrice={localFilter.Price.startPrice} endPrice={localFilter.Price.endPrice} startPricePosition={startPricePosition} endPricePosition={endPricePosition} />
                  {/* <div className="absolute top-0 left-0 transform -translate-x-1/2 h-full w-0.5 bg-green-500"></div> */}
                  <div className="absolute top-0 right-0 transform translate-x-1/2 h-full w-0.5"></div>
                  <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-lg font-bold text-orange-700`}>
                    {data.price.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span>0</span>
                <span>10,000</span>
              </div>
            </div>
            ) : (
              <div
                className="h-8 rounded-lg bg-gray-500 flex items-center justify-center text-lg font-bold text-white"
                style={{
                  width: '100%',
                }}
              >
                無料
              </div>
            )
          }
      </div>

      <div className="mb-4">
        <p>プレイモード</p>
        <IsAbleBar isLeft={data.isSinglePlayer} isRight={data.isMultiPlayer} isUserLeft={localFilter.Mode.isSinglePlayer} isUserRight={localFilter.Mode.isMultiPlayer} leftTxt='シングルプレイヤー' rightTxt='マルチプレイヤー' />
        <p className='mt-3'>対応デバイス</p>
        <IsAbleBar isLeft={data.device.windows} isRight={data.device.mac} isUserLeft={localFilter.Device.windows} isUserRight={localFilter.Device.mac} leftTxt='Windows' rightTxt='mac' />
      </div>
    </div>
  );
};

export default MatchIndicator;