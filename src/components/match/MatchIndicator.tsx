"use client"; 
import React, { useState, useEffect } from 'react';

const genreMapping = {
    "1": "Action",
    "37": "Free to Play",
    "2": "Strategy",
    "25": "Adventure",
    "23": "Indie",
    "3": "RPG",
    "51": "Animation & Modeling",
    "58": "Video Production",
    "4": "Casual",
    "28": "Simulation",
    "9": "Racing",
    "73": "Violent",
    "29": "Massively Multiplayer",
    "72": "Nudity",
    "18": "Sports",
    "70": "Early Access",
    "74": "Gore",
    "57": "Utilities",
    "52": "Audio Production",
    "53": "Design & Illustration",
    "59": "Web Publishing",
    "55": "Photo Editing",
    "54": "Education",
    "56": "Software Training",
    "71": "Sexual Content",
    "60": "Game Development",
    "50": "Accounting",
    "81": "Documentary",
    "84": "Tutorial"
  };
  
  // ユーザー選択(仮)
  const userSelectedGenres : string[] = ['1', '25', '4'];// 仮
  const userSelectedPrice = 2000;
  
  interface MatchIndicatorProps {
    appId: string;
    gameTitle: string;
  }
  
  // 一致度表示
  const MatchIndicator: React.FC<MatchIndicatorProps> = ({ appId, gameTitle }) => {
    const [genreMatchPercentage, setGenreMatchPercentage] = useState<number>(0);
    const [priceDifference, setPriceDifference] = useState<number>(0);
    const [overallMatchPercentage, setOverallMatchPercentage] = useState<number>(0);
    const [gameGenres, setGameGenres] = useState<string[]>([]);
    const [gamePrice, setGamePrice] = useState<number>(0);
    
  
    useEffect(() => {
      const fetchGameGenres = async () => {
        try {
          const response = await fetch(
            `steam/api/appdetails?appids=${appId}&cc=jp`
          );
          const data = await response.json();
          const genres = data[appId].data.genres.map((genre: { id: number }) => genre.id.toString());
          const price = parseInt(data[appId].data.price_overview.final_formatted.replace(/[^\d]/g, ''), 10);
  
          setGameGenres(genres);
          setGamePrice(price);
  
          // 一致度を計算（ジャンル）
          const genreMatchCount = genres.filter((genreId: string) => userSelectedGenres.includes(genreId)).length;
          const genreMatch = Math.round((genreMatchCount / userSelectedGenres.length) * 100);
          setGenreMatchPercentage(genreMatch);
  
          // 価格の差分を計算
          const priceDiff = price - userSelectedPrice;
          setPriceDifference(priceDiff);
  
          // 一致度を計算(全体)
          const overallMatch = Math.round((genreMatch + priceDiff) / 2);
          setOverallMatchPercentage(overallMatch);
  
        } catch (error) {
          console.error("Error fetching game genres:", error);
        }
      };
      fetchGameGenres();
    }, [appId]);
  
    const priceBarPosition = (price: number) => {
      const maxPrice = userSelectedPrice * 2;
      return (price / maxPrice) * 100;
    };
  
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">{gameTitle}との一致度</h3>
        <div className="mb-4">
          <p>全体の一致度：</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-1 relative">
            <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${overallMatchPercentage}%` }}></div>
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center text-xs text-white">
              {overallMatchPercentage}%
            </div>
          </div>
          <small className="text-gray-600">aaa</small>
        </div>
  
        <div className="mb-4">
          <p>ジャンル一致度：</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-1 relative">
            <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${genreMatchPercentage}%` }}></div>
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center text-xs text-white">
              {genreMatchPercentage}%
            </div>
          </div>
          <small className="text-gray-600">aaa</small>
        </div>
  
        <div>
          <h3 className="text-lg font-semibold mb-2">価格一致度</h3>
          <div className="relative w-full h-4 bg-gray-200 rounded-full mb-1">
            <div
              className={`h-4 rounded-full ${priceDifference < 0 ? 'bg-green-600' : 'bg-red-600'}`}
              style={{
                width: `${priceBarPosition(gamePrice)}%`,
              }}
            ></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-black"></div>
            <div className="absolute top-0 left-0 transform -translate-x-1/2 h-full w-0.5 bg-black"></div>
            <div className="absolute top-0 right-0 transform translate-x-1/2 h-full w-0.5 bg-black"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-black">
              <span className="absolute top-full mt-1 text-xs text-black">
                {userSelectedPrice.toLocaleString()}円
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>0円</span>
            <span>{(userSelectedPrice * 2).toLocaleString()}円</span>
          </div>
          <small className="text-gray-600">価格:{gamePrice.toLocaleString()}</small>
        </div>
      </div>
    );
  };

  export default MatchIndicator;