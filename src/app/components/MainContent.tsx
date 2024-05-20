"use client"; 
import React, { useState, useEffect } from 'react';

// components/MainContent.js
export default function MainContent() {
  const gameTitle="Fall guys";
  const appId = 1097150;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">ゲームタイトル</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-2">流行度</h3>
          <div className="bg-gray-200 h-48 mb-4">[流行度グラフ]</div>
          <h3 className="text-lg font-semibold mb-2">関連配信者リスト</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-200 h-24">動画名</div>
            <div className="bg-gray-200 h-24">動画名</div>
            <div className="bg-gray-200 h-24">動画名</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">一致度</h3>
          <div>
            <div>
              <MatchIndicator appId={appId} gameTitle={gameTitle} />
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}

const predefinedGenres = ['Action', 'Adventure', 'Casual']; // 仮

// 一致度表示
const MatchIndicator = ({ appId, gameTitle }) => {
  const  [matchPercentage, setMatchPercentage] = useState(0);
  const [gameGenres, setGameGenres] = useState([]);
  
  //test用
  useEffect(() => {
    console.log(gameGenres)
  }, [gameGenres]);

  useEffect(() => {
    const fetchGameGenres = async () => {
      try {
        const response = await fetch(
          `steam/api/appdetails?appids=${appId}&cc=jp`
        );
        const data = await response.json();
        const genres = data[appId].data.genres.map(genre => genre.description);
        setGameGenres(genres);

        // 一致度を計算
        const matchCount = genres.filter(genre => predefinedGenres.includes(genre)).length;
        setMatchPercentage((matchCount / predefinedGenres.length) * 100);
      } catch (error) {
        console.error("Error fetching game genres:", error);
      }
    };
    fetchGameGenres();
  }, [appId]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">一致度</h3>
      <p>{gameTitle}との一致度：{matchPercentage}%</p>
      <div className="flex flex-col gap-2">
        <input type="range" min="0" max="100" value={matchPercentage} className="w-full" readOnly />
      </div>
    </div>
  );
};

