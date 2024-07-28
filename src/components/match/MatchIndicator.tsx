"use client"; 
import { DEFAULT_FILTER, GENRE_MAPPING } from '@/constants/DEFAULT_FILTER';
import { getFilterData } from '@/hooks/indexedDB';
import { Filter } from '@/types/api/FilterType';
import { SteamDetailsDataType, SteamGenreType } from '@/types/api/getSteamDetailType';
import { useState, useEffect,  } from 'react';
import { calcAllMatchPercentage, calcGenresPercentage } from '../common/CalcMatch';
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


  return (
    <div className='text-white'>
      <div className="mb-[2vh] flex">
        <div className="text-lg w-1/3">全体の一致度:</div>
        <PercentBar baseStyle='bg-cyan-300 rounded-lg' txtStyle='text-gray-600' percent={overallMatchPercentage} />
      </div>

      <div className="mb-[vh] flex">
        <div className="text-lg w-1/3">ジャンル一致度:</div>
        <PercentBar baseStyle='bg-yellow-300 rounded-lg' txtStyle='text-gray-600' percent={genreMatchPercentage} />
      </div>
      <div className="mb-[2vh] flex">
        <div className="text-sm w-1/4">（ジャンル）</div>
        {data.genres.map((genre: SteamGenreType, index:number) => (
            genre.id in GENRE_MAPPING &&
            <div key={genre.id} className='text-center m-1 text-xs text-yellow-300'>{index !== 0 ? ', ' : ''}{genre.description}</div>
        ))}
      </div>

      <div className="flex mb-[2vh]">
        {data.price != 0 ? (
          <div className='w-1/4'>価格(円):</div>
        ) : (
          <div className='w-1/3'>価格(円):</div>
        )}
        {data.price != 0 ? (
          <div className='flex-1'>
            <div className="relative h-[2.5vh] bg-gray-200 rounded-lg">
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
              className="h-[2.5vh] rounded-lg bg-gray-500 flex items-center justify-center font-bold text-white"
              style={{
                width: '100%',
              }}
            >
              無料
            </div>
          )
        }

      </div>

      <div>
        <div className='flex mb-[2vh]'>
          <div className='w-1/4'>プレイモード</div>
          <IsAbleBar isLeft={data.isSinglePlayer} isRight={data.isMultiPlayer} isUserLeft={localFilter.Mode.isSinglePlayer} isUserRight={localFilter.Mode.isMultiPlayer} leftTxt='シングルプレイヤー' rightTxt='マルチプレイヤー' />
        </div>
        
        <div className='flex mt-3'>
          <div className='w-1/4'>対応デバイス</div>
          <IsAbleBar isLeft={data.device.windows} isRight={data.device.mac} isUserLeft={localFilter.Device.windows} isUserRight={localFilter.Device.mac} leftTxt='Windows' rightTxt='mac' />
        </div>
      </div>

      <div className='pt-[3vh]'>ユーザが選択した項目</div>
      <div className='border border-gray-500 flex p-2 flex-wrap'>
        {data.genres.map((genre: SteamGenreType) => (
          genre.id in GENRE_MAPPING &&
          <div key={genre.id} className='bg-yellow-300 rounded-sm m-1'>
            <div className='text-center m-1 text-xs text-gray-900'>{genre.description}</div>
          </div>
        ))}
        <div className='bg-rose-400 rounded-sm m-1'>
          <div className='text-center m-1 text-xs text-gray-900'>{localFilter.Price.startPrice}円 ~ {localFilter.Price.endPrice}円</div>
        </div>

        {(localFilter.Mode.isSinglePlayer) && (
          <div className='bg-green-400 rounded-sm m-1'>
            <div className='text-center m-1 text-xs text-gray-900'>シングルプレイヤー</div>
          </div>
        )}
          
          {(localFilter.Mode.isMultiPlayer) && (
            <div className='bg-green-400 rounded-sm m-1'>
              <div className='text-center m-1 text-xs text-gray-900'>マルチプレイヤー</div>
            </div>
          )}

          {(localFilter.Device.windows) && (
            <div className='bg-green-400 rounded-sm m-1'>
              <div className='text-center m-1 text-xs text-gray-900'>Windows</div>
            </div>
          )}

          {(localFilter.Device.mac) && (
            <div className='bg-green-400 rounded-sm m-1'>
              <div className='text-center m-1 text-xs text-gray-900'>Mac</div>
            </div>
          )}

      </div>

    </div>
  );
};

export default MatchIndicator;