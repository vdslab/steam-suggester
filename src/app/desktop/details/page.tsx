/* pages/game/[id]/page.tsx */
'use client'; // クライアントコンポーネントとして扱う

import React, { useState, useEffect } from 'react';
import GameTitle from "@/components/common/GameTitle";
import { DetailsHeader } from "@/components/common/Headers";
import DistributorVideos from "@/components/distributorVideos/DistributorVideos";
import GameExplanation from "@/components/GameExplanation/GameExplanation";
import Popularity from "@/components/popularity/Popularity";
import SimilarGames from "@/components/simlarGames/SimilarGames";
import UserSelection from '@/components/GameExplanation/UserSelection'; // UserSelection のインポート
import CircularProgress from '@mui/material/CircularProgress';

import { getFilterData } from '@/hooks/indexedDB';
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";

export default function Page({ searchParams }: { searchParams: { steam_id?: string; twitch_id?: string } }) {
  const steamGameId = searchParams.steam_id || "";
  const twitchGameId = searchParams.twitch_id || "";

  const [filterData, setFilterData] = useState<{
    genres: string[];
    priceRange: { startPrice: number; endPrice: number };
    modes: string[];
    devices: string[];
    playtimes: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const data = await getFilterData();
        if (data) {
          const genres = Object.keys(data.Genres).filter((genre) => data.Genres[genre]);
          const priceRange = {
            startPrice: data.Price.startPrice,
            endPrice: data.Price.endPrice,
          };
          const modes = [];
          if (data.Mode.isSinglePlayer) modes.push("Single Player");
          if (data.Mode.isMultiPlayer) modes.push("Multiplayer");
          const devices = [];
          if (data.Device.windows) devices.push("Windows");
          if (data.Device.mac) devices.push("Mac");
          const playtimes = Object.keys(data.Playtime).filter((time) => data.Playtime[time]);

          setFilterData({ genres, priceRange, modes, devices, playtimes });
        } else {
          setError("フィルターデータが見つかりませんでした。");
        }
      } catch (err) {
        console.error(err);
        setError("フィルターデータの取得中にエラーが発生しました。");
      }
    };

    fetchFilterData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!filterData) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <DetailsHeader />
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* サイドバー */}
        <aside className="w-full lg:w-1/4 bg-stone-950 p-4 overflow-y-auto">
          <SimilarGames steamGameId={steamGameId} twitchGameId={twitchGameId} />
        </aside>
        
        {/* メインコンテンツ */}
        <main className="w-full lg:w-3/4 bg-gray-900 p-6 overflow-y-auto">
          
          {/* ゲームタイトル */}
          <div className="mb-6">
            <GameTitle steamGameId={steamGameId} twitchGameId={twitchGameId} />
          </div>

          {/* フィルターとゲーム説明を横並びに配置 */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* ユーザー選択フィルターの表示 */}
            <div className="lg:w-1/3">
              <UserSelection
                genres={filterData.genres}
                priceRange={filterData.priceRange}
                modes={filterData.modes}
                devices={filterData.devices}
                playtimes={filterData.playtimes}
              />
            </div>

            {/* ゲーム詳細セクション */}
            <div className="lg:w-2/3">
              <GameExplanation
                steamGameId={steamGameId}
                twitchGameId={twitchGameId}
                genres={filterData.genres}
                priceRange={filterData.priceRange}
                modes={filterData.modes}
                devices={filterData.devices}
                playtimes={filterData.playtimes}
              />
            </div>
          </div>

          {/* 人気度と配信者クリップ */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Popularity twitchGameId={twitchGameId} steamGameId={steamGameId}/>
            <DistributorVideos twitchGameId={twitchGameId} steamGameId={steamGameId} />
          </section>

        </main>
      </div>
    </>
  );
}
