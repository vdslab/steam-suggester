"use client"; 
import { GenreType, MatchDataType } from '@/types/match/MatchDataType';
import React, { useState, useEffect } from 'react';

const userSelected = {
  Categories: {
    1: true,
    2: false,
    3: false,
    4: false,
    9: false,
    18: false,
    23: false,
    25: false,
    28: false,
    29: false,
    37: true,
    50: false,
    51: false,
    52: false,
    53: false,
    54: false,
    55: false,
    56: false,
    57: false,
    58: false,
    59: false,
    60: false,
    70: false,
    71: false,
    72: false,
    73: false,
    74: false,
    81: false,
    84: false,
  },
  Price: {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
  },
  Platforms: {
    1: true,
    2: false,
  },
  Playtime: {
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
  },
};

type Props = {
  data: MatchDataType;
};

const MatchIndicator = (props:Props) => {

  const { data } = props;

  const [genreMatchPercentage, setGenreMatchPercentage] = useState<number>(0);
  const [priceMatchPercentage, setPriceMatchPercentage] = useState<number>(0);
  const [modeMatchPercentage, setModeMatchPercentage] = useState<number>(0);
  const [priceDifference, setPriceDifference] = useState<number>(0);
  const [overallMatchPercentage, setOverallMatchPercentage] = useState<number>(0);

  useEffect(() => {
    // 一致度を計算（ジャンル）
    const genreMatchCount = countMatchingGenres();
    const genreMatch = calculateMatchPercentage(genreMatchCount, userSelected.Categories[37] ? 1 : 0);
    setGenreMatchPercentage(genreMatch);

    // 価格の差分を計算
    const priceDiff = data.price - calculateUserSelectedPrice();
    setPriceDifference(priceDiff);

    // 一致度を計算(価格)
    const priceMatch = calculateMatchPercentage(data.price, calculateUserSelectedPrice());
    setPriceMatchPercentage(priceMatch);

    // 一致度を計算(ゲームモード)
    const modeMatchCount = countMatchMode();
    const modeMatch = calculateMatchPercentage(2, modeMatchCount);

    setModeMatchPercentage(modeMatch);
  }, [data, userSelected]);

  useEffect(() => {
     // 一致度を計算(全体)
     const overallMatch = Math.round((genreMatchPercentage + priceMatchPercentage + modeMatchPercentage) / 3); // 仮
     setOverallMatchPercentage(overallMatch);
  }, [genreMatchPercentage, priceMatchPercentage, ]);

  const priceBarPosition = (price: number) => {
    const maxPrice = calculateUserSelectedPrice() === 0 ? 1000 : calculateUserSelectedPrice() * 2;
    const adjustedPrice = Math.min(price, maxPrice);
    return (adjustedPrice / maxPrice) * 100;
  };

  const countMatchingGenres = () => {
    let matchingCount = 0;
    const userGenreIDs = Object.keys(userSelected.Categories).filter(id => userSelected.Categories[Number(id)]);
    data.genres.forEach((gameGenre:GenreType) => {
      if (userGenreIDs.includes(String((gameGenre.id)))) {
        matchingCount++;
      }
    });
    return matchingCount;
  };

  const countMatchMode = () => {
    let matchCount = 0;

    if (userSelected.Categories[1] === data.isMultiPlayer) 
      matchCount++;
    if (!userSelected.Categories[1] === data.isSinglePlayer)
      matchCount++;

    return matchCount;
  };

  const calculateMatchPercentage = (overview: number, userSelected: number) => {
    const diff = Math.abs(overview - userSelected);
    const matchPercentage = Math.round(Math.max(0, 100 - (diff / userSelected) * 100));
    return matchPercentage;
  };

  const calculateUserSelectedPrice = () => {
    let price = 0;
    Object.keys(userSelected.Price).forEach((key, index) => {
      if (userSelected.Price[Number(key)]) {
        price = index === 0 ? 0 : (index + 1) * 1000; // Handle 0 yen and subsequent prices
      }
    });
    return price;
  };

  const getTextColor = (percentage: number, barColor: string) => {
    return percentage > 50 ? 'text-white' : barColor;
  };

  return (
    <div className='text-white'>
      <div className="mb-4">
        <p>全体の一致度</p>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-1 relative">
          <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${overallMatchPercentage}%` }}></div>
          <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-xs ${getTextColor(overallMatchPercentage, "text-purple-600")}`}>
            {overallMatchPercentage}%
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p>ジャンル一致度</p>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-1 relative">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${genreMatchPercentage}%` }}></div>
          <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-xs ${getTextColor(genreMatchPercentage, "text-blue-600")}`}>
            {genreMatchPercentage}%
          </div>
        </div>
        <div>
          {data.genres.map((genre:GenreType) => (
            <small key={genre.id} className="text-gray-400">
              {genre.description}&nbsp;
            </small>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p>価格</p>
        <div className="relative w-full h-4 bg-gray-200 rounded-full mb-1">
          <div
            className={`h-4 rounded-full ${priceDifference < 0 ? 'bg-green-600' : 'bg-red-600'}`}
            style={{
              width: `${priceBarPosition(data.price)}%`,
            }}
          ></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-black"></div>
          <div className="absolute top-0 left-0 transform -translate-x-1/2 h-full w-0.5 bg-black"></div>
          <div className="absolute top-0 right-0 transform translate-x-1/2 h-full w-0.5 bg-black"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-black">
            <span className="absolute top-full -translate-x-1/2 mt-1 text-xs"  style={{ whiteSpace: 'nowrap' }}>
              {calculateUserSelectedPrice() != 0 ? calculateUserSelectedPrice().toLocaleString() + "円" : "1000円"}
            </span>
          </div>
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
        {data.platforms.windows ? (
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded">Windows</span>
        ) : (
          <span className="px-2 py-1 bg-gray-400 text-green-800 rounded">Windows</span>
        )}
        {data.platforms.mac ? (
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded">mac</span>
        ) : (
          <span className="px-2 py-1 bg-gray-400 text-green-800 rounded">mac</span>
        )}
      </div>
    </div>
  );
};

export default MatchIndicator;
