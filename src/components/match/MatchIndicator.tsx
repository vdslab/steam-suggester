"use client";  
import { DEFAULT_FILTER, GENRE_MAPPING } from '@/constants/DEFAULT_FILTER';
import { getFilterData } from '@/hooks/indexedDB';
import { Filter } from '@/types/api/FilterType';
import { SteamDetailsDataType } from '@/types/api/getSteamDetailType';
import { useState, useEffect } from 'react';
import { calcAllMatchPercentage, calcGenresPercentage } from '../common/CalcMatch';
import IsAbleBar from './IsAbleBar';
import ScoreCard from './ScoreCard';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

type Props = {
  data: SteamDetailsDataType;
};

const MatchIndicator = (props: Props) => {
  const { data } = props;
  const [localFilter, setLocalFilter] = useState<Filter>(DEFAULT_FILTER);
  const [genreMatchPercentage, setGenreMatchPercentage] = useState<number>(0);
  const [overallMatchPercentage, setOverallMatchPercentage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null); // エラーメッセージ用

  useEffect(() => {
    (async () => {
      try {
        const d = await getFilterData();
        if (d) {
          const genrePercentage = calcGenresPercentage(d, data.genres);
          const overallPercentage = calcAllMatchPercentage(d, data);
          setLocalFilter(d);
          setGenreMatchPercentage(genrePercentage);
          setOverallMatchPercentage(overallPercentage);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
        setError("フィルターデータの取得中にエラーが発生しました。");
      }
    })();
  }, [data]);

  const priceBarPosition = (price: number) => {
    const maxPrice = 10000;
    const adjustedPrice = Math.min(price, maxPrice);
    return (adjustedPrice / maxPrice) * 100;
  };

  const isPriceFree = data.price === 0;

  return (
    <div className='text-white'>
      {error && <div className="text-red-500 mb-4">{error}</div>} {/* エラーメッセージ表示 */}
      
      {/* スコアカードの表示 */}
      <Grid container spacing={4} className="mb-6">
        <Grid item xs={12} sm={6}>
          <ScoreCard label="全体の一致度" value={overallMatchPercentage} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <ScoreCard label="ジャンル一致度" value={genreMatchPercentage}>
            {/* ジャンルリストをスコアカード内に埋め込む */}
            <Stack direction="row" spacing={1} className="flex-wrap justify-center">
              {data.genres?.map((genre: string, index: number) => (
                genre in GENRE_MAPPING && (
                  <Chip 
                    key={index} 
                    label={genre} 
                    color="warning" 
                    size="small" 
                    className="mb-1" 
                  />
                )
              ))}
            </Stack>
          </ScoreCard>
        </Grid>
      </Grid>

      {/* 価格の表示 */}
      <div className="flex mb-[2vh]">
        <div className={isPriceFree ? 'w-1/3' : 'w-1/4'}>価格(円):</div>
        {isPriceFree ? (
          <div
            className="h-[2.5vh] rounded-lg bg-gray-500 flex items-center justify-center font-bold text-white"
            style={{ width: '100%' }}
          >
            無料
          </div>
        ) : (
          <div className='flex-1'>
            <div className="relative h-[2.5vh] bg-gray-200 rounded-lg">
              <div>
                <div
                  className={`absolute top-0 left-0 h-full rounded-lg bg-rose-400`}
                  style={{
                    width: `${priceBarPosition(data.price)}%`,
                  }}
                ></div>

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
        )}
      </div>

      {/* プレイモードと対応デバイスの表示 */}
      <div>
        <div className='flex mb-[2vh]'>
          <div className='w-1/4'>プレイモード</div>
          <IsAbleBar
            isLeft={data.isSinglePlayer}
            isRight={data.isMultiPlayer}
            isUserLeft={localFilter.Mode.isSinglePlayer}
            isUserRight={localFilter.Mode.isMultiPlayer}
            leftTxt='シングルプレイヤー'
            rightTxt='マルチプレイヤー'
          />
        </div>

        <div className='flex mt-3'>
          <div className='w-1/4'>対応デバイス</div>
          <IsAbleBar
            isLeft={data.device.windows}
            isRight={data.device.mac}
            isUserLeft={localFilter.Device.windows}
            isUserRight={localFilter.Device.mac}
            leftTxt='Windows'
            rightTxt='Mac'
          />
        </div>
      </div>

      {/* ユーザーが選択した項目の表示 */}
      <div className='pt-[3vh]'>ユーザが選択した項目</div>
      <div className='border border-gray-500 flex p-2 flex-wrap'>
        {data.genres?.map((genre: string, index: number) => (
          genre in GENRE_MAPPING && (
            <div key={index} className='bg-yellow-300 rounded-sm m-1'>
              <div className='text-center m-1 text-xs text-gray-900'>{genre}</div>
            </div>
          )
        ))}
        <div className='bg-rose-400 rounded-sm m-1'>
          <div className='text-center m-1 text-xs text-gray-900'>{localFilter.Price.startPrice}円 ~ {localFilter.Price.endPrice}円</div>
        </div>

        {localFilter.Mode.isSinglePlayer && (
          <div className='bg-green-400 rounded-sm m-1'>
            <div className='text-center m-1 text-xs text-gray-900'>シングルプレイヤー</div>
          </div>
        )}

        {localFilter.Mode.isMultiPlayer && (
          <div className='bg-green-400 rounded-sm m-1'>
            <div className='text-center m-1 text-xs text-gray-900'>マルチプレイヤー</div>
          </div>
        )}

        {localFilter.Device.windows && (
          <div className='bg-green-400 rounded-sm m-1'>
            <div className='text-center m-1 text-xs text-gray-900'>Windows</div>
          </div>
        )}

        {localFilter.Device.mac && (
          <div className='bg-green-400 rounded-sm m-1'>
            <div className='text-center m-1 text-xs text-gray-900'>Mac</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchIndicator;
