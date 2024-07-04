"use client"; 
import React, { useState, useEffect } from 'react';

// const genreMapping = {
//   1: "Action",
//   37: "Free to Play",
//   2: "Strategy",
//   25: "Adventure",
//   23: "Indie",
//   3: "RPG",
//   51: "Animation & Modeling",
//   58: "Video Production",
//   4: "Casual",
//   28: "Simulation",
//   9: "Racing",
//   73: "Violent",
//   29: "Massively Multiplayer",
//   72: "Nudity",
//   18: "Sports",
//   70: "Early Access",
//   74: "Gore",
//   57: "Utilities",
//   52: "Audio Production",
//   53: "Design & Illustration",
//   59: "Web Publishing",
//   55: "Photo Editing",
//   54: "Education",
//   56: "Software Training",
//   71: "Sexual Content",
//   60: "Game Development",
//   50: "Accounting",
//   81: "Documentary",
//   84: "Tutorial"
// };

interface Genre {
  id: string;
  description: string;
}

interface Category {
  id: number;
  description: string;
}

interface GameData {
  genres: Genre[];
  categories: Category[];
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  priceOverview: number;
  salePriceOverview: number;
  platforms: Platforms;
};

interface Data {
  gameData: GameData;
  name: string;
  imgURL: string;
};

interface Platforms {
  windows: boolean;
  mac: boolean;
  linux: boolean;
};

interface MatchIndicatorProps {
  data: Data;
  appId: number;
};

  // 一致度表示
const MatchIndicator: React.FC<MatchIndicatorProps> = ({ data, appId }) => {
  const [genreMatchPercentage, setGenreMatchPercentage] = useState<number>(0);
  const [priceMatchPercentage, setPriceMatchPercentage] = useState<number>(0);
  const [modeMatchPercentage, setModeMatchPercentage] = useState<number>(0);
  const [priceDifference, setPriceDifference] = useState<number>(0);
  const [overallMatchPercentage, setOverallMatchPercentage] = useState<number>(0);
  console.log(data);

  useEffect(() => {
    // 一致度を計算（ジャンル）
    const genreMatchCount = countMatchingGenres();
    const genreMatch = calculateMatchPercentage(genreMatchCount, userSelected.genres.length);
    setGenreMatchPercentage(genreMatch);

    // 価格の差分を計算
    const priceDiff = data.gameData.priceOverview - userSelected.price;
    setPriceDifference(priceDiff);

    // 一致度を計算(価格)
    const priceMatch = calculateMatchPercentage(data.gameData.priceOverview, userSelected.price);
    setPriceMatchPercentage(priceMatch);

    // 一致度を計算(ゲームモード)
    const modeMatchCount = countMatchMode();
    const modeMatch = calculateMatchPercentage(2, modeMatchCount);
    console.log(modeMatch)
    setModeMatchPercentage(modeMatch);
    
    // 一致度を計算(全体)
    const overallMatch = Math.round((genreMatch + priceMatchPercentage + modeMatchPercentage) / 3);// 仮
    setOverallMatchPercentage(overallMatch);
  }, [appId]);

  const priceBarPosition = (price: number) => {
    const maxPrice = userSelected.price * 2;
    const adjustedPrice = Math.min(price, maxPrice);
    return (adjustedPrice / maxPrice) * 100;
  };

  const countMatchingGenres = () => {
      let matchingCount = 0;
      const userGenreIDs = userSelected.genres.map(genre => genre.id);
      data.gameData.genres.forEach((gameGenre: { id: string; }) => {
          if (userGenreIDs.includes(gameGenre.id)) {
              matchingCount++;
          }
      });
      return matchingCount;
  };

  const countMatchMode = () => {
    let matchCount = 0;
  
    if (userSelected.isSinglePlayer === data.gameData.isSinglePlayer) 
      matchCount++;
    if (userSelected.isMultiPlayer === data.gameData.isMultiPlayer)
      matchCount++;

    return matchCount;
  };

  const calculateMatchPercentage = (overview: number, userSelected: number) => {
    const diff = Math.abs(overview - userSelected);
    const matchPercentage = Math.round(Math.max(0, 100 - (diff / userSelected) * 100));
    return matchPercentage;
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
          {data.gameData.genres.map((genre) => (
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
              width: `${priceBarPosition(data.gameData.priceOverview)}%`,
            }}
          ></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-black"></div>
          <div className="absolute top-0 left-0 transform -translate-x-1/2 h-full w-0.5 bg-black"></div>
          <div className="absolute top-0 right-0 transform translate-x-1/2 h-full w-0.5 bg-black"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-black">
            <span className="absolute top-full mt-1 text-xs">
              {userSelected.price.toLocaleString()}円
            </span>
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <span>0円</span>
          <span>{(userSelected.price * 2).toLocaleString()}円</span>
        </div>
        {data.gameData.priceOverview ? <small className="text-gray-400">価格:{data.gameData.priceOverview.toLocaleString()}円</small> : null}
      </div>

      <div className="mb-4">
        <p>ゲームモード</p>
        <div className="flex mb-4">
          <div className={`w-1/2 p-2 ${data.gameData.isMultiPlayer ? 'bg-green-600' : 'bg-gray-200'} rounded relative`}>
            <span className="text-white">マルチプレイヤー</span>
            {userSelected.isMultiPlayer && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-600 rounded-b-full"></div>}
          </div>
          <div className={`w-1/2 p-2 ${data.gameData.isSinglePlayer ? 'bg-green-600' : 'bg-gray-200'} rounded relative`}>
            <span className="text-white">シングルプレイヤー</span>
            {userSelected.isSinglePlayer && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-600 rounded-b-full"></div>}
          </div>
        </div>

        
        {data.gameData.platforms.windows ? (
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded">Windows:〇</span>
        ):
          <span className="px-2 py-1 bg-gray-400 text-green-800 rounded">Windows:×</span>
        }
        {data.gameData.platforms.mac ? (
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded">mac:〇</span>
        ):
          <span className="px-2 py-1 bg-gray-400 text-green-800 rounded">mac:×</span>
        }
        {data.gameData.platforms.linux ? (
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded">linux:〇</span>
        ):
          <span className="px-2 py-1 bg-gray-400 text-green-800 rounded">linux:×</span>
        }
      </div>
    </div>
  );
};

const userSelected={
  "genres": [
      {
          "id": "1",
          "description": "Action"
      },
      {
          "id": "25",
          "description": "Adventure"
      },
      {
          "id": "37",
          "description": "Free to Play"
      }
  ],
  "categories": [
      {
          "id": 1,
          "description": "Multi-player"
      },
      {
          "id": 49,
          "description": "PvP"
      },
      {
          "id": 36,
          "description": "Online PvP"
      },
      {
          "id": 9,
          "description": "Co-op"
      },
      {
          "id": 38,
          "description": "Online Co-op"
      },
      {
          "id": 22,
          "description": "Steam Achievements"
      },
      {
          "id": 28,
          "description": "Full controller support"
      },
      {
          "id": 29,
          "description": "Steam Trading Cards"
      },
      {
          "id": 35,
          "description": "In-App Purchases"
      }
  ],
  "isSinglePlayer": false,
  "isMultiPlayer": true,
  "price": 3500
}

export default MatchIndicator;